import { glob, readFile } from "node:fs/promises";
import { join } from "node:path";
import { defineCollectionSource } from "@nuxt/content";
import { parseFrontMatter } from "remark-mdc";

type ContentAudience = "public" | "authoring";
type DraftCollectionSource = {
  include: `${"posts" | "notes" | "projects"}/**/*.md`;
  prefix?: string;
};

export function contentSource(source: DraftCollectionSource, audience: ContentAudience = "public") {
  if (audience === "authoring") return source;

  const directory = source.include.slice(0, source.include.indexOf("*"));
  const published = defineCollectionSource({
    async prepare({ rootDir }) {
      published.cwd = join(rootDir, "content");
    },
    async getKeys() {
      const keys: string[] = [];
      for await (const path of glob(source.include, { cwd: published.cwd })) {
        const markdown = await readFile(join(published.cwd, path), "utf8");
        const { data } = await parseFrontMatter(markdown);
        if (data.draft === false) keys.push(path.slice(directory.length));
      }
      return keys;
    },
    async getItem(key) {
      return readFile(join(published.cwd, directory, key), "utf8");
    },
  });

  return Object.assign(published, {
    ...source,
    prefix: source.prefix ?? `/${directory.slice(0, -1)}`,
  });
}
