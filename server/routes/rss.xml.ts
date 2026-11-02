import { Feed } from "feed";

export default defineEventHandler(async (event) => {
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

  const posts = await queryCollection(event, "posts")
    .where("draft", "=", false)
    .order("publishDate", "DESC")
    .all();

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
});
