import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { imageMeta } from "image-meta";
import type { BundledLanguage } from "shiki";
import { parse as parseYaml } from "yaml";
import { careerSchema } from "./shared/career.ts";

careerSchema.parse(
  parseYaml(readFileSync(new URL("./content/career.yml", import.meta.url), "utf8")),
);

const publicDir = fileURLToPath(new URL("./public", import.meta.url));
const seoImages: Record<string, { width: number; height: number }> = {};
for (const path of readdirSync(publicDir, { recursive: true, encoding: "utf8" })) {
  if (!/\.(png|jpe?g)$/i.test(path)) continue;
  try {
    const { type, width, height } = imageMeta(readFileSync(join(publicDir, path)));
    if ((type === "png" || type === "jpg" || type === "jpeg") && width && height) {
      seoImages[`/${path}`] = { width, height };
    }
  } catch {}
}

const highlightLangs: BundledLanguage[] = [
  "python",
  "tsx",
  "typescript",
  "javascript",
  "toml",
  "dotenv",
  "ini",
  "bash",
  "json",
  "yaml",
  "vue",
  "css",
];

const highlightOptions = {
  theme: {
    default: "github-light",
    light: "github-light",
    dark: "github-dark",
  },
  langs: highlightLangs,
  compress: false,
};

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  future: {
    compatibilityVersion: 4,
  },

  experimental: {
    viewTransition: true,
  },

  modules: [
    "@nuxt/content",
    "@nuxt/ui",
    "@nuxt/image",
    "@nuxtjs/sitemap",
    "@nuxtjs/color-mode",
    "nuxt-studio",
    "@nuxt/fonts",
    "nuxt-og-image",
  ],

  studio: {
    route: "/admin",
    repository: {
      provider: "github",
      owner: "Joehoel",
      repo: "site",
      branch: "master",
    },
  },

  css: ["~/assets/css/main.css"],

  runtimeConfig: {
    public: { seoImages },
  },

  fonts: {
    families: [
      {
        name: "Site OG",
        src: "/fonts/space-grotesk-latin-700-normal.woff2",
        weight: 700,
        global: true,
      },
    ],
  },

  ogImage: {
    defaults: { width: 1200, height: 630, extension: "png", emojis: false },
    resvgOptions: { font: { loadSystemFonts: false } },
    compatibility: {
      dev: { satori: "node", resvg: "node", browser: false, takumi: false, sharp: false },
      prerender: { satori: "node", resvg: "node", browser: false, takumi: false, sharp: false },
      runtime: { satori: "node", resvg: "node", browser: false, takumi: false, sharp: false },
    },
  },

  content: {
    build: {
      markdown: {
        highlight: highlightOptions,
      },
    },
  },

  hooks: {
    "content:file:afterParse"({ collection, content }) {
      if (collection.name === "career") careerSchema.parse(content);
    },
  },

  colorMode: {
    classSuffix: "",
    preference: "dark",
    fallback: "dark",
  },

  site: {
    url: "https://joelkuijper.me",
    defaultLocale: "en",
    trailingSlash: false,
  },

  sitemap: {
    sources: ["/__sitemap__/published-content.json"],
    excludeAppSources: ["@nuxt/content@v3:urls"],
    exclude: ["/admin/**", "/__nuxt_studio/**", "/__sitemap__/**", "/__og-image__/**"],
  },

  routeRules: {
    "/admin/**": { ssr: true },
    "/__nuxt_studio/**": { ssr: true },
    "/**": { prerender: true },
  },

  nitro: {
    preset: "vercel",
    vercel: {
      functions: {
        runtime: "nodejs24.x",
      },
    },
    prerender: {
      crawlLinks: true,
      routes: ["/", "/sitemap.xml", "/__sitemap__/published-content.json"],
      // Don't fail on 404s - some content may link to draft posts
      failOnError: false,
    },
  },

  image: {
    provider: "vercel",
  },

  app: {
    head: {
      htmlAttrs: { lang: "en" },
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
      ],
      link: [
        { rel: "icon", type: "image/x-icon", href: "/favicon.ico", sizes: "32x32" },
        { rel: "icon", type: "image/svg+xml", href: "/icon.svg" },
        { rel: "apple-touch-icon", href: "/apple-touch-icon.png", sizes: "180x180" },
        {
          rel: "alternate",
          type: "application/rss+xml",
          title: "Log RSS feed",
          href: "/rss.xml",
        },
        {
          rel: "alternate",
          type: "application/rss+xml",
          title: "Notes RSS Feed",
          href: "/notes/rss.xml",
        },
      ],
    },
  },
});
