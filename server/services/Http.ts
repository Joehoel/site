import { Effect, Layer, Schedule } from "effect";
import { HttpClient } from "effect/http";

/**
 * Transport policy for third-party APIs, applied once to the HttpClient every service uses:
 * an 8s timeout per attempt and one retry with backoff for transient failures
 * (network errors, timeouts, 429, 5xx). Layered over any HttpClient, so tests reuse it with a mock.
 */
export const HttpPolicy = Layer.effect(
  HttpClient.HttpClient,
  Effect.gen(function* () {
    const client = yield* HttpClient.HttpClient;
    return client.pipe(
      HttpClient.timeout("8 seconds"),
      HttpClient.retryTransient({ times: 1, schedule: Schedule.exponential("250 millis") }),
    );
  }),
);
