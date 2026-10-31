import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { writeFile } from "node:fs/promises";

const base = new URL(process.env.BASE_URL || "http://127.0.0.1:3513");
const origin = new URL(process.env.SITE_ORIGIN || "https://joelkuijper.me");
const failures = [];
const pages = [];
const checkedImages = new Map();
const queued = new Set(["/", "/log", "/notes", "/uses", "/tags"]);
const sitemapPaths = new Set();
const drafts = ["/log/building-a-web-scraper-with-effect", "/log/deploying-laravel-on-railway"];

function decode(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replace(/&#(\d+);/g, (_, number) => String.fromCodePoint(Number(number)));
}

function attributes(tag) {
  return Object.fromEntries(
    [...tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)].map((match) => [
      match[1],
      decode(match[2] ?? match[3] ?? ""),
    ]),
  );
}

function pathname(value) {
  const url = new URL(decode(value), origin);
  if (url.origin !== origin.origin && url.origin !== base.origin) return null;
  if (/^\/(?:_|api|admin)(?:\/|$)/.test(url.pathname)) return null;
  if (/\.[a-z0-9]+$/i.test(url.pathname)) return null;
  return url.pathname.replace(/\/$/, "") || "/";
}

async function request(path, options = {}) {
  return fetch(new URL(path, base), { signal: AbortSignal.timeout(60000), ...options });
}

function check(condition, message) {
  if (!condition) failures.push(message);
}

const sitemapResponse = await request("/sitemap.xml");
check(sitemapResponse.ok, "Sitemap responds successfully");
const sitemap = await sitemapResponse.text();
for (const match of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) {
  check(new URL(decode(match[1])).origin === origin.origin, "Sitemap uses the production origin");
  const path = pathname(match[1]);
  if (path) {
    queued.add(path);
    sitemapPaths.add(path);
  }
}
check(sitemapPaths.size >= 5, "Sitemap contains public pages");
check(!/\/posts(?:[<\s/]|$)/.test(sitemap), "Sitemap excludes legacy posts routes");
for (const draft of drafts) check(!sitemap.includes(draft), `Sitemap excludes ${draft}`);

for (const path of ["/rss.xml", "/notes/rss.xml"]) {
  const response = await request(path);
  const xml = await response.text();
  check(response.ok && /<rss\b/.test(xml), `${path} is a working RSS feed`);
  check(!xml.includes("/posts/"), `${path} uses current routes`);
  for (const draft of drafts) check(!xml.includes(draft), `${path} excludes ${draft}`);
  for (const match of xml.matchAll(/<link>(?:<!\[CDATA\[)?([^<]+)(?:\]\]>)?<\/link>/g)) {
    const value = decode(match[1]).replace(/\]\]>$/, "");
    const route = pathname(value);
    if (route) queued.add(route);
    check(new URL(value).origin === origin.origin, `${path} uses the configured production origin`);
  }
}

