import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { defineCollection } from "@nuxt/content";
import { contentSource } from "../lib/content-source.ts";

const collections = [
  { name: "posts", include: "posts/**/*.md", prefix: "/log" },
  { name: "notes", include: "notes/**/*.md", prefix: "/notes" },
  { name: "projects", include: "projects/**/*.md", prefix: "/projects" },
] as const;

const documents = {
  "published.md": '---\ndraft: false\n---\n\n::example\n```ts\nconst raw = "unchanged";\n```\n::\n',
  "draft.md": "---\ndraft: true\n---\n\nSynthetic draft body\n",
  "omitted.md": "---\ntitle: Synthetic omitted draft\n---\n\nSynthetic body\n",
  "string.md": '---\ndraft: "false"\n---\n\nSynthetic string draft\n',
};

for (const { name, include, prefix } of collections) {
  test(`${name} publishes only raw boolean false and preserves source paths and Markdown`, async (t) => {
    const rootDir = await mkdtemp(join(tmpdir(), "content-source-"));
    t.after(() => rm(rootDir, { recursive: true, force: true }));
    const directory = join(rootDir, "content", name);
    await mkdir(join(directory, "nested"), { recursive: true });
    for (const [file, markdown] of Object.entries(documents)) {
      await writeFile(join(directory, file), markdown);
    }
    await writeFile(join(directory, "nested", "published.md"), documents["published.md"]);

    const options = name === "posts" ? { include, prefix } : { include };
    const ordinary = contentSource(options, "authoring");
    assert.equal(ordinary, options);
    const authoring = defineCollection({ type: "page", source: ordinary }).source![0];
    const publicSource = contentSource(options);
    const published = defineCollection({ type: "page", source: publicSource }).source![0];
    assert.equal(published, publicSource);
    await authoring.prepare!({ rootDir });
    await published.prepare!({ rootDir });

    const expected = ["nested/published.md", "published.md"];
    assert.deepEqual((await published.getKeys!()).sort(), expected);
    assert.deepEqual(
      (await authoring.getKeys!()).sort(),
      [...Object.keys(documents), "nested/published.md"].sort(),
    );
    assert.equal(published.cwd, join(rootDir, "content"));
    assert.equal(published.cwd, authoring.cwd);
    assert.equal(published.include, authoring.include);
    assert.equal(published.prefix, prefix);
    assert.equal(published.prefix, authoring.prefix);
    for (const key of expected) {
      assert.equal(join(name, published.prefix!, key), join(name, authoring.prefix!, key));
      assert.equal(await published.getItem!(key), await authoring.getItem!(key));
      assert.equal(await published.getItem!(key), documents["published.md"]);
    }
    const metadata = JSON.stringify(published);
    for (const file of Object.keys(documents)) assert.equal(metadata.includes(file), false);
    assert.equal("exclude" in published, false);
  });

  test(`${name} recomputes membership after additions, removals, and draft flips`, async (t) => {
    const rootDir = await mkdtemp(join(tmpdir(), "content-source-"));
    t.after(() => rm(rootDir, { recursive: true, force: true }));
    const directory = join(rootDir, "content", name);
    await mkdir(directory, { recursive: true });
    const options = { include, prefix };
    const source = defineCollection({ type: "page", source: contentSource(options) }).source![0];
    await source.prepare!({ rootDir });
    assert.deepEqual(await source.getKeys!(), []);
    await writeFile(join(directory, "flip.md"), documents["published.md"]);
    assert.deepEqual(await source.getKeys!(), ["flip.md"]);
    await writeFile(join(directory, "flip.md"), documents["draft.md"]);
    assert.deepEqual(await source.getKeys!(), []);
    const rebuilt = defineCollection({ type: "page", source: contentSource(options) }).source![0];
    await rebuilt.prepare!({ rootDir });
    assert.deepEqual(await rebuilt.getKeys!(), []);
    await writeFile(join(directory, "flip.md"), documents["published.md"]);
    assert.deepEqual(await rebuilt.getKeys!(), ["flip.md"]);
    await rm(join(directory, "flip.md"));
    assert.deepEqual(await rebuilt.getKeys!(), []);
  });
}
