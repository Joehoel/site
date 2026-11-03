<p align="center">
  <img src="public/icon.svg" alt="joelkuijper.me" width="120" />
</p>

<h1 align="center">joelkuijper.me</h1>

<p align="center">
  <a href="https://oxc.rs"><img src="https://img.shields.io/badge/Linted_with-OXC-60a5fa?logo=oxc" alt="OXC" /></a>
  <img src="https://img.shields.io/badge/Nuxt-4-00DC82?logo=nuxt.js" alt="Nuxt" />
  <img src="https://img.shields.io/badge/Vue-3-4FC08D?logo=vue.js" alt="Vue" />
</p>

<p align="center">
  Personal website and blog built with Nuxt 4 — featuring posts, notes, dark mode, RSS feeds, and instant search.
</p>

---

## Features

- Blog posts and quick notes with Markdown
- Instant search powered by Pagefind
- Dark mode with system preference detection
- RSS feeds for posts and notes
- View transitions for smooth navigation
- Fully static, SEO-friendly output

## Tech Stack

- **Framework**: Nuxt 4, Vue 3
- **Language**: TypeScript
- **Content**: Nuxt Content v3
- **Styling**: TailwindCSS, Typography plugin
- **Search**: Pagefind
- **Deployment**: Vercel (SSG)
- **Linting**: OxLint, OxFmt

## Development

```bash
# Install dependencies
bun install

# Start dev server
bun dev

# Build for production
bun run generate

# Lint and format
bun run fix
```

Career data fields and date semantics are described in [Career data reference](CAREER.md).

## Draft publication and Studio

Production builds include posts, notes, and projects only when their raw frontmatter has the boolean `draft: false`.
`draft: true`, an omitted `draft`, and the string `draft: "false"` stay unpublished.
This selection happens before Nuxt Content generates its database, anonymous SQL dumps, and preview metadata.
The source helper does not validate document schemas or rewrite Markdown.
The production source enumerates non-hidden Markdown files. Do not use hidden filenames or directories for published content.

Local development uses the ordinary filesystem sources, including drafts, for Studio editing and local draft preview.
Run `bun dev` for this authoring workflow.
Only `NODE_ENV=development` selects authoring sources; every other environment defaults to public sources.
Do not expose the development server publicly.

Deployed Studio 1.7 cannot edit custom sources, so production editing of posts, notes, and projects is unavailable.
Authenticated production draft preview is not provided by this setup.
Production authoring would require a separate authenticated source rather than exposing drafts in the public database.

Changing a published document to a draft removes it from the next production build, including builds that reuse generated caches.
Deploy that rebuilt output to withdraw it from the site.
This is a site publication boundary, not confidential storage. Files committed to a public repository and previously downloaded content remain public.

## License

[MIT](LICENSE)
