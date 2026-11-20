import { assert, describe, it } from "@effect/vitest";
import { ConfigProvider, Effect, Layer } from "effect";
import { GitHub } from "../server/services/GitHub.ts";
import { HttpPolicy } from "../server/services/Http.ts";
import { mockHttp, type Reply } from "./support/http.ts";

const calendar = {
  totalContributions: 3,
  weeks: [
    {
      contributionDays: [
        { date: "2026-11-01", contributionCount: 3, contributionLevel: "FIRST_QUARTILE" },
      ],
    },
  ],
};
const ok = (user: unknown): Reply => ({ body: { data: { user } } });

const run = <A, E>(
  program: Effect.Effect<A, E, GitHub>,
  replies: ReadonlyArray<Reply>,
  token = "gh_test",
) => {
  const http = mockHttp({ "/graphql": replies });
  const layer = GitHub.layer.pipe(
    Layer.provide(HttpPolicy),
    Layer.provide(http.layer),
    Layer.provide(ConfigProvider.layer(ConfigProvider.fromUnknown({ githubToken: token }))),
  );
  return program.pipe(
    Effect.provide(layer),
    Effect.map((value) => ({ value, requests: http.requests })),
  );
};
const contributions = GitHub.use((github) => github.contributions("Joehoel"));
const failure = GitHub.use((github) => Effect.flip(github.contributions("Joehoel")));

describe("GitHub", () => {
  it.effect("returns the contribution calendar, authorised with the token", () =>
    Effect.gen(function* () {
      const { value, requests } = yield* run(contributions, [
        ok({ contributionsCollection: { contributionCalendar: calendar } }),
      ]);
      assert.deepStrictEqual(value, calendar);
      assert.deepStrictEqual(requests, [{ path: "/graphql", authorization: "bearer gh_test" }]);
    }),
  );

  it.effect("fails with MissingToken without calling GitHub", () =>
    Effect.gen(function* () {
      const { value, requests } = yield* run(failure, [], "");
      assert.strictEqual(value.reason, "MissingToken");
      assert.lengthOf(requests, 0);
    }),
  );

  it.effect("maps a 401 to Unauthorized", () =>
    Effect.gen(function* () {
      const { value } = yield* run(failure, [
        { status: 401, body: { message: "Bad credentials" } },
      ]);
      assert.strictEqual(value.reason, "Unauthorized");
      assert.strictEqual(value.status, 401);
      assert.notInclude(value.message, "gh_test");
    }),
  );

  it.effect("maps GraphQL errors in a 200 to QueryFailed", () =>
    Effect.gen(function* () {
      const { value } = yield* run(failure, [
        { body: { data: null, errors: [{ message: "Something went wrong" }] } },
      ]);
      assert.strictEqual(value.reason, "QueryFailed");
      assert.include(value.message, "Something went wrong");
    }),
  );

  it.effect("fails with QueryFailed for an unknown user", () =>
    Effect.gen(function* () {
      const { value } = yield* run(failure, [ok(null)]);
      assert.strictEqual(value.reason, "QueryFailed");
    }),
  );

  it.effect("reports a changed response shape as InvalidResponse", () =>
    Effect.gen(function* () {
      const { value } = yield* run(failure, [ok({ contributionsCollection: {} })]);
      assert.strictEqual(value.reason, "InvalidResponse");
    }),
  );
});
