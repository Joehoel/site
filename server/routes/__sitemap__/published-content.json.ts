/** Published URLs for @nuxtjs/sitemap; also tells Nitro to prerender them. */
export default defineEventHandler(async (event) => {
  const log = useLogger(event);
  const [pages, posts] = await Promise.all([
    queryCollection(event, "pages").select("path", "publishDate", "updatedDate").all(),
    queryCollection(event, "posts")
      .where("draft", "=", false)
      .select("path", "publishDate", "updatedDate", "tags")
      .all(),
  ]);
  const urls = [
    ...[...pages, ...posts].map((page) => ({
      loc: page.path,
      lastmod: page.updatedDate ?? page.publishDate,
    })),
    ...[...new Set(posts.flatMap((post) => post.tags))].map((tag) => ({
      loc: `/tags/${encodeURIComponent(tag)}`,
    })),
  ];
  log.set({ sitemap: { urls: urls.length, pages: pages.length, posts: posts.length } });
  setHeader(event, "x-nitro-prerender", urls.map(({ loc }) => encodeURIComponent(loc)).join(", "));
  return urls;
});
