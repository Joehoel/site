import { Config, Context, Effect, Layer, Option, Redacted, Schema } from "effect";
import {
  GraphQL,
  GraphQLClient,
  GraphQLGroup,
  GraphQLMiddleware,
  GraphQLProtocol,
} from "effect/graphql";

const ContributionCalendar = Schema.Struct({
  totalContributions: Schema.Int,
  weeks: Schema.Array(
    Schema.Struct({
      contributionDays: Schema.Array(
        Schema.Struct({
          date: Schema.String,
          contributionCount: Schema.Int,
          contributionLevel: Schema.Literals([
            "NONE",
            "FIRST_QUARTILE",
            "SECOND_QUARTILE",
            "THIRD_QUARTILE",
            "FOURTH_QUARTILE",
          ]),
        }),
      ),
    }),
  ),
});
export type ContributionCalendar = typeof ContributionCalendar.Type;

export const Contributions = GraphQL.query("Contributions", {
  document: `query Contributions($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks { contributionDays { date contributionCount contributionLevel } }
        }
      }
    }
  }`,
  variables: { login: Schema.String },
  result: Schema.Struct({
    user: Schema.NullOr(
      Schema.Struct({
        contributionsCollection: Schema.Struct({ contributionCalendar: ContributionCalendar }),
      }),
    ),
  }),
});

export class GitHubError extends Schema.TaggedError<GitHubError>()("GitHubError", {
  reason: Schema.Literals([
    "MissingToken",
    "Unauthorized",
    "Unavailable",
    "InvalidResponse",
    "QueryFailed",
  ]),
  status: Schema.optional(Schema.Number),
  detail: Schema.optional(Schema.String),
}) {
  override get message() {
    const status = this.status ? ` (HTTP ${this.status})` : "";
    const detail = this.detail ? `: ${this.detail}` : "";
    return `GitHub contributions unavailable, ${this.reason}${status}${detail}`;
  }
}

class GitHubAuth extends GraphQLMiddleware.Service<GitHubAuth>()("site/server/GitHubAuth") {
  static readonly layer = (token: Redacted.Redacted) =>
    Layer.succeed(
      GitHubAuth,
      GraphQLMiddleware.mapRequest((request) =>
        Effect.succeed({
          ...request,
          headers: { ...request.headers, authorization: `bearer ${Redacted.value(token)}` },
        }),
      ),
    );
}

const Api = GraphQLGroup.make(Contributions).middleware(GitHubAuth);

/** GitHub's GraphQL API. Without NUXT_GITHUB_TOKEN every call fails with `MissingToken`. */
export class GitHub extends Context.Service<
  GitHub,
  {
    readonly contributions: (login: string) => Effect.Effect<ContributionCalendar, GitHubError>;
  }
>()("site/server/GitHub") {
  private static readonly live = (token: Redacted.Redacted) =>
    Layer.effect(
      GitHub,
      Effect.gen(function* () {
        const client = yield* GraphQLClient.make(Api);
        return GitHub.of({
          contributions: Effect.fn("GitHub.contributions")(function* (login: string) {
            const { user } = yield* client.Contributions({ login }).pipe(
              Effect.catchTag("GraphQLClientError", ({ reason, status }) =>
                Effect.fail(
                  new GitHubError({
                    reason:
                      reason._tag === "ResponseError"
                        ? "QueryFailed"
                        : reason._tag === "DecodeError"
                          ? "InvalidResponse"
                          : status === 401 || status === 403
                            ? "Unauthorized"
                            : "Unavailable",
                    status,
                    detail: reason.message,
                  }),
                ),
              ),
            );
            if (!user) {
              return yield* new GitHubError({ reason: "QueryFailed", detail: `No user ${login}` });
            }
            return user.contributionsCollection.contributionCalendar;
          }),
        });
      }),
    ).pipe(
      Layer.provide(GitHubAuth.layer(token)),
      Layer.provide(GraphQLProtocol.layerHttp({ url: "https://api.github.com/graphql" })),
    );

  private static readonly disabled = Layer.succeed(
    GitHub,
    GitHub.of({ contributions: () => Effect.fail(new GitHubError({ reason: "MissingToken" })) }),
  );

  static readonly layer = Layer.unwrap(
    Effect.gen(function* () {
      const token = yield* Config.option(Config.Redacted("githubToken"));
      return Option.match(token, { onNone: () => GitHub.disabled, onSome: GitHub.live });
    }),
  );
}
