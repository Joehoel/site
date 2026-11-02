import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { parse as parseYaml } from "yaml";
import { z } from "zod";
import { careerSchema } from "../shared/career.ts";

test("the actual career YAML validates without changing supplied fields or date precision", () => {
  const source = readFileSync(new URL("../content/career.yml", import.meta.url), "utf8");
  const authored = parseYaml(source);
  assert.deepEqual(careerSchema.parse(authored), authored);
});

for (const date of ["2026", "2026-02", "2024-02-29"]) {
  test(`YAML parsing preserves quoted ${date} precision without filling missing dates`, () => {
    const career = careerSchema.parse(
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
  assert.deepEqual(careerSchema.parse(parseYaml("roles: []")), { roles: [] });
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
    path: ["roles", 0, "start"],
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
    path: ["roles", 0, "end"],
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
    path: ["roles", 1, "id"],
  },
];

for (const { name, source, path } of invalidDocuments) {
  test(`career YAML rejects ${name} with a field-addressed error`, () => {
    const result = careerSchema.safeParse(parseYaml(source));
    assert.equal(result.success, false);
    if (!result.success) {
      assert.ok(result.error instanceof z.ZodError);
      assert.deepEqual(result.error.issues[0]?.path, path);
    }
  });
}

test("a numeric YAML year is rejected rather than silently coerced into a date", () => {
  const result = careerSchema.safeParse(
    parseYaml(`
roles:
  - id: example
    employer:
      name: Example
    title: Developer
    start: 2026
`),
  );
  assert.equal(result.success, false);
  if (!result.success) {
    assert.ok(result.error instanceof z.ZodError);
    assert.deepEqual(result.error.issues[0]?.path, ["roles", 0, "start"]);
  }
});

test("malformed career YAML fails before domain parsing", () => {
  assert.throws(() => careerSchema.parse(parseYaml("roles: [")), { name: "YAMLParseError" });
});
