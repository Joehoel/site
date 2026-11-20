import { Config, Context, Effect, Layer, Option, Schema, identity } from "effect";
import { HttpClient, HttpClientError, HttpClientRequest } from "effect/http";
import { HttpApi, HttpApiClient, HttpApiEndpoint, HttpApiGroup } from "effect/http-api";

const USER = "joehoel";

const Share = Schema.Struct({ name: Schema.String, percent: Schema.Number });
const Category = Schema.Struct({
  name: Schema.String,
  percent: Schema.Number,
  total_seconds: Schema.Number,
});
const Language = Schema.Struct({
  name: Schema.String,
  percent: Schema.Number,
  total_seconds: Schema.Number,
  // WakaTime sends this as a numeric string.
  ai_coding_seconds: Schema.optional(Schema.Union([Schema.NumberFromString, Schema.Number])),
});
const OptionalNumber = Schema.optional(Schema.NullOr(Schema.Number));

const Stats = Schema.Struct({
  total_seconds: Schema.Number,
  daily_average: Schema.Number,
  human_readable_range: Schema.String,
  days_including_holidays: Schema.Number,
  holidays: Schema.Number,
  best_day: Schema.optional(
    Schema.NullOr(Schema.Struct({ date: Schema.String, total_seconds: Schema.Number })),
  ),
  languages: Schema.Array(Language),
  editors: Schema.Array(Share),
  categories: Schema.optional(Schema.Array(Category)),
  // Public stats: a percentage per "AI model" (which mixes models and harnesses).
  ai_models: Schema.optional(Schema.Array(Share)),
  // Private stats only.
  ai_model_breakdown: Schema.optional(
    Schema.Array(Schema.Struct({ name: Schema.String, lines: Schema.Number })),
  ),
  ai_sessions: OptionalNumber,
  ai_prompt_events_total: OptionalNumber,
  ai_additions: OptionalNumber,
  ai_deletions: OptionalNumber,
  ai_input_tokens: OptionalNumber,
  ai_output_tokens: OptionalNumber,
});
export type Stats = typeof Stats.Type;

const Day = Schema.Struct({
  date: Schema.String,
  total: Schema.Number,
  categories: Schema.Array(Schema.Struct({ name: Schema.String, total: Schema.Number })),
});
export type Day = typeof Day.Type;

const ProgramLanguage = Schema.Struct({ name: Schema.String, color: Schema.NullOr(Schema.String) });

/** The slice of WakaTime's REST API (https://wakatime.com/developers) the Brag page uses. */
export class WakaTimeApi extends HttpApi.make("wakatime")
  .add(
    HttpApiGroup.make("stats").add(
      HttpApiEndpoint.get("lastYear", "/users/current/stats/last_year", {
        success: Schema.Struct({ data: Stats }),
      }),
      HttpApiEndpoint.get("allTime", "/users/:user/stats/all_time", {
        params: { user: Schema.String },
        success: Schema.Struct({ data: Stats }),
      }),
    ),
  )
  .add(
    HttpApiGroup.make("insights").add(
      HttpApiEndpoint.get("days", "/users/current/insights/days/last_year", {
        success: Schema.Struct({ data: Schema.Struct({ days: Schema.Array(Day) }) }),
      }),
    ),
  )
  .add(
    HttpApiGroup.make("meta").add(
      HttpApiEndpoint.get("programLanguages", "/program_languages", {
        success: Schema.Struct({ data: Schema.Array(ProgramLanguage) }),
      }),
    ),
  ) {}

// WakaTime's "AI model" mixes model names with harness names (OpenCode, Pi, VS Code…), and splits
// Claude into Claude/Opus/Sonnet/… Group real models into families; harness-only lines have no
// known model (colour null → neutral on the client).
const FAMILIES: Record<string, { family: string; color: string }> = {
  Claude: { family: "Claude", color: "#d97757" },
  Opus: { family: "Claude", color: "#d97757" },
  Sonnet: { family: "Claude", color: "#d97757" },
  Haiku: { family: "Claude", color: "#d97757" },
  Fable: { family: "Claude", color: "#d97757" },
  GPT: { family: "GPT", color: "#10a37f" },
  Gemini: { family: "Gemini", color: "#4285f4" },
};
const UNKNOWN = { family: "Model unknown", color: null };

