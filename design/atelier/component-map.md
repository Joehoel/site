# Atelier Mono — Dark · Component-map

Mapping van de redesign (Atelier Mono Dark) op de bestaande Nuxt 4 site. Status: **planning — nog niet bouwen.**

## Beslissing: component-library

- **Nuxt UI v4 blijft de basis.** Ontwerp is tokens- + layout-gedreven; weinig complexe widgets. Theming via `@theme` (tokens), `--ui-radius` (radius), `--font-*` (fonts, auto-geladen door `@nuxt/fonts`), en per-component `ui`-prop + `app.config.ui` / `<UTheme>`.
- **Base UI valt af: geen Vue-versie** (React-only). Vue-tegenhanger = **Reka UI** (ex-Radix Vue), waar Nuxt UI al bovenop draait → al transitieve dependency, vangnet als we ooit een kalere primitive nodig hebben.

## Vastgelegde keuzes

- **Projecten:** nieuwe Nuxt Content `projects`-collectie → `ProjectListItem` + "Selected Works" op homepage.
- **Blog-index stijl:** **Clean** (`blogindex-technical_6741f056`) als basis voor `PostListItem`.
- **Hairlines:** subtiele hairlines **behouden**, gestandaardiseerd op één token (`border-outline-variant`, één vaste opacity). Niet de strikte "no-border" uit de brief.
- **Notes:** volledige body inline tonen (zoals nu), maar met **herstylede compacte code-blocks** zodat ze niet lomp ogen.

## Fundament (geen component)

In `app/assets/css/main.css` + `app/app.config.ts`:

- Monochroom palet: `neutral` = Atelier-greys (`#0e0e0e`→`#e5e2e1`), `primary` = wit. Huidige rood/groen accenten verwijderen.
- `--ui-radius: 0rem` → scherpe hoeken overal.
- Fonts: **Space Grotesk** (headline/label) + **Manrope** (body) via `--font-*`.
- Dark als default mode.
- Material Symbols uit mockups → bestaande Iconify-set (lucide/mdi). Geen nieuwe icon-dep.
- Token-bron: `atelier-mono-dark.tokens.json`.
- **Atelier-greys koppelen aan Nuxt UI semantische aliassen** (`--ui-text`, `--ui-text-muted`, `--ui-text-dimmed`, `--ui-bg`, `--ui-bg-muted`, `--ui-border`) → één bron van waarheid voor eigen klassen én UButton/UBadge.

## Token-ladder (canoniek — lost Stitch-inconsistenties op)

Stitch gebruikte dezelfde waarde op 3–4 manieren. Canoniek:

| Rol                          | Atelier token                         | hex                   | Nuxt UI alias      |
| ---------------------------- | ------------------------------------- | --------------------- | ------------------ |
| Basis-achtergrond / nav-glas | `surface` (+`/70`)                    | `#131313`             | `bg-default`       |
| Verhoogd vlak / lijst-hover  | `surface-container-low`               | `#1c1b1b`             | `bg-muted`         |
| Card / interactief           | `surface-container-high` / `-highest` | `#2a2a2a` / `#353534` | `bg-elevated`      |
| Inset / code-block           | `surface-container-lowest`            | `#0e0e0e`             | —                  |
| Heading-tekst                | `primary`                             | `#ffffff`             | `text-highlighted` |
| Body-tekst                   | `on-surface`                          | `#e5e2e1`             | `text-default`     |
| Gedempte body                | `on-surface-variant`                  | `#c6c6c6`             | `text-muted`       |
| Meta / label                 | `outline`                             | `#919191`             | `text-dimmed`      |
| Faint / hairline             | `outline-variant`                     | `#474747`             | `border-default`   |

**Vervang overal:** `text-white`→`text-primary` (headings) · `text-gray-*/neutral-*`→ `on-surface-variant`/`outline`/`outline-variant` · `bg-[#131313]`/`neutral-950`→`surface` · `border-white/x`→`border-outline-variant` (één opacity) · `font-['…']`→ `font-headline/body/label`.

## Type-schaal (rol-gebaseerd — encoderen in componenten)

| Rol                              | Klasse                                                                    |
| -------------------------------- | ------------------------------------------------------------------------- |
| Display (page hero, 1×/pagina)   | `font-headline font-bold tracking-[-0.04em] text-5xl md:text-7xl`         |
| Title (artikel-titel)            | `font-headline font-bold tracking-[-0.04em] text-4xl md:text-5xl`         |
| Heading (sectie H2)              | `font-headline font-bold tracking-tight text-2xl`                         |
| Subheading (lijst/card-titel H3) | `font-headline text-xl md:text-2xl`                                       |
| Eyebrow (label)                  | `font-label text-[0.6875rem] uppercase tracking-[0.1em] text-outline`     |
| Body                             | `font-body text-base leading-relaxed` (muted = `text-on-surface-variant`) |

Dropt Stitch-uitschieters (home `8xl`, Technical-Log `4xl`).

