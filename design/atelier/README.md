# Atelier Mono — Dark ("The Monastic Engineer")

Reference assets pulled from Google Stitch for the site redesign.
Source: Stitch project `joelkuijper.me` (`12493485330470827314`), design system asset `f4b6723c2a4341a498518c0f3589e85a`.

**Direction chosen:** Dark / Functional Brutalism — dark monochrome surfaces, Space Grotesk (display/label) + Manrope (body), **0px radius everywhere**, no border dividers (boundaries via surface tonal shifts), tonal-layering instead of drop shadows, glassmorphism for floating nav.

## Files
- `atelier-mono-dark.md` — full design brief (north star, color/surface rules, typography, components, do's & don'ts).
- `atelier-mono-dark.tokens.json` — the color tokens, fonts, radius, spacing.
- `screens/` — screenshots (`.png`) + generated markup (`.html`) for each screen. The HTML uses Tailwind (CDN) with the exact token config — handy as a starting point, but it is throwaway reference, not production code.

## Screens for the dark direction (by site page)

| Site page | Screen file(s) | Notes |
|---|---|---|
| **Home / portfolio** | `home_d72e5479` | Cleanest: huge Space Grotesk hero, "Selected Works" list, Technical Log feed. **Primary reference.** |
| | `home-technical_584b01b4` | Alt hero w/ `CODE_REF` watermark + "Initiate Collaboration" CTA. |
| **Blog index** | `blogindex-technical_6741f056` | Clean dark list, search + filter chips. **Primary reference.** |
| | `blogindex-soft_86c97f4f` | Softer/editorial dark variant. |
| | `blogindex-green_889f7f3e` | Green-on-black terminal/monospace variant (more extreme). |
| **Blog post** | `blogpost-technical_5f3e3884` | Article w/ code block, pull-quote, benchmark chart, `// SECTION` labels. **Primary reference.** |
| **/uses** | `uses-setup_ff250cfc` | "Technical configuration for focused production" — Hardware/Software/Workspace sections. |

Light-direction screens (Silent Curator) were **not** downloaded — only the dark set. One screen titled "Blog Index - Technical Deep Dives" (`c4bddf61`) turned out to be a light exploration and was skipped.

## Current site mapping (Nuxt 4)
- Home → `app/pages/index.vue`
- Blog index → posts listing; Blog post → `[...slug].vue` (layout `post.vue`)
- /uses → `content/pages/uses.md`
- Tokens land in `app/assets/css/main.css` (`@theme` + `[data-theme]`/`.dark`); the site already runs `@nuxtjs/color-mode` with `.dark`.
