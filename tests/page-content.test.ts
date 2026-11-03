import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { test } from "node:test";
import { parseMarkdown } from "@nuxtjs/mdc/runtime/parser/index";
import { pageSchema } from "../shared/page.ts";

const pagesDirectory = new URL("../content/pages/", import.meta.url);
const fixturePage = { title: "Example page", publishDate: "2026-11-03" };

for (const filename of readdirSync(pagesDirectory).filter((name) => name.endsWith(".md"))) {
  test(`${filename} frontmatter validates with the production page schema`, async () => {
    const source = readFileSync(new URL(filename, pagesDirectory), "utf8");
    const document = await parseMarkdown(source);
    const page = pageSchema.parse(document.data);
    for (const [key, value] of Object.entries(page)) {
      assert.equal(document.data[key], value);
    }
  });
}

test("the Brag hero and visible update date bind to authored frontmatter", async () => {
  const source = readFileSync(new URL("brag.md", pagesDirectory), "utf8");
  const document = await parseMarkdown(source);
  const page = pageSchema.parse(document.data);
  assert.equal(page.title, "Brag");
  assert.ok(page.updatedDate);
  type Node = (typeof document.body.children)[number];
  const timestamps: Node[] = [];

  function visit(node: Node) {
    if (node.type !== "element") return;
    if (node.tag === "timestamp") timestamps.push(node);
    for (const child of node.children) visit(child);
  }

  for (const child of document.body.children) visit(child);
  assert.equal(timestamps.length, 1);
  assert.deepEqual(timestamps[0]?.props, { ":date": "updatedDate" });
  const hero = document.body.children.find(
    (node) => node.type === "element" && node.tag === "spec-hero",
  );
  assert.deepEqual(hero?.props, { ":title": "title" });
});

test("pages without an update date remain valid", () => {
  assert.deepEqual(pageSchema.parse(fixturePage), fixturePage);
});

test("authors can update the page date without changing its publication date", () => {
  const updated = { ...fixturePage, updatedDate: "2026-11-04" };
  assert.deepEqual(pageSchema.parse(updated), updated);
});

for (const field of ["publishDate", "updatedDate"]) {
  test(`the page schema rejects invalid or coerced ${field} values`, () => {
    for (const value of ["2026-02-29", "2026-13-01", "2026-11", 2026, new Date("2026-11-03")]) {
      const result = pageSchema.safeParse({ ...fixturePage, [field]: value });
      assert.equal(result.success, false);
      if (!result.success) assert.deepEqual(result.error.issues[0]?.path, [field]);
    }
  });
}
