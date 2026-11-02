import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { parse as parseYaml } from "yaml";
import { parseCareer } from "../shared/career.ts";

test("the actual career YAML contains only the confirmed month-precision EO role", () => {
  const source = readFileSync(new URL("../content/career.yml", import.meta.url), "utf8");
  assert.deepEqual(parseCareer(parseYaml(source)), {
    roles: [
      {
        id: "eo-full-stack-developer-2026",
        employer: { name: "Evangelische Omroep" },
        title: "Full-stack Developer",
        start: "2026-02",
      },
    ],
  });
});

for (const date of ["2026", "2026-02", "2024-02-29"]) {
  test(`YAML parsing preserves quoted ${date} precision without filling missing dates`, () => {
    const career = parseCareer(
      parseYaml(`
roles:
  - id: example
    employer:
      name: Example
    title: Developer
    start: "${date}"
    end: "${date}"
`),
    );
    assert.equal(career.roles[0]?.start, date);
    assert.equal(career.roles[0]?.end, date);
  });
}

test("an empty YAML roles list remains empty", () => {
  assert.deepEqual(parseCareer(parseYaml("roles: []")), { roles: [] });
});

const invalidDocuments = [
  {
    name: "invalid calendar date",
    source: `
roles:
  - id: example
    employer:
      name: Example
    title: Developer
    start: "2026-02-29"
`,
    error: /roles\[0\]\.start: invalid calendar date/,
  },
  {
    name: "end before start",
    source: `
roles:
  - id: example
    employer:
      name: Example
    title: Developer
    start: "2026-02"
    end: "2026-01"
`,
    error: /roles\[0\]\.end: period ends before it starts/,
  },
  {
    name: "duplicate role IDs",
    source: `
roles:
  - id: example
    employer:
      name: Example
    title: Developer
    start: "2026-02"
  - id: example
    employer:
      name: Another employer
    title: Another title
    start: "2025"
`,
    error: /roles\[1\]\.id: duplicate role ID/,
  },
];

for (const { name, source, error } of invalidDocuments) {
  test(`career YAML rejects ${name} with a field-addressed error`, () => {
    assert.throws(() => parseCareer(parseYaml(source)), { name: "TypeError", message: error });
  });
}

test("a numeric YAML year is rejected rather than silently coerced into a date", () => {
  assert.throws(
    () =>
      parseCareer(
        parseYaml(`
roles:
  - id: example
    employer:
      name: Example
    title: Developer
    start: 2026
`),
      ),
    { name: "TypeError", message: /roles\[0\]\.start: expected a nonempty string/ },
  );
});

test("malformed career YAML fails before domain parsing", () => {
  assert.throws(() => parseCareer(parseYaml("roles: [")), { name: "YAMLParseError" });
});
