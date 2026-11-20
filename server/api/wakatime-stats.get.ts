import { Array as Arr, Effect, Number as Num, Option, pipe } from "effect";
import { WakaTime, aiModels, type CodingStats, type Day } from "../services/WakaTime";

type Inputs = {
  readonly coding: CodingStats;
  readonly days: Option.Option<ReadonlyArray<Day>>;
  readonly colors: ReadonlyMap<string, string | null>;
};

const AI_CODING = "AI Coding";
const orZero = Option.getOrElse(() => 0);
/** `part` as a percentage of `whole`, 0 when `whole` is 0. */
const percentOf = (part: number, whole: number) =>
  pipe(
    Num.divide(part, whole),
    Option.map((ratio) => Math.round(ratio * 100)),
    orZero,
  );
const named =
  (name: string) =>
  <T extends { readonly name: string }>(item: T) =>
    item.name === name;

/** The top `count` entries, without WakaTime's "Other" bucket, percentages to one decimal. */
const top =
  (count: number) =>
  <T extends { readonly name: string; readonly percent: number }>(items: ReadonlyArray<T>) =>
    pipe(
      items,
      Arr.filter((item) => item.name !== "Other"),
      Arr.take(count),
      Arr.map((item) => ({ ...item, percent: Num.round(item.percent, 1) })),
    );

/** Seconds per day, split into AI and other coding. */
const toSeries = Arr.map(({ date, total, categories }: Day) => {
  const ai = pipe(
    categories,
    Arr.findFirst(named(AI_CODING)),
    Option.map((c) => c.total),
    orZero,
  );
  return { date, ai: Math.round(ai), other: Math.round(Math.max(total - ai, 0)) };
});

/** The Brag page's view of the stats; `None` when there's no coding time to show. */
const toResponse = ({ coding: { range, stats }, days, colors }: Inputs) =>
  pipe(
    Option.liftPredicate(stats, (s) => s.total_seconds > 0),
    Option.map((s) => ({
      range,
      totalSeconds: Math.round(s.total_seconds),
      dailyAverageSeconds: Math.round(s.daily_average),
      daysCoded: s.days_including_holidays - s.holidays,
      bestDay: pipe(
        s.best_day,
        Option.map((day) => ({ date: day.date, seconds: Math.round(day.total_seconds) })),
        Option.getOrNull,
      ),
      ai: pipe(
        s.categories,
        Arr.findFirst(named(AI_CODING)),
        Option.filter((category) => category.total_seconds > 0),
        Option.map((category) => ({
          seconds: Math.round(category.total_seconds),
          percent: Num.round(category.percent, 1),
        })),
        Option.getOrNull,
      ),
      languages: pipe(
        top(6)(s.languages),
        Arr.map((language) => ({
          name: language.name,
          percent: language.percent,
          color: colors.get(language.name) ?? null,
          aiPercent: percentOf(language.ai_coding_seconds, language.total_seconds),
        })),
      ),
      editors: pipe(
        top(4)(s.editors),
        Arr.map(({ name, percent }) => ({ name, percent })),
      ),
      aiModels: aiModels(s),
      agents: pipe(
        s.ai_sessions,
        Option.filter((sessions) => sessions > 0),
        Option.map((sessions) => ({
          sessions,
          prompts: orZero(s.ai_prompt_events_total),
          additions: orZero(s.ai_additions),
          deletions: orZero(s.ai_deletions),
          inputTokens: orZero(s.ai_input_tokens),
          outputTokens: orZero(s.ai_output_tokens),
        })),
        Option.getOrNull,
      ),
      /** Only with a token: the public profile has no per-day series. */
      days: pipe(days, Option.map(toSeries), Option.getOrNull),
    })),
  );

/**
 * WakaTime coding stats for the Brag page. Prerendered; runs at build time only.
 * The stats are required; the per-day series and language colours degrade on their own.
 * The body is always an object (`stats: null` hides the section): a bare `null` body is never
 * written as a static file, which would leave a live endpoint that spends the token.
 */
export default defineEffectHandler(
  Effect.gen(function* () {
    const wakatime = yield* WakaTime;
    const inputs = yield* Effect.all(
      {
        coding: wakatime.stats,
        days: wakatime.days.pipe(
          Effect.tapError(logDegraded),
          Effect.orElseSucceed(() => Option.none<ReadonlyArray<Day>>()),
        ),
        colors: wakatime.languageColors.pipe(
          Effect.tapError(logDegraded),
          Effect.orElseSucceed((): ReadonlyMap<string, string | null> => new Map()),
        ),
      },
      { concurrency: "unbounded" },
    );

    const response = toResponse(inputs);
    if (Option.isNone(response)) {
      yield* Effect.logWarning("WakaTime returned no coding time; the section will be hidden");
      return { stats: null };
    }

    const stats = response.value;
    yield* Effect.logInfo("WakaTime stats loaded").pipe(
      Effect.annotateLogs({
        range: stats.range,
        totalHours: Math.round(stats.totalSeconds / 3600),
        aiPercent: stats.ai?.percent ?? 0,
        days: stats.days?.length ?? 0,
        languages: stats.languages.length,
      }),
    );
    return { stats };
  }).pipe(
    Effect.catchTag("WakaTimeError", (error) =>
      logDegraded(error).pipe(Effect.as({ stats: null })),
    ),
  ),
  { fallback: { stats: null } },
);
