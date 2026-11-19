/**
 * Published posts with only the fields list views render, under one shared key, so post
 * bodies stay out of list-page payloads and the query runs once per build.
 */
export const usePublishedPosts = () =>
  useAsyncData("published-posts", () =>
    queryCollection("posts")
      .where("draft", "=", false)
      .order("publishDate", "DESC")
      .select("path", "title", "description", "publishDate", "tags", "draft")
      .all(),
  );
