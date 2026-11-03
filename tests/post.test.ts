import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { parseFrontMatter } from "remark-mdc";
import { postSchema } from "../shared/post.ts";

test("the public article validates through the shared post schema", () => {
  const source = readFileSync(
    new URL("../content/posts/powerpoint-inverter.md", import.meta.url),
    "utf8",
  );
  const { data } = parseFrontMatter(source);
  assert.equal(postSchema.parse(data).draft, false);
});

test("post defaults keep unspecified publication state private", () => {
  const result = postSchema.parse({ title: "Example", publishDate: "2025-01-30" });
  assert.equal(result.draft, true);
  assert.deepEqual(result.tags, []);
  assert.equal(result.updatedDate, undefined);
});

test("the shared post schema preserves authored metadata without adding date precision", () => {
  const input = {
    title: "Example",
    draft: false,
    description: "An example article.",
    tags: ["Python"],
    coverImage: { src: "/image.jpg", alt: "Example" },
    ogImage: "/social.jpg",
    publishDate: "2025-01-30",
    updatedDate: "2025-01-31",
  };
  assert.deepEqual(postSchema.parse(input), input);
});

test("invalid post fields fail the same shared schema used by Content", () => {
  const base = { title: "Example", publishDate: "2025-01-30" };
  for (const patch of [
    { title: "x".repeat(61) },
    { draft: "false" },
    { publishDate: "2025-02-30" },
    { updatedDate: "yesterday" },
    { tags: [2] },
    { coverImage: { src: "/image.jpg" } },
    { description: 1 },
    { ogImage: 1 },
  ]) {
    assert.equal(postSchema.safeParse({ ...base, ...patch }).success, false);
  }
});