for (const path of queued) {
  assert(queued.size < 500, "Internal route discovery stays bounded");
  const start = failures.length;
  const response = await request(path);
  const html = await response.text();
  if (!response.ok) {
    failures.push(`${path} responds with ${response.status}`);
    pages.push({ path, status: response.status });
    continue;
  }
  const head = html.split("</head>", 1)[0];
  const meta = new Map(
    [...head.matchAll(/<meta\b[^>]*>/g)].map(([tag]) => {
      const data = attributes(tag);
      return [data.property || data.name, data.content];
    }),
  );
  for (const name of ["description", "og:title", "og:image", "twitter:image"]) {
    const count = [...head.matchAll(/<meta\b[^>]*>/g)]
      .map(([tag]) => attributes(tag))
      .filter((data) => (data.property || data.name) === name).length;
    check(count === 1, `${path} has exactly one ${name} tag`);
  }
  const canonicalTags = [...head.matchAll(/<link\b[^>]*>/g)]
    .map(([tag]) => attributes(tag))
    .filter((data) => data.rel === "canonical");
  const title = decode(head.match(/<title>([^<]*)<\/title>/)?.[1] || "");
  const lang = attributes(html.match(/<html\b[^>]*>/)?.[0] || "").lang || "";
  check(
    Boolean(title) && title.includes("Joël Kuijper"),
    `${path} has its author in the rendered title`,
  );
  check(!title.includes("Joël Kuijper | Joël Kuijper"), `${path} avoids duplicate title suffixes`);
  check(
    path === "/" ? title === "Joël Kuijper" : title.endsWith(" | Joël Kuijper"),
    `${path} uses the approved title pattern`,
  );
  check(lang === "en" || lang.startsWith("en-"), `${path} declares English`);
  check(canonicalTags.length === 1, `${path} has exactly one canonical`);
  check(
    canonicalTags[0]?.href === new URL(path, origin).href,
    `${path} has the correct query-free production canonical`,
  );
  for (const name of [
    "description",
    "og:title",
    "og:description",
    "og:type",
    "og:image",
    "og:image:alt",
    "twitter:card",
    "twitter:title",
    "twitter:description",
    "twitter:image",
  ]) {
    check(Boolean(meta.get(name)?.trim()), `${path} provides ${name}`);
  }
  check(meta.get("og:url") === canonicalTags[0]?.href, `${path} shares its canonical as og:url`);
  check(meta.get("twitter:card") === "summary_large_image", `${path} uses a large social card`);
  check(
    !/noindex/i.test(`${meta.get("robots") || ""} ${response.headers.get("x-robots-tag") || ""}`),
    `${path} remains indexable`,
  );
  check(sitemapPaths.has(path), `${path} is present in the sitemap`);
  const imageValue = meta.get("og:image");
  for (const imageValue of new Set(
    [meta.get("og:image"), meta.get("twitter:image")].filter(Boolean),
  )) {
    if (checkedImages.has(imageValue)) continue;
    try {
      const imageUrl = new URL(imageValue);
      check(imageUrl.protocol === "https:", `${path} shares an HTTPS OG image`);
      const imageTarget =
        imageUrl.origin === origin.origin
          ? `${imageUrl.pathname}${imageUrl.search}`
          : imageUrl.href;
      const imageResponse =
        imageUrl.origin === origin.origin
          ? await request(imageTarget)
          : await fetch(imageTarget, { signal: AbortSignal.timeout(60000) });
      const contentType = imageResponse.headers.get("content-type") || "";
      check(
        imageResponse.ok && /^image\/(png|jpeg|webp|avif)/.test(contentType),
        `${path} OG URL returns a supported image`,
      );
      const buffer = Buffer.from(await imageResponse.arrayBuffer());
      if (contentType.startsWith("image/png")) {
        check(
          buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])),
          `${path} OG PNG has a valid signature`,
        );
        check(
          buffer.length >= 24 &&
            buffer.readUInt32BE(16) === 1200 &&
            buffer.readUInt32BE(20) === 630,
          `${path} OG PNG is 1200 by 630`,
        );
      }
      checkedImages.set(imageValue, {
        status: imageResponse.status,
        contentType,
        bytes: buffer.length,
        sha256: createHash("sha256").update(buffer).digest("hex"),
      });
    } catch (error) {
      failures.push(`${path} OG image failed: ${error.message}`);
    }
  }
  const internalLinks = [...html.matchAll(/<a\b[^>]*>/g)]
    .map(([tag]) => attributes(tag).href)
    .filter(Boolean);
  if (path === "/tags")
    check(
      internalLinks.some((href) => href.startsWith("/tags/")),
      "Tag badges expose real links",
    );
  for (const href of internalLinks) {
    const target = pathname(href);
    if (target) queued.add(target);
  }
  const page = {
    path,
    status: response.status,
    title,
    lang,
    canonical: canonicalTags[0]?.href,
    ogImage: imageValue,
    failures: failures.slice(start),
  };
  pages.push(page);
  console.log(
    `${page.failures.length ? "FAIL" : "PASS"} ${path}: ${page.failures.length ? page.failures.join("; ") : "metadata, canonical, social image and sitemap"}`,
  );
}

for (const path of ["/posts", "/posts/powerpoint-inverter", ...drafts]) {
  const response = await request(path, { redirect: "manual" });
  check(response.status === 404, `${path} stays unpublished without a redirect`);
}
const robotsResponse = await request("/robots.txt");
check(robotsResponse.ok, "Robots responds successfully");
const robots = await robotsResponse.text();
check(!/^Disallow:\s*\/\s*$/im.test(robots), "Robots allows public crawling");
check(
  robots.includes(new URL("/sitemap.xml", origin).href),
  "Robots declares the production sitemap",
);
check(/Disallow:\s*\/admin/i.test(robots), "Robots excludes Studio administration");
check(
  new Set([...checkedImages.values()].map((image) => image.sha256)).size >= pages.length,
  "Public pages have distinct title-specific images",
);
const favicon = await request("/icon.svg");
check(
  favicon.ok &&
    /image\/svg\+xml/.test(favicon.headers.get("content-type")) &&
    (await favicon.text()).includes("<svg"),
  "SVG favicon responds with its image MIME type",
);
const fallback = await request("/favicon.ico");
const icon = Buffer.from(await fallback.arrayBuffer());
check(
  fallback.ok &&
    /image\/(?:x-icon|vnd.microsoft.icon)/.test(fallback.headers.get("content-type")) &&
    icon.length > 100 &&
    icon.readUInt32LE(0) === 65536 &&
    icon.readUInt16LE(4) === 3 &&
    [16, 32, 48].every(
      (size, index) => icon[6 + index * 16] === size && icon[7 + index * 16] === size,
    ),
  "Compatible favicon contains 16, 32 and 48 pixel icons",
);
const queryPage = await (await request("/notes?from=verification")).text();
const queryCanonical = [...queryPage.matchAll(/<link\b[^>]*>/g)]
  .map(([tag]) => attributes(tag))
  .filter((data) => data.rel === "canonical");
check(
  queryCanonical.length === 1 && queryCanonical[0].href === new URL("/notes", origin).href,
  "Tracking queries do not alter the canonical URL",
);

const report = {
  base: base.href,
  origin: origin.href,
  pages,
  images: Object.fromEntries(checkedImages),
  failures,
};
if (process.env.VERIFY_REPORT)
  await writeFile(process.env.VERIFY_REPORT, JSON.stringify(report, null, 2) + "\n");
console.log(
  `${failures.length ? "FAIL" : "PASS"}: ${pages.length} public pages, ${checkedImages.size} OG images, ${failures.length} failed assertions`,
);
process.exitCode = failures.length ? 1 : 0;
