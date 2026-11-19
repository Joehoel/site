import type { ErrorOptions } from "evlog";
import type { NitroFetchOptions } from "nitropack";

type UpstreamOptions = NitroFetchOptions<string> &
  // `fix` is evlog's own field, required here so every failure says how to resolve it.
  Required<Pick<ErrorOptions, "fix">> & {
    /** Short name used as the wide-event key (`upstream.<name>`) and in the error message. */
    name: string;
  };

/** Status code of an ofetch FetchError, if the request got a response at all. */
function statusOf(error: unknown) {
  return error instanceof Error && "status" in error && typeof error.status === "number"
    ? error.status
    : null;
}

/**
 * Fetch a third-party API and record the call on the request's wide event as
 * `upstream.<name>` (ok, status, ms). A failure is logged as a structured error and
 * returns `null`: these build-time routes degrade to "no data" instead of throwing,
 * because a failed prerender would leave a live endpoint that spends the token.
 *
 * Only status and message are logged, never the raw FetchError: its `options` carry the
 * request headers, including `Authorization`.
 */
export async function fetchUpstream<T>(
  url: string,
  { name, fix, ...options }: UpstreamOptions,
): Promise<T | null> {
  // The current request comes from Nitro's async context (nitro.experimental.asyncContext).
  const log = useLogger(useEvent());
  const start = performance.now();
  const ms = () => Math.round(performance.now() - start);
  try {
    const data = await $fetch<T>(url, { retry: 1, timeout: 8000, ...options });
    log.set({ upstream: { [name]: { ok: true, ms: ms() } } });
    return data;
  } catch (error) {
    const status = statusOf(error);
    log.set({ upstream: { [name]: { ok: false, status, ms: ms() } } });
    log.error(
      createEvlogError({
        message: `${name} request failed`,
        status: 502,
        why: status
          ? `Upstream responded with ${status}`
          : error instanceof Error
            ? error.message
            : "Network error",
        fix,
      }),
    );
    return null;
  }
}
