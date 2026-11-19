---
title: Brag
description: Public contributions and results.
publishDate: 2026-11-03
updatedDate: 2026-11-19
---

::spec-hero{:title="title"}
Last updated :timestamp{:date="updatedDate"}.
::

::spec-section{.github-activity heading="Activity"}
:github-contributions
::

::spec-section{heading="Contributions" layout="rows"}
:::spec-item{label="Nuxt Sanity" name="TypeGen support" status="Merged"}
Added automatic TypeScript type generation for GROQ queries to the [Nuxt Sanity](https://sanity.nuxtjs.org) module, using `@sanity/codegen`. `groq`, `defineQuery` and the generated query result types are auto-imported, and the Sanity query composables can use those types. Merged in January 2026 as [nuxt-modules/sanity#1374](https://github.com/nuxt-modules/sanity/pull/1374).
:::

:::spec-item{label="Knip" name="Varlock plugin support" status="Merged"}
Added built-in [Varlock](https://varlock.dev) support to [Knip](https://knip.dev), so packages and local files referenced by Varlock env-spec configuration are no longer reported as unused or unresolved. Merged in September 2026 as [webpro-nl/knip#2000](https://github.com/webpro-nl/knip/pull/2000).
:::
::
