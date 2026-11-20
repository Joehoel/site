import { Context } from "effect";
import type { H3Event } from "h3";

/** The h3 event of the request being handled; provided per request by `defineEffectHandler`. */
export class CurrentEvent extends Context.Service<CurrentEvent, H3Event>()(
  "site/server/CurrentEvent",
) {}
