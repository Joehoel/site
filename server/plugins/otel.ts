import { registerOTel } from "@vercel/otel";

/**
 * Vercel tracing for requests served by the Vercel Function (enable it under the project's
 * Settings → Tracing). Effect spans reach it through `OtelTracer.layerGlobal`
 * (server/utils/effect.ts). Skipped locally and during prerender: there is no Vercel request
 * context there, so nothing would be recorded. By default trace headers only go to this
 * deployment's own URLs, never to third-party APIs.
 */
export default defineNitroPlugin(() => {
  if (!process.env.VERCEL || import.meta.prerender) return;
  registerOTel({ serviceName: "joelkuijper.me" });
});
