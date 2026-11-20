import { Effect, Option } from "effect";
import { WakaTime, aiModels, type Day } from "../services/WakaTime";

const round1 = (value: number) => Math.round(value * 10) / 10;

const top = <T extends { readonly name: string; readonly percent: number }>(
  items: ReadonlyArray<T>,
  count: number,
) =>
  items
    .filter((item) => item.name !== "Other")
    .slice(0, count)
    .map((item) => ({ ...item, percent: round1(item.percent) }));

/**
 * WakaTime coding stats for the Brag page. Prerendered; runs at build time only.
 * The stats are required (the section hides without them); the per-day series and
 * language colours are optional and degrade on their own. `stats: null` hides the section.
 */
export default defineEffectHandler(
  Effect.gen(function* () {
    const wakatime = yield* WakaTime;
    const [{ source, range, stats }, days, colors] = yield* Effect.all(
      [
        wakatime.stats,
        wakatime.days.pipe(
          Effect.tapError(logDegraded),
          Effect.orElseSucceed(() => Option.none<ReadonlyArray<Day>>()),
        ),
        wakatime.languageColors.pipe(
          Effect.tapError(logDegraded),
          Effect.orElseSucceed((): ReadonlyMap<string, string | null> => new Map()),
        ),
      ],
      { concurrency: "unbounded" },
    );

    if (!stats.total_seconds) {
      yield* Effect.logWarning("WakaTime returned no coding time; the section will be hidden");
      return null;
    }

    const ai = stats.categories?.find((category) => category.name === "AI Coding");
    const series = days.pipe(
      Option.map((days) =>
        days.map(({ date, total, categories }) => {
          const aiSeconds = categories.find((c) => c.name === "AI Coding")?.total ?? 0;
          return {
            date,
            ai: Math.round(aiSeconds),
            other: Math.round(Math.max(total - aiSeconds, 0)),
          };
        }),
      ),
      Option.getOrNull,
    );

    yield* Effect.logInfo("WakaTime stats loaded").pipe(
      Effect.annotateLogs({
        source,
        totalHours: Math.round(stats.total_seconds / 3600),
        aiPercent: ai ? round1(ai.percent) : 0,
        days: series?.length ?? 0,
        colors: colors.size > 0,
      }),
    );

    return {
      range,
      totalSeconds: Math.round(stats.total_seconds),
      dailyAverageSeconds: Math.round(stats.daily_average),
      daysCoded: stats.days_including_holidays - stats.holidays,
      bestDay: stats.best_day
        ? { date: stats.best_day.date, seconds: Math.round(stats.best_day.total_seconds) }
        : null,
      ai: ai?.total_seconds
        ? { seconds: Math.round(ai.total_seconds), percent: round1(ai.percent) }
        : null,
      languages: top(stats.languages, 6).map((language) => ({
        name: language.name,
        percent: language.percent,
        color: colors.get(language.name) ?? null,
        aiPercent: language.total_seconds
          ? Math.round(((language.ai_coding_seconds ?? 0) / language.total_seconds) * 100)
          : 0,
      })),
      editors: top(stats.editors, 4).map(({ name, percent }) => ({ name, percent })),
      aiModels: aiModels(stats),
      agents: stats.ai_sessions
        ? {
            sessions: stats.ai_sessions,
            prompts: stats.ai_prompt_events_total ?? 0,
            additions: stats.ai_additions ?? 0,
            deletions: stats.ai_deletions ?? 0,
            inputTokens: stats.ai_input_tokens ?? 0,
            outputTokens: stats.ai_output_tokens ?? 0,
          }
        : null,
      /** Seconds per day, split into AI and other coding. Only with a token. */
      days: series,
    };
  }).pipe(
    Effect.catchTag("WakaTimeError", (error) => logDegraded(error).pipe(Effect.as(null))),
    // Always an object: a bare `null` body is never written as a static file, which would leave
    // a live endpoint that spends the token.
    Effect.map((stats) => ({ stats })),
  ),
  { fallback: { stats: null } },
);
