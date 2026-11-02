export default defineEventHandler(async (event) => {
  const [pages, posts, notes] = await Promise.all([
    queryCollection(event, "pages").select("path", "publishDate", "updatedDate").all(),
    queryCollection(event, "posts")
      .where("draft", "=", false)
      .select("path", "publishDate", "updatedDate", "tags")
      .all(),
    queryCollection(event, "notes").where("draft", "=", false).select("path", "publishDate").all(),
  ]);
  const urls = [
    ...[...pages, ...posts].map((page) => ({
      loc: page.path,
      lastmod: page.updatedDate ?? page.publishDate,
    })),
    ...notes.map((note) => ({ loc: note.path, lastmod: note.publishDate })),
    ...[...new Set(posts.flatMap((post) => post.tags))].map((tag) => ({
      loc: `/tags/${encodeURIComponent(tag)}`,
    })),
  ];
  setHeader(event, "x-nitro-prerender", urls.map(({ loc }) => encodeURIComponent(loc)).join(", "));
  return urls;
});
