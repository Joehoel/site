# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Personal website and blog (joelkuijper.me) — a fully static Nuxt 4 site deployed to Vercel.

## Commands

This project uses **bun** (not npm/pnpm). Node is pinned to 24.22.2 via Volta.

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

Content is the heart of the site. Collections defined in `content.config.ts`, each with a Zod schema:

- **posts** (`content/posts/**/*.md`) — blog posts. Have `tags`, `coverImage`, `draft`, dates.
- **pages** (`content/pages/**/*.md`) — standalone pages (e.g. `uses`), mounted at the site root via `prefix: "/"`.

Query content with `queryCollection("posts")` (auto-imported). Pages use `useAsyncData`; server routes pass the `event`: `queryCollection(event, "posts")`.

### Draft handling

`draft` defaults to `true` in the schema, so **new posts are drafts until explicitly set `draft: false`**. Draft visibility is gated by `useCanSeeDrafts()` (`app/composables/useCanSeeDrafts.ts`), which is true in dev mode OR when the `studio-session-check` cookie is set (logged into Nuxt Studio).

Two patterns to keep consistent when touching content pages:

- **Listings & RSS** filter at the query: `.where("draft", "=", false)`.
- **Single-item pages** (`[...slug].vue`) load the item regardless, then `throw createError({ statusCode: 404, fatal: true })` if it's a draft and `!canSeeDrafts.value` — this lets logged-in editors preview drafts.
- List views share `usePublishedPosts()` (published only, list fields via `.select()`), so post bodies stay out of list payloads.

**Drafts are unlisted, not secret.** The `studio-session-check` cookie is a readable hint anyone can set, and Nuxt Content ships each collection's full SQL dump (drafts included) to the browser at `/__nuxt_content/<collection>/sql_dump.txt`. Never put anything private in a draft.

### Rendering & routing

- `nuxt-studio` provides a CMS at `/admin` (configured against the `Joehoel/site` GitHub repo). `/admin/**` and `/__nuxt_studio/**` are dynamic (`prerender: false`); **everything else is prerendered** (`routeRules` in `nuxt.config.ts`). `prerender.failOnError` is off because drafts may produce dead links.
- Layouts: `default.vue` and `post.vue` (post pages set `definePageMeta({ layout: "post" })`).
- Components are namespaced by directory and auto-imported with the path as prefix: `app/components/blog/PostPreview.vue` → `<BlogPostPreview>`.

### Search

Instant search uses Nuxt Content's `queryCollectionSearchSections` in Nuxt UI's `ContentSearch` modal (`app/app.vue`, opened by `app/components/Search.vue`). It runs client-side on the content SQLite dump, so it only loads when the modal first opens (`useContentSearch().open`).

### RSS feeds

`server/routes/rss.xml.ts` builds the posts feed with the `feed` package, pulling site metadata from `useAppConfig()`. Linked from `app.head` in `nuxt.config.ts`.

### Site config & theming

- Global site metadata, nav, socials, and date-formatting options live in `app/app.config.ts` (`useAppConfig()`). Locale is Dutch (`nl-NL`).
- Theming is in `app/assets/css/main.css` — Tailwind v4 (`@theme`) with CSS-variable color tokens (`--color-accent`, etc.) driven by `[data-theme]` / `.dark`. Color mode (`@nuxtjs/color-mode`) uses `classSuffix: ""` so the dark class is plain `.dark`.

### Server logging & errors (evlog)

Server routes log with [evlog](https://www.evlog.dev) wide events (`evlog/nuxt`, config under `evlog` in `nuxt.config.ts`; server-only, scoped to `/api/**`, `/rss.xml`, `/__sitemap__/**`). One event per request, emitted automatically:

- `const log = useLogger(event)` (auto-imported), then `log.set({ ... })` for context, `log.warn()`/`log.error()` for problems. Thrown errors are captured automatically; use `createEvlogError({ message, status, why, fix })` for structured ones (Nuxt's own `createError` stays as-is in pages).
- Third-party calls go through `fetchUpstream()` (`server/utils/upstream.ts`): it records `upstream.<name>` (ok/status/ms) and logs failures with why/fix, then returns `null`. It finds the request logger via `useEvent()` (`nitro.experimental.asyncContext`).
- Build-time routes must degrade (return empty data + `log.error`), never throw: a failed prerender leaves a live endpoint that spends the token. Never log raw `FetchError`s (their `options` include the `Authorization` header).
- These routes run during prerender, so their events show up in the Vercel **build** log.

### Deployment

The Brag page's activity sections fetch third-party stats at build time: `server/api/github-contributions.get.ts` (`NUXT_GITHUB_TOKEN`) and `server/api/wakatime-stats.get.ts` (`NUXT_WAKATIME_TOKEN`; falls back to WakaTime's public all-time stats without it). Both are listed in `nitro.prerender.routes` so they ship as static JSON — keep any new token-backed route there too, or it becomes a live, uncached endpoint spending the token. Without a token a section hides itself instead of failing the build.

Vercel via Nitro's `vercel` preset (SSG). Images use the `vercel` image provider. `vercel.json` pins install/build to bun.
