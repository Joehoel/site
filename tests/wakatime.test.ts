import { assert, describe, it } from "@effect/vitest";
import { ConfigProvider, Effect, Layer, Option } from "effect";
import { HttpPolicy } from "../server/services/Http.ts";
import { WakaTime, aiModels } from "../server/services/WakaTime.ts";
import { mockHttp, type Reply } from "./support/http.ts";

const stats = {
  total_seconds: 7_200_000,
  daily_average: 20_000,
  human_readable_range: "since May 20 2019",
  days_including_holidays: 400,
  holidays: 40,
  best_day: { date: "2026-03-01", total_seconds: 40_000 },
  languages: [
    { name: "TypeScript", percent: 61.23, total_seconds: 100, ai_coding_seconds: "25.5" },
  ],
  editors: [{ name: "Zed", percent: 80 }],
  categories: [{ name: "AI Coding", percent: 30, total_seconds: 2_000_000 }],
};
const days = { data: { days: [{ date: "2026-11-01", total: 3600, categories: [] }] } };
const languages = { data: [{ name: "TypeScript", color: "#3178c6" }] };

const run = <A, E>(
  program: Effect.Effect<A, E, WakaTime>,
  routes: Record<string, ReadonlyArray<Reply>>,
  token?: string,
) => {
  const http = mockHttp(routes);
  const layer = WakaTime.layer.pipe(
    Layer.provide(HttpPolicy),
    Layer.provide(http.layer),
    Layer.provide(ConfigProvider.layer(ConfigProvider.fromUnknown({ wakatimeToken: token ?? "" }))),
  );
  return program.pipe(
    Effect.provide(layer),
    Effect.map((value) => ({ value, requests: http.requests })),
  );
};

describe("WakaTime", () => {
  it.effect("reads the private past-year stats and days with a bearer token", () =>
    Effect.gen(function* () {
      const { value, requests } = yield* run(
        WakaTime.use((wakatime) => Effect.all([wakatime.stats, wakatime.days])),
        {
          "/api/v1/users/current/stats/last_year": [{ body: { data: stats } }],
          "/api/v1/users/current/insights/days/last_year": [{ body: days }],
        },
        "waka_test",
      );
      const [result, series] = value;
      assert.strictEqual(result.source, "private");
      assert.strictEqual(result.range, "past year");
      // WakaTime's numeric string is decoded to a number.
      assert.strictEqual(result.stats.languages[0]?.ai_coding_seconds, 25.5);
      assert.strictEqual(Option.getOrThrow(series).length, 1);
      assert.isTrue(requests.every((request) => request.authorization === "Bearer waka_test"));
    }),
  );

  it.effect("falls back to the public all-time profile without a token", () =>
    Effect.gen(function* () {
      const { value, requests } = yield* run(
        WakaTime.use((wakatime) => Effect.all([wakatime.stats, wakatime.days])),
        { "/api/v1/users/joehoel/stats/all_time": [{ body: { data: stats } }] },
      );
      const [result, series] = value;
      assert.strictEqual(result.source, "public");
      assert.strictEqual(result.range, "since May 20 2019");
      assert.isTrue(Option.isNone(series));
      assert.deepStrictEqual(requests, [
        { path: "/api/v1/users/joehoel/stats/all_time", authorization: undefined },
      ]);
    }),
  );

  it.effect("maps a 401 to Unauthorized", () =>
    Effect.gen(function* () {
      const { value } = yield* run(
        WakaTime.use((wakatime) => Effect.flip(wakatime.stats)),
        { "/api/v1/users/current/stats/last_year": [{ status: 401, body: { error: "nope" } }] },
        "waka_test",
      );
      assert.strictEqual(value.reason, "Unauthorized");
      assert.strictEqual(value.status, 401);
      assert.notInclude(value.message, "waka_test");
    }),
  );

  it.live("retries a 503 once, then fails as Unavailable", () =>
    Effect.gen(function* () {
      const { value, requests } = yield* run(
        WakaTime.use((wakatime) => Effect.flip(wakatime.languageColors)),
        { "/api/v1/program_languages": [{ status: 503 }, { status: 503 }] },
      );
      assert.strictEqual(value.reason, "Unavailable");
      assert.strictEqual(requests.length, 2);
    }),
  );

  it.live("recovers when the retry succeeds", () =>
    Effect.gen(function* () {
      const { value } = yield* run(
        WakaTime.use((wakatime) => wakatime.languageColors),
        { "/api/v1/program_languages": [{ status: 503 }, { body: languages }] },
      );
      assert.strictEqual(value.get("TypeScript"), "#3178c6");
    }),
  );

  it.effect("reports a changed response shape as InvalidResponse", () =>
    Effect.gen(function* () {
      const { value } = yield* run(
        WakaTime.use((wakatime) => Effect.flip(wakatime.stats)),
        { "/api/v1/users/joehoel/stats/all_time": [{ body: { data: { total_seconds: "lots" } } }] },
      );
      assert.strictEqual(value.reason, "InvalidResponse");
    }),
  );
});

describe("aiModels", () => {
  it("groups models into families by lines changed, unknown last", () => {
    assert.deepStrictEqual(
      aiModels({
        ai_model_breakdown: [
          { name: "Opus", lines: 300 },
          { name: "OpenCode", lines: 200 },
          { name: "Sonnet", lines: 100 },
          { name: "GPT", lines: 400 },
        ],
        ai_models: [],
      }),
      [
        { name: "Claude", color: "#d97757", percent: 40 },
        { name: "GPT", color: "#10a37f", percent: 40 },
        { name: "Model unknown", color: null, percent: 20 },
      ],
    );
  });

  it("falls back to public AI-time percentages", () => {
    assert.deepStrictEqual(
      aiModels({ ai_model_breakdown: [], ai_models: [{ name: "Gemini", percent: 12.5 }] }),
      [{ name: "Gemini", color: "#4285f4", percent: 100 }],
    );
  });
});
