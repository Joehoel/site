import type { CollectionQueryBuilder, Collections } from "@nuxt/content";
import { queryCollection } from "@nuxt/content/server";
import { Context, Effect, Layer, Schema } from "effect";
import { CurrentEvent } from "./CurrentEvent";

export class ContentError extends Schema.TaggedError<ContentError>()("ContentError", {
  collection: Schema.String,
  cause: Schema.Defect(),
}) {
  override get message() {
    return `Querying the "${this.collection}" content collection failed`;
  }
}

/** Nuxt Content queries for the current request, as Effects. */
export class Content extends Context.Service<
  Content,
  {
    readonly query: <C extends keyof Collections, A>(
      collection: C,
      build: (query: CollectionQueryBuilder<Collections[C]>) => Promise<A>,
    ) => Effect.Effect<A, ContentError>;
  }
>()("site/server/Content") {
  static readonly layer = Layer.effect(
    Content,
    Effect.gen(function* () {
      const event = yield* CurrentEvent;
      return Content.of({
        query: (collection, build) =>
          Effect.tryPromise({
            try: () => build(queryCollection(event, collection)),
            catch: (cause) => new ContentError({ collection, cause }),
          }).pipe(Effect.withSpan("Content.query", { attributes: { collection } })),
      });
    }),
  );
}
