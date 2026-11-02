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

`shared/career.ts` exports `parseCareer`, `parseAsOf`, `orderRoles`, and `selectCurrent`.
`parseCareer` validates raw data and throws a path-addressed `TypeError` for invalid data.
`parseAsOf` requires an explicit full calendar day.
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

`content.config.ts` declares the editable field structure for Content and Studio.
`parseCareer` in `shared/career.ts` owns the semantic rules.
`nuxt.config.ts` parses the actual career YAML and validates it when Nuxt loads its configuration.
Invalid career data stops configuration loading, so a build cannot silently omit it.
The `content:file:afterParse` hook also validates every career ingestion, including development updates.
Content can warn and skip an invalid update rather than stop the process.
Studio's field schema does not enforce every semantic rule.

## Static publication

The site publishes static pages.
Scheduled role changes require a site rebuild with an updated reference date.
Stored dates alone do not update a deployed page at midnight.
Published career edits require a rebuild to appear on the deployed site.

`bun run test` runs the deterministic checks with Node 24.
