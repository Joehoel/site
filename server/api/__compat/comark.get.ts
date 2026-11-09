import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { parseMarkdown as parseComark } from "comark";
import toc from "comark/plugins/toc";
import binding from "comark/plugins/binding";
import shiki from "comark/plugins/shiki";
import githubLight from "@shikijs/themes/github-light";
import githubDark from "@shikijs/themes/github-dark";
import typescript from "@shikijs/langs/typescript";
import { bundledLanguages } from "shiki";
import { parseMarkdown as parseMdc, rehypeHighlight, createShikiHighlighter } from "@nuxtjs/mdc/runtime";
import { fromHast } from "minimark/hast";
import { issue87Fixtures, issue87Synthetic } from "#shared/issue87";

const syntheticHighlighter = createShikiHighlighter({ themes: [githubLight, githubDark], langs: [typescript] });
const nativeLanguages = Promise.all(["python", "tsx", "typescript", "javascript", "toml", "dotenv", "ini", "bash", "json", "yaml", "vue", "css"].map(language => bundledLanguages[language as keyof typeof bundledLanguages]()));

export default defineEventHandler(async (event) => {
  const key = String(getQuery(event).fixture || "uses");
  if (!(key in issue87Fixtures)) throw createError({ statusCode: 400 });
  const fixture = issue87Fixtures[key as keyof typeof issue87Fixtures];
  const source = fixture.file
    ? await readFile(resolve(process.cwd(), "content", fixture.file), "utf8")
    : issue87Synthetic;
  const native = await parseComark(source, {
    plugins: [toc(), binding(), shiki({ languages: await nativeLanguages, themes: { light: githubLight, dark: githubDark } })],
  });
  let syntheticLegacy;
  if (!fixture.file) {
    const parsed = await parseMdc(source, {
      highlight: { theme: { light: "github-light", dark: "github-dark" }, highlighter: syntheticHighlighter },
      rehype: { plugins: { highlight: { instance: rehypeHighlight } } },
    });
    syntheticLegacy = {
      ...parsed.data,
      body: { ...fromHast(parsed.body), toc: parsed.toc },
    };
  }
  return { source, native, syntheticLegacy };
});