/** Share of AI line changes per model family (private), or of AI time (public). */
export function aiModels(stats: Pick<Stats, "ai_model_breakdown" | "ai_models">) {
  const rows = stats.ai_model_breakdown?.length
    ? stats.ai_model_breakdown.map(({ name, lines }) => ({ name, value: lines }))
    : (stats.ai_models ?? []).map(({ name, percent }) => ({ name, value: percent }));
  const totals = new Map<string, { color: string | null; value: number }>();
  for (const { name, value } of rows) {
    const { family, color } = FAMILIES[name] ?? UNKNOWN;
    totals.set(family, { color, value: (totals.get(family)?.value ?? 0) + value });
  }
  const sum = [...totals.values()].reduce((a, b) => a + b.value, 0);
  return [...totals]
    .filter(([, { value }]) => value > 0)
    .map(([name, { color, value }]) => ({
      name,
      color,
      percent: Math.round((value / sum) * 1000) / 10,
    }))
    .toSorted(
      // Known families by size, the unknown bucket last.
      (a, b) => Number(!a.color) - Number(!b.color) || b.percent - a.percent,
    );
}

export class WakaTimeError extends Schema.TaggedError<WakaTimeError>()("WakaTimeError", {
  reason: Schema.Literals(["Unauthorized", "Unavailable", "InvalidResponse"]),
  status: Schema.optional(Schema.Number),
  detail: Schema.optional(Schema.String),
}) {
  override get message() {
    const status = this.status ? ` (HTTP ${this.status})` : "";
    const detail = this.detail ? `: ${this.detail}` : "";
    return `WakaTime request failed, ${this.reason}${status}${detail}`;
  }
}

const toWakaTimeError = (error: HttpClientError.HttpClientError | Schema.SchemaError) => {
  if (error._tag === "SchemaError") {
    return new WakaTimeError({ reason: "InvalidResponse", detail: error.message });
  }
  const status = error.response?.status;
  return new WakaTimeError({
    reason:
      status === 401 || status === 403
        ? "Unauthorized"
        : status === 200 && error.reason._tag === "DecodeError"
          ? "InvalidResponse"
          : "Unavailable",
    status,
  });
};

export type CodingStats = {
  /** "private" with NUXT_WAKATIME_TOKEN (past year), "public" without (all time). */
  readonly source: "private" | "public";
  readonly range: string;
  readonly stats: Stats;
};

/**
 * WakaTime's API. With NUXT_WAKATIME_TOKEN it reads the private past-year stats and per-day
 * insights; without, the public all-time profile, which has no per-day series.
 */
export class WakaTime extends Context.Service<
  WakaTime,
  {
    readonly stats: Effect.Effect<CodingStats, WakaTimeError>;
    /** `None` without a token: only the private API has per-day insights. */
    readonly days: Effect.Effect<Option.Option<ReadonlyArray<Day>>, WakaTimeError>;
    /** Linguist colour per language name. */
    readonly languageColors: Effect.Effect<ReadonlyMap<string, string | null>, WakaTimeError>;
  }
>()("site/server/WakaTime") {
  static readonly layer = Layer.effect(
    WakaTime,
    Effect.gen(function* () {
      const token = yield* Config.option(Config.Redacted("wakatimeToken"));
      const api = yield* HttpApiClient.make(WakaTimeApi, {
        baseUrl: "https://wakatime.com/api/v1",
        transformClient: Option.match(token, {
          onNone: () => identity,
          onSome: (token) => HttpClient.mapRequest(HttpClientRequest.bearerToken(token)),
        }),
      });

      return WakaTime.of({
        stats: Option.match(token, {
          onSome: () =>
            api.stats.lastYear().pipe(
              Effect.map(
                ({ data }): CodingStats => ({
                  source: "private",
                  range: "past year",
                  stats: data,
                }),
              ),
            ),
          onNone: () =>
            api.stats.allTime({ params: { user: USER } }).pipe(
              Effect.map(
                ({ data }): CodingStats => ({
                  source: "public",
                  range: data.human_readable_range,
                  stats: data,
                }),
              ),
            ),
        }).pipe(Effect.mapError(toWakaTimeError), Effect.withSpan("WakaTime.stats")),

        days: Option.match(token, {
          onSome: () => api.insights.days().pipe(Effect.map(({ data }) => Option.some(data.days))),
          onNone: () => Effect.succeedNone,
        }).pipe(Effect.mapError(toWakaTimeError), Effect.withSpan("WakaTime.days")),

        languageColors: api.meta.programLanguages().pipe(
          Effect.map(({ data }) => new Map(data.map(({ name, color }) => [name, color]))),
          Effect.mapError(toWakaTimeError),
          Effect.withSpan("WakaTime.languageColors"),
        ),
      });
    }),
  );
}
