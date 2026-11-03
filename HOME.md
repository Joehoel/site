# Edit the home introduction

Edit `content/index.md` in Nuxt Studio or as Markdown.
This home singleton uses the conventional `index.md` filename so its preview opens the homepage at `/`.
The title supplies the existing heading, so do not add a body heading.
Keep the inline `:current-role` component and its three bindings in the same paragraph as the surrounding copy.

Edit the role title and employer in `content/career.yml`, not in the home body or SEO copy.
Keep the supplied date precision as described in [Career data reference](CAREER.md).
Adjust `rolePrefix` or `employerPrefix` when the sentence needs a different article or preposition.
Update `description` alongside the writing sentence to keep plain SEO copy aligned.

To show the Work section, enable `showWorkHistory` in Studio or set it to `true` in `content/index.md`.
The section starts off so you can review the career data before showing it publicly.
It uses `content/career.yml` and preserves year, month, or day precision in each period.
If no roles are listed, the section stays hidden even when enabled.

Run `bun run test` with Node 24 before publishing.
Rebuild the static site after content edits or when a scheduled role becomes current.
