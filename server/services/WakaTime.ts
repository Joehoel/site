import {
  Array as Arr,
  Config,
  Context,
  Effect,
  Layer,
  Match,
  Number as Num,
  Option,
  Order,
  Record,
  Schema,
  identity,
  pipe,
} from "effect";
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
  // WakaTime sends this as a numeric string, and only for languages with AI time.
  ai_coding_seconds: Schema.Union([Schema.NumberFromString, Schema.Number]).pipe(
    Schema.withDecodingDefault(Effect.succeed(0)),
  ),
});
/** A list WakaTime may leave out: decodes to `[]`. */
const List = <S extends Schema.Top>(item: S) =>
  Schema.Array(item).pipe(Schema.withDecodingDefault(Effect.succeed([])));
/** A value WakaTime may leave out or send as `null`: decodes to an `Option`. */
const Maybe = Schema.OptionFromOptionalNullOr;

const Stats = Schema.Struct({
  total_seconds: Schema.Number,
  daily_average: Schema.Number,
  human_readable_range: Schema.String,
  days_including_holidays: Schema.Number,
  holidays: Schema.Number,
  best_day: Maybe(Schema.Struct({ date: Schema.String, total_seconds: Schema.Number })),
  languages: Schema.Array(Language),
  editors: Schema.Array(Share),
  categories: List(Category),
  // Public stats: a percentage per "AI model" (which mixes models and harnesses).
  ai_models: List(Share),
  // Private stats only.
  ai_model_breakdown: List(Schema.Struct({ name: Schema.String, lines: Schema.Number })),
  ai_sessions: Maybe(Schema.Number),
  ai_prompt_events_total: Maybe(Schema.Number),
  ai_additions: Maybe(Schema.Number),
  ai_deletions: Maybe(Schema.Number),
  ai_input_tokens: Maybe(Schema.Number),
  ai_output_tokens: Maybe(Schema.Number),
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
const modelFamily = Match.type<string>().pipe(
  Match.when(Match.is("Claude", "Opus", "Sonnet", "Haiku", "Fable"), () => ({
    family: "Claude",
    color: "#d97757",
  })),
  Match.when("GPT", () => ({ family: "GPT", color: "#10a37f" })),
  Match.when("Gemini", () => ({ family: "Gemini", color: "#4285f4" })),
  Match.orElse((): { family: string; color: string | null } => ({
    family: "Model unknown",
    color: null,
  })),
);

type ModelShare = {
  readonly name: string;
  readonly color: string | null;
  readonly percent: number;
};

/** Known families by size, the unknown bucket last. */
const byKnownThenSize = Order.combine(
  Order.mapInput(Order.Boolean, (model: ModelShare) => model.color === null),
  Order.flip(Order.mapInput(Order.Number, (model: ModelShare) => model.percent)),
);

/** Share of AI line changes per model family (private), or of AI time (public). */
export const aiModels = (stats: Pick<Stats, "ai_model_breakdown" | "ai_models">) => {
  const rows = Arr.match(stats.ai_model_breakdown, {
    onEmpty: () => Arr.map(stats.ai_models, ({ name, percent }) => ({ name, value: percent })),
    onNonEmpty: Arr.map(({ name, lines }) => ({ name, value: lines })),
  });
  const total = Num.sumAll(Arr.map(rows, (row) => row.value));
  return pipe(
    Arr.groupBy(rows, (row) => modelFamily(row.name).family),
    Record.toEntries,
    Arr.map(
      ([family, members]): ModelShare => ({
        name: family,
        color: modelFamily(members[0].name).color,
        percent: pipe(
          Num.divide(Num.sumAll(Arr.map(members, (row) => row.value)), total),
          Option.map((share) => Num.round(share * 100, 1)),
          Option.getOrElse(() => 0),
        ),
      }),
    ),
    Arr.filter((model) => model.percent > 0),
    Arr.sort(byKnownThenSize),
  );
};

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

const httpReason = (error: HttpClientError.HttpClientError) =>
  Match.value({ status: error.response?.status, kind: error.reason._tag }).pipe(
    Match.withReturnType<WakaTimeError["reason"]>(),
    Match.when({ status: Match.is(401, 403) }, () => "Unauthorized"),
    Match.when({ status: 200, kind: "DecodeError" }, () => "InvalidResponse"),
    Match.orElse(() => "Unavailable"),
  );

const toWakaTimeError = Match.type<HttpClientError.HttpClientError | Schema.SchemaError>().pipe(
  Match.tag(
    "SchemaError",
    (error) => new WakaTimeError({ reason: "InvalidResponse", detail: error.message }),
  ),
  Match.tag(
    "HttpClientError",
    (error) => new WakaTimeError({ reason: httpReason(error), status: error.response?.status }),
  ),
  Match.exhaustive,
);

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
