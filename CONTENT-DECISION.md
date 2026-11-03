# Content renderer decision

Decision date is 3 November 2026. This records the research for [issue #87](https://github.com/Joehoel/site/issues/87).

## Decision

Retain Nuxt Content 3.14.0, MDC 0.22.0 and Nuxt Studio 1.7.0.
Do not merge the Comark experiment into the site.
Defer a production migration until it solves a concrete requirement and passes this site's compatibility checks.

Readers keep the existing rendering and code-copy behavior. Authors keep the existing Markdown/MDC contract and local Studio workflow.
Maintainers avoid a second renderer adapter without a demonstrated reader benefit.
This decision does not approve package upgrades or certify every existing Content behavior.

## Versions and provenance

The renderer experiment started from commit `1bbd2700ccc237ee21ac91745e08cdd5c635a723`.
It tested Comark and `@comark/vue` 0.8.1 in isolation, with Vue 3.5.43, while retaining Content 3.14.0 and Studio 1.7.0.
It was not a Content v4 migration.

The later retained-stack production check used commit `ae0ea5e37ba3c3e8d51397f7503672d8225ca2e7`, Node 24.22.2, Vue 3.5.38 and the existing lockfile.
Its results do not certify the experimental renderer on that newer base.

On the decision date, the npm registry reported Content 3.16.2 as latest and no published v4 version.
The upstream v4 development branch is not a stable release.
The separate `comark-content` 0.5.0 package and Studio 1.8.0 were not tested here.

## Experiment results

Only 45 of 48 planned renderer profiles completed. Failed or incomplete runs remain failures or unknowns.

| Check                          | Observation                                                                                                                                                         | Conclusion                                                                                                             |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Structural bridge              | Twelve development cases preserved observed text, headings, links, slots and code props for the existing Uses page, note and article.                               | Narrow compatibility evidence, not final-source or pixel parity.                                                       |
| Bare frontmatter binding       | ContentRenderer rendered the synthetic value. The bridge rendered an empty value.                                                                                   | Existing binding syntax is not preserved.                                                                              |
| Native code copying            | The public note copied 4819 rather than 4820 characters. Each of six Python blocks lost its terminal newline in all four profiles.                                  | The native copy contract regressed.                                                                                    |
| Synthetic tab                  | Content parsing expanded the tab in the baseline and bridge.                                                                                                        | Do not attribute this pre-existing difference to Comark.                                                               |
| Native binding hydration       | Four synthetic cases logged Vue hydration mismatches despite equal final visible text.                                                                              | Equal post-hydration text is not a hydration pass.                                                                     |
| Native Uses                    | Three profiles failed with HTTP 500 or timeout; one also recorded Vite reload errors.                                                                               | Recovery and final-source compatibility remain unverified. The cause is not established as a permanent library defect. |
| Headings and TOC               | Recorded heading IDs and TOC data matched for inspected examples. The experiment did not click anchors or cover unusual duplicate slugs.                            | Partial evidence only.                                                                                                 |
| Highlighting and visual parity | Bridge screenshots showed distinct themes. No complete visual-diff gate exists. Later language-registration edits were not browser-retested.                        | Do not claim final highlighting or visual parity.                                                                      |
| Studio                         | Studio 1.7 completed an actual local Uses visual edit, source edit, save and reopen. Frontmatter, 14 component-prop records and expected semantic content survived. | Local MDC authoring passed. Native Comark authoring and production authentication were not tested.                     |
| Final candidate build          | A corrected log reached build completion. The built candidate was not served and crawled.                                                                           | Build output alone does not prove runtime compatibility.                                                               |

Early baseline screenshots named light mode actually rendered dark mode.
A corrected historical development run verified both actual theme classes.
Neither result establishes complete native Comark parity.

## Retained-stack checks

The later Node-server production build exited successfully.
The browser check verified desktop and mobile in actual light and dark themes, public navigation and search, both RSS feeds, a 13-URL sitemap, canonical metadata, current-role bindings and compiled career YAML.
TOC clicks, direct anchors and 28 code-copy comparisons passed across four profiles.
No hydration mismatch or uncaught JavaScript exception was recorded.

That check also found separate defects or limits.

- Anonymous posts and notes SQL downloads exposed synthetic draft title and body markers despite direct draft routes returning 404. Query-level draft filtering does not prevent database disclosure. A publication-boundary fix requires its own verification.
- The configured Vercel image URL returned 404 on the local Node server, while the original JPEG returned 200. This does not establish a deployed Vercel optimizer failure.

These findings prevent an all-checks-passed claim for the retained stack.
They do not justify adopting the experimental renderer.

## Alternatives

The direct Vue bridge preserves the current content layer, but adds an adapter, a Vue upgrade, another wrapper and binding repairs.
Its maintenance cost is not justified by a demonstrated site requirement.

A native parser would also change the AST and code-byte contract.
It needs explicit component mappings, supported Vue/Shiki versions and a separately verified editor workflow.

Replacing Content with `comark-content` changes collection, query, editor and deployment contracts.
That is a separate migration, not a renderer substitution.

## Reopen criteria and rollback

Reopen the decision for a concrete user-facing requirement or a suitable supported upstream integration.
Pin one source commit and lockfile for the complete run.
Test shared schemas and YAML, inline bindings, named/default slots, code whitespace and terminal newlines, headings, TOC interaction, unusual slugs, languages, themes, feeds, search, navigation and draft non-disclosure.
Serve the actual production artifact. Verify a real Studio save and reopen separately from serialization tests.

No production rollback is needed for this decision because the experiment is not adopted.
For a later approved experiment, retain the original content and baseline evidence.
Revert only that experiment's commits, restoring its renderer, configuration and lockfile together.
Do not reset unrelated work.

## Sources

- [Content documentation](https://content.nuxt.com/docs/getting-started)
- [Content npm registry](https://registry.npmjs.org/%40nuxt%2Fcontent)
- [Content releases](https://api.github.com/repos/nuxt/content/releases?per_page=5)
- [MDC migration guidance](https://comark.dev/kb/migration-from-mdc)
- [Comark Content registry](https://registry.npmjs.org/comark-content)
- [Studio registry](https://registry.npmjs.org/nuxt-studio)
