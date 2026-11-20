import { Effect } from "effect";
import { Feed } from "feed";
import { Content } from "../services/Content";
import { CurrentEvent } from "../services/CurrentEvent";

/** RSS feed of published Log entries. A failed query is logged and answered with a 500. */
export default defineEffectHandler(
  Effect.gen(function* () {
    const event = yield* CurrentEvent;
    const content = yield* Content;
    const config = useAppConfig();
    const siteUrl = new URL(getSiteConfig(event).url).origin;

    const feed = new Feed({
      title: `${config.site.title} - Log`,
      description: `Log entries by ${config.site.author}`,
      id: `${siteUrl}/log`,
      link: `${siteUrl}/log`,
      language: config.site.lang,
      copyright: `All rights reserved ${new Date().getFullYear()}, ${config.site.author}`,
      feedLinks: {
        rss: `${siteUrl}/rss.xml`,
      },
      author: {
        name: config.site.author,
        link: siteUrl,
      },
    });

    const posts = yield* content.query("posts", (query) =>
      query.where("draft", "=", false).order("publishDate", "DESC").all(),
    );
    yield* Effect.logInfo("RSS feed built").pipe(
      Effect.annotateLogs({ items: posts.length, latest: posts[0]?.path ?? null }),
    );

    for (const post of posts) {
      feed.addItem({
        title: post.title,
        id: `${siteUrl}${post.path}`,
        link: `${siteUrl}${post.path}`,
        description: post.description,
        date: new Date(post.publishDate),
        author: [{ name: config.site.author, link: siteUrl }],
      });
    }

    setHeader(event, "content-type", "application/xml");
    return feed.rss2();
  }),
);
