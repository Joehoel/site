import { OtelTracer } from "@effect/opentelemetry";
import { context, propagation, trace } from "@opentelemetry/api";
import { Config, ConfigProvider, Effect, Exit, Layer, Logger, ManagedRuntime } from "effect";
import { FetchHttpClient, HttpClient } from "effect/http";
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

export const runtime = ManagedRuntime.make(
  Layer.mergeAll(
    ServicesLive,
    LoggerLive,
    // Effect spans become OpenTelemetry spans on the global provider, which `@vercel/otel`
    // registers at runtime on Vercel (server/plugins/otel.ts). Elsewhere it's a no-op.
    OtelTracer.layerGlobal,
    // Don't send traceparent/b3 headers to third-party APIs.
    Layer.succeed(HttpClient.TracerPropagationEnabled, false),
  ),
);

type Services = ManagedRuntime.ManagedRuntime.Services<typeof runtime>;

/**
 * An h3 handler that runs `program` on the shared Effect runtime inside a server span,
 * with the request's `CurrentEvent` and `Content` provided. A failure is logged with its cause,
 * then answered with `fallback` when given, otherwise a 500. Build-time routes pass a fallback:
 * a failed prerender would leave a live endpoint that spends their token.
 */
export const defineEffectHandler = <A, E>(
  program: Effect.Effect<A, E, Services | CurrentEvent | Content>,
  options: { readonly fallback?: A } = {},
) =>
  defineEventHandler(async (event) => {
    const traced = program.pipe(
      Effect.tapCause((cause) => Effect.logError("Request failed", cause)),
      Effect.provide(Content.layer),
      Effect.provideService(CurrentEvent, event),
      Effect.annotateLogs({ route: event.path }),
      Effect.withSpan(`${event.method} ${event.path}`, {
        kind: "server",
        attributes: { "http.request.method": event.method, "url.path": event.path },
      }),
    );
    // On Vercel, nest under the invocation's request span (read by @vercel/otel's propagator).
    const parent = trace.getSpanContext(
      propagation.extract(context.active(), getRequestHeaders(event)),
    );
    const exit = await runtime.runPromiseExit(
      parent ? OtelTracer.withSpanContext(traced, parent) : traced,
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
