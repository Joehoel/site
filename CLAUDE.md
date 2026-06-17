# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Personal website and blog (joelkuijper.me) — a fully static Nuxt 4 site deployed to Vercel.

## Commands

This project uses **bun** (not npm/pnpm). Node is pinned to 22.22.0 via Volta.

```bash
bun install          # install deps
bun dev              # dev server (drafts are visible in dev)
bun run generate     # static build for production (SSG)
bun run build        # nuxt build (used by Vercel)
bun run preview      # preview a production build

bun run lint         # oxlint
bun run format:check # oxfmt --check (CI enforces this)
bun run fix          # lint:fix + format — run before pushing
```

Linting/formatting use **OxLint + OxFmt** (not ESLint/Prettier). CI (`.github/workflows/ci.yml`) fails on lint or format violations; `autofix.ci.yml` auto-applies `bun run fix` on PRs. There is no test suite.

## Architecture

**Nuxt 4** with `srcDir: app/` (the `future.compatibilityVersion: 4` layout). Application code lives under `app/`; server routes under `server/`; Markdown content under `content/`.

### Content (Nuxt Content v3)

Content is the heart of the site. Three collections defined in `content.config.ts`, each with a Zod schema:

- **posts** (`content/posts/**/*.md`) — blog posts. Have `tags`, `coverImage`, `draft`, dates.
- **notes** (`content/notes/**/*.md`) — short notes. Have `draft`.
- **pages** (`content/pages/**/*.md`) — standalone pages (e.g. `uses`), mounted at the site root via `prefix: "/"`.

Query content with `queryCollection("posts")` (auto-imported). Pages use `useAsyncData`; server routes pass the `event`: `queryCollection(event, "posts")`.

### Draft handling

`draft` defaults to `true` in the schema, so **new posts/notes are drafts until explicitly set `draft: false`**. Draft visibility is gated by `useCanSeeDrafts()` (`app/composables/useCanSeeDrafts.ts`), which is true in dev mode OR when the `studio-session-check` cookie is set (logged into Nuxt Studio).

Two patterns to keep consistent when touching content pages:

- **Listings & RSS** filter at the query: `.where("draft", "=", false)`.
- **Single-item pages** (`[...slug].vue`) load the item regardless, then `throw createError({ statusCode: 404 })` if it's a draft and `!canSeeDrafts.value` — this lets logged-in editors preview drafts.

### Rendering & routing

- `nuxt-studio` provides a CMS at `/admin` (configured against the `Joehoel/site` GitHub repo). `/admin/**` and `/__nuxt_studio/**` are SSR; **everything else is prerendered** (`routeRules` in `nuxt.config.ts`). `prerender.failOnError` is off because drafts may produce dead links.
- Layouts: `default.vue` and `post.vue` (post pages set `definePageMeta({ layout: "post" })`).
- Components are namespaced by directory and auto-imported with the path as prefix: `app/components/blog/PostPreview.vue` → `<BlogPostPreview>`, `app/components/note/Card.vue` → `<NoteCard>`.

### Search

Instant search uses **Pagefind** via Nuxt UI's `<UContentSearchButton>` / `ContentSearch` modal (`app/components/Search.vue`). Article bodies are marked with `data-pagefind-body` so Pagefind indexes them at build time.

### RSS feeds

`server/routes/rss.xml.ts` (posts) and `server/routes/notes/rss.xml.ts` (notes) build feeds with the `feed` package, pulling site metadata from `useAppConfig()`. Both linked from `app.head` in `nuxt.config.ts`.

### Site config & theming

- Global site metadata, nav, socials, and date-formatting options live in `app/app.config.ts` (`useAppConfig()`). Locale is Dutch (`nl-NL`).
- Theming is in `app/assets/css/main.css` — Tailwind v4 (`@theme`) with CSS-variable color tokens (`--color-accent`, etc.) driven by `[data-theme]` / `.dark`. Color mode (`@nuxtjs/color-mode`) uses `classSuffix: ""` so the dark class is plain `.dark`.

### Deployment

Vercel via Nitro's `vercel` preset (SSG). Images use the `vercel` image provider. `vercel.json` pins install/build to bun.