## Component-map (met geverifieerde Nuxt UI basis)

| Component                                                  | Status                                              | Nuxt UI / basis                                                                         | Gebruikt op                                                                                          |
| ---------------------------------------------------------- | --------------------------------------------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| AppHeader / TopNav                                         | Herbouw (`layout/Header.vue`)                       | eigen + tokens                                                                          | overal — wordmark `JK//DEV`, uppercase nav, active=onderstreep, glas (`bg-surface/70 backdrop-blur`) |
| AppFooter                                                  | Herbouw (`layout/Footer.vue`)                       | eigen + tokens                                                                          | overal                                                                                               |
| Search-trigger + modal                                     | Hergebruik (`Search.vue`)                           | **`UContentSearchButton` + `UContentSearch`** (Pagefind, ⌘K, theme-command)             | header                                                                                               |
| ⌘K-hint                                                    | Hergebruik                                          | **`UKbd`**                                                                              | search-trigger                                                                                       |
| ThemeToggle                                                | Hergebruik (in Header)                              | eigen                                                                                   | header                                                                                               |
| Button                                                     | Hergebruik                                          | **`UButton`** (`square`, `variant=solid` CTA / `ghost\|link` tertiair, `color=neutral`) | "LOAD_ARCHIVE", "VIEW_ALL_LOGS", CTA                                                                 |
| Eyebrow (`// LABEL`)                                       | **Nieuw** (mini)                                    | tokens                                                                                  | élk scherm — hoogst herbruikbaar                                                                     |
| SectionHeader (Eyebrow + heading + meta)                   | **Nieuw**                                           | eigen (composeert Eyebrow)                                                              | home, blog-index, uses                                                                               |
| MetaRow (`DATUM — hairline — CATEGORIE`)                   | **Nieuw** (mini)                                    | tokens (+ `USeparator`/div)                                                             | home-log, blog-index, blogpost-header                                                                |
| Tag (tech/topic-pill)                                      | **Nieuw** of herthema'd                             | **`UBadge`** (níét UChip — die is een status-dot)                                       | home, index, post                                                                                    |
| FilterChip (ALL / RUST…)                                   | **Nieuw**                                           | **`UButton`** `variant=ghost` `size=xs`                                                 | blog-index                                                                                           |
| PostListItem (datum/№ + titel + desc + tags + ↗)           | Herbouw (vervangt `blog/PostPreview.vue`)           | eigen                                                                                   | home "Technical Log" **én** blog-index (1 component, stijl = Clean 6741f056)                         |
| ProjectListItem (`01` + titel + chips + ↗)                 | **Nieuw**                                           | eigen                                                                                   | home "Selected Works"                                                                                |
| PostMasthead (blog-post kop)                               | Herbouw (`blog/Masthead.vue`)                       | eigen                                                                                   | blogpost                                                                                             |
| NoteCard                                                   | Herbouw (`note/Card.vue`)                           | eigen                                                                                   | home, notes — volledige body inline, code herstyled                                                  |
| CodeBlock (+ `// SOURCE` label, compact)                   | Herbouw/uitbreiden (`content/ProsePre.vue` + Shiki) | eigen                                                                                   | blogpost, notes                                                                                      |
| Callout / pull-quote ("Architect's Note")                  | **Nieuw** (MDC prose-component)                     | eigen                                                                                   | blogpost                                                                                             |
| SpecItem (uses-rij: label + naam + desc + status-badge)    | **Nieuw** (MDC)                                     | eigen (status = `UBadge`)                                                               | /uses Hardware                                                                                       |
| SpecCard (uses-card: icoon + categorie + naam + `/`-lijst) | **Nieuw** (MDC)                                     | eigen                                                                                   | /uses Software                                                                                       |
| Timestamp                                                  | Hergebruik (`content/Timestamp.vue`)                | eigen                                                                                   | overal                                                                                               |
| Prose-stijl (body=Manrope, headings=Space Grotesk)         | Herstylen                                           | `@nuxt/content` + main.css                                                              | blogpost, notes, uses                                                                                |

### Hoogst herbruikbare nieuwe mini's

`Eyebrow`, `MetaRow`, `Tag`, `FilterChip`, `PostListItem` — dekken het grootste deel van alle schermen.

### Naamgeving

Volgt de bestaande dir-prefix conventie (`app/components/blog/PostPreview.vue` → `<BlogPostPreview>`). Gedeelde primitives komen op root of in een gedeelde map; content/MDC-componenten onder `content/`.

## Buiten scope (tenzij later gewenst)

- Benchmark-chart (blogpost) — data-afhankelijk, bespoke.
- `CODE_REF` watermark + "Initiate Collaboration"-blok (home-variant 584b01b4).
- TOC-zijbalk op blogpost (Nuxt Content TOC bestaat wel).

## Open punten voor later

- `projects`-collectie schema (titel, beschrijving, techstack[], link, volgorde, draft, coverImage).
- Notes-mapping op homepage (eigen sectie vs. samen met log).
