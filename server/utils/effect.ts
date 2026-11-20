import { Config, ConfigProvider, Effect, Exit, Layer, Logger, ManagedRuntime } from "effect";
import { FetchHttpClient, HttpClient } from "effect/http";
import { Otlp, OtlpSerialization } from "effect/observability";
import { Content } from "../services/Content";
import { CurrentEvent } from "../services/CurrentEvent";
import { GitHub, type GitHubError } from "../services/GitHub";
import { HttpPolicy } from "../services/Http";
import { WakaTime, type WakaTimeError } from "../services/WakaTime";

/** Nuxt runtimeConfig (NUXT_* env) as the services' ConfigProvider, so they read tokens with `Config`. */
const RuntimeConfigProvider = Layer.unwrap(
  Effect.sync(() => ConfigProvider.layer(ConfigProvider.fromUnknown(useRuntimeConfig()))),
);

const ServicesLive = Layer.mergeAll(GitHub.layer, WakaTime.layer).pipe(
  Layer.provide(HttpPolicy),
  Layer.provide(FetchHttpClient.layer),
  Layer.provide(RuntimeConfigProvider),
);

/** JSON lines in CI (Vercel builds set CI=1), pretty locally. Log lines also become span events. */
const LoggerLive = Layer.unwrap(
  Effect.gen(function* () {
    const ci = yield* Config.Boolean("CI").pipe(Config.withDefault(false));
    return Logger.layer([ci ? Logger.consoleJson : Logger.consolePretty(), Logger.tracerLogger]);
  }),
);

/**
 * Exports traces and logs over OTLP only when configured (e.g. in Vercel env):
 * OTEL_EXPORTER_OTLP_ENDPOINT, OTEL_EXPORTER_OTLP_HEADERS, OTEL_TRACES_EXPORTER=otlp,
 * OTEL_LOGS_EXPORTER=otlp and OTEL_SERVICE_NAME. Without them this layer does nothing.
 */
const OtlpLive = Otlp.layerFromConfig().pipe(
  Layer.provide(OtlpSerialization.layerJson),
  Layer.provide(FetchHttpClient.layer),
);

export const runtime = ManagedRuntime.make(
  Layer.mergeAll(
    ServicesLive,
    LoggerLive,
    OtlpLive,
    // Don't send traceparent/b3 headers to third-party APIs.
    Layer.succeed(HttpClient.TracerPropagationEnabled, false),
  ),
);

type Services = ManagedRuntime.ManagedRuntime.Services<typeof runtime>;

/**
 * An h3 handler that runs `program` on the shared Effect runtime inside a root server span,
 * with the request's `CurrentEvent` and `Content` provided. A failure is logged with its cause,
 * then answered with `fallback` when given, otherwise a 500. Build-time routes pass a fallback:
 * a failed prerender would leave a live endpoint that spends their token.
 */
export const defineEffectHandler = <A, E>(
  program: Effect.Effect<A, E, Services | CurrentEvent | Content>,
  options: { readonly fallback?: A } = {},
) =>
  defineEventHandler(async (event) => {
    const exit = await runtime.runPromiseExit(
      program.pipe(
        Effect.tapCause((cause) => Effect.logError("Request failed", cause)),
        Effect.provide(Content.layer),
        Effect.provideService(CurrentEvent, event),
        Effect.annotateLogs({ route: event.path }),
        Effect.withSpan(`${event.method} ${event.path}`, {
          root: true,
          kind: "server",
          attributes: { "http.request.method": event.method, "url.path": event.path },
        }),
      ),
    );
    if (Exit.isSuccess(exit)) return exit.value;
    if (options.fallback !== undefined) return options.fallback;
    throw createError({ statusCode: 500, statusMessage: "Internal Server Error" });
  });

/** An expected upstream failure the page degrades around: one warning with what failed and why. */
export const logDegraded = (error: GitHubError | WakaTimeError) =>
  Effect.logWarning(error.message).pipe(
    Effect.annotateLogs({
      error: error._tag,
      reason: error.reason,
      status: error.status,
    }),
  );
