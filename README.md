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

## Tooling history

Edit `content/tooling.yml` in local Studio or as YAML. `content/pages/uses.md` owns the introduction; its tooling component derives current use and history from the one YAML payload.
Keep tool IDs stable when names change. Add another period when use restarts. Parallel tools and periods are allowed.

Quote known dates as `YYYY`, `YYYY-MM`, or `YYYY-MM-DD`. Use `start: null` for an unknown start, not an invented day.
Choose an explicit endpoint:

- `end: { kind: unknown }` means current use is unconfirmed.
- `end: { kind: ended, date: null }` records past use with an unknown end date. A quoted partial date can replace `null`.
- `end: { kind: ongoing, verifiedOn: "2026-11-03" }` explicitly confirms ongoing use on the given day. Use the actual confirmation day. This assertion remains until edited; the page displays its date rather than silently renewing it.

No tool in the migrated seed is confirmed as current. Preserved descriptions are earlier wording, not new current-use assertions.
The shared schema and date/period checks run in `bun run test` and CI. No semantic validation preflight is added to Nuxt.

## License

[MIT](LICENSE)
