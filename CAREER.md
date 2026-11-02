# Career data reference

`content/career.yml` is the single career document in the `career` data collection.
Nuxt Studio exposes its nested fields for editing.
The document contains only confirmed roles, without inferred history or achievements.

## Role fields

- `id` is a unique, stable lowercase ASCII slug. It does not change when the title changes.
- `employer.name` and `title` are required nonempty strings.
- `employer.url` is an optional absolute HTTP or HTTPS URL.
- `start` is required. `end` is optional. An absent end leaves the period open.
- `summary` is an optional nonempty string containing supplied information.
- `primary` is an optional boolean. At most one role can have `primary: true`.

## Calendar periods

Dates are quoted strings in `YYYY`, `YYYY-MM`, or `YYYY-MM-DD` form, with years between `0001` and `9999`.
The stored string retains its supplied precision.
For example, `"2026-02"` does not assert a February 1 start date.

Comparison includes the entire supplied period.
A start of `"2026-02"` includes February 1 onward.
An end of `"2026-02"` includes February 28.
A year-only end includes December 31.
Leap years follow the Gregorian calendar.
Invalid calendar values and periods whose earliest start is after their latest end are rejected.
Comparison bounds never replace stored dates.

## Selection and ordering

`shared/career.ts` exports `careerSchema`, `asOfSchema`, `orderRoles`, and `selectCurrent`.
Use `careerSchema.parse(data)` to validate raw data. Invalid data throws a `ZodError` with field paths.
Use `asOfSchema.parse(day)` for an explicit full calendar day.
`Career`, `Role`, and `AsOf` are inferred from the Zod schemas.
The module does not read the clock.

Roles sort by their most recent start bound, then by ascending ASCII ID.
Ordering and selection do not mutate the input.
Current selection has these outcomes:

- `none` when no role is active.
- `selected` when one role is active, or an active primary role resolves an overlap.
- `ambiguous` with ordered active roles when an overlap has no active primary role.

Future and completed roles are not active.
An inactive primary role does not resolve an overlap.
Array order never chooses the current role.

## Validation

`careerSchema` in `shared/career.ts` owns the field structure and semantic rules.
`content.config.ts` uses that same schema for Content and Studio.
`nuxt.config.ts` parses the actual career YAML and calls `careerSchema.parse` when Nuxt loads its configuration.
Invalid career data stops configuration loading, so a build cannot silently omit it.
The `content:file:afterParse` hook also calls `careerSchema.parse` for every career ingestion, including development updates.
Content can warn and skip an invalid update rather than stop the process.
Content's JSON Schema conversion drops custom refinements, so both runtime validation calls are required.

## Static publication

The site publishes static pages.
Scheduled role changes require a site rebuild with an updated reference date.
Stored dates alone do not update a deployed page at midnight.
Published career edits require a rebuild to appear on the deployed site.

`bun run test` runs the deterministic checks with Node 24.
