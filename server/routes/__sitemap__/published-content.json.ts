import { Effect } from "effect";
import { Content } from "../../services/Content";
import { CurrentEvent } from "../../services/CurrentEvent";

/** Published URLs for @nuxtjs/sitemap; also tells Nitro to prerender them. */
export default defineEffectHandler(
  Effect.gen(function* () {
    const content = yield* Content;
    const [pages, posts] = yield* Effect.all(
      [
        content.query("pages", (query) => query.select("path", "publishDate", "updatedDate").all()),
        content.query("posts", (query) =>
          query
            .where("draft", "=", false)
            .select("path", "publishDate", "updatedDate", "tags")
            .all(),
        ),
      ],
      { concurrency: "unbounded" },
    );
    const urls = [
      ...[...pages, ...posts].map((page) => ({
        loc: page.path,
        lastmod: page.updatedDate ?? page.publishDate,
      })),
      ...[...new Set(posts.flatMap((post) => post.tags).filter((tag) => tag !== undefined))].map(
        (tag) => ({
          loc: `/tags/${encodeURIComponent(tag)}`,
        }),
      ),
    ];
    yield* Effect.logInfo("Sitemap entries built").pipe(
      Effect.annotateLogs({ urls: urls.length, pages: pages.length, posts: posts.length }),
    );
    const event = yield* CurrentEvent;
    setHeader(
      event,
      "x-nitro-prerender",
      urls.map(({ loc }) => encodeURIComponent(loc)).join(", "),
    );
    return urls;
  }),
);
