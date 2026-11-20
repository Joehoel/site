import { Array as Arr, Effect, pipe } from "effect";
import { Content } from "../../services/Content";
import { CurrentEvent } from "../../services/CurrentEvent";

type Dated = {
  readonly path: string;
  readonly publishDate: string;
  readonly updatedDate?: string | null;
};
type SitemapUrl = { readonly loc: string; readonly lastmod?: string };

const pageUrl = ({ path, publishDate, updatedDate }: Dated): SitemapUrl => ({
  loc: path,
  lastmod: updatedDate ?? publishDate,
});

/** One tag page per distinct tag across the published posts. */
const tagUrls = (posts: ReadonlyArray<{ readonly tags?: ReadonlyArray<string> }>) =>
  pipe(
    posts,
    Arr.flatMap((post) => post.tags ?? []),
    Arr.dedupe,
    Arr.map((tag): SitemapUrl => ({ loc: `/tags/${encodeURIComponent(tag)}` })),
  );

/** Nitro prerenders every URL listed in this header. */
const prerenderHeader = (urls: ReadonlyArray<SitemapUrl>) =>
  pipe(
    urls,
    Arr.map(({ loc }) => encodeURIComponent(loc)),
    Arr.join(", "),
  );

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

    const urls = pipe(Arr.appendAll(pages, posts), Arr.map(pageUrl), Arr.appendAll(tagUrls(posts)));
    yield* Effect.logInfo("Sitemap entries built").pipe(
      Effect.annotateLogs({ urls: urls.length, pages: pages.length, posts: posts.length }),
    );

    const event = yield* CurrentEvent;
    setHeader(event, "x-nitro-prerender", prerenderHeader(urls));
    return urls;
  }),
);
