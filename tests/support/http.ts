import { Effect, Layer } from "effect";
import { HttpClient, HttpClientResponse } from "effect/http";

export type Reply = { readonly status?: number; readonly body?: unknown };

/**
 * A fake HttpClient answering by URL path. A path with several replies answers them in order
 * (the last one repeats). Every request is recorded in `requests`.
 */
export const mockHttp = (routes: Record<string, ReadonlyArray<Reply>>) => {
  const requests: Array<{ path: string; authorization: string | undefined }> = [];
  const queues = new Map(Object.entries(routes).map(([path, replies]) => [path, [...replies]]));
  const layer = Layer.succeed(
    HttpClient.HttpClient,
    HttpClient.make((request, url) => {
      requests.push({ path: url.pathname, authorization: request.headers.authorization });
      const queue = queues.get(url.pathname) ?? [{ status: 404, body: {} }];
      const reply = (queue.length > 1 ? queue.shift() : queue[0]) ?? {};
      return Effect.succeed(
        HttpClientResponse.fromWeb(
          request,
          Response.json(reply.body ?? {}, { status: reply.status ?? 200 }),
        ),
      );
    }),
  );
  return { layer, requests };
};
