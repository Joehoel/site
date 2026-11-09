export const issue87Fixtures = {
  uses: { collection: "pages", path: "/uses", file: "pages/uses.md" },
  note: { collection: "notes", path: "/notes/laravel-nixpacks", file: "notes/laravel-nixpacks.md" },
  article: { collection: "posts", path: "/log/powerpoint-inverter", file: "posts/powerpoint-inverter.md" },
  synthetic: { collection: null, path: null, file: null },
} as const;

export const issue87Renderers = {
  baseline: "ContentRenderer / Content v3 parse",
  bridge: "MarkdownDocument / structural Content v3 bridge",
  native: "MarkdownDocument / native Comark parse (informative)",
} as const;

export const issue87Synthetic = `---
title: Synthetic compatibility fixture
description: Throwaway text, not a personal role claim.
publishDate: 2026-11-02
probeLabel: Synthetic frontmatter binding
---

## Synthetic heading

Before :current-role-probe{label="SYNTHETIC INLINE"} after.

Frontmatter binding: {{ probeLabel }}.

Namespaced binding: {{ frontmatter.probeLabel }}.

Runtime binding: {{ data.runtimeLabel }}.

::prose-callout{label="Synthetic callout"}
Callout **default slot** content.
::

::slot-probe{label="Synthetic prop"}
Default slot paragraph.

#details
Named slot **details** paragraph.
::

\`\`\`ts [probe.ts] {2}
const first = "  keep  ";
\tconst second = 2;

  console.log(first, second);
\`\`\`

[Synthetic link](https://example.com/probe)
`;
