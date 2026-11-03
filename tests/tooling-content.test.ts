import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { parse, stringify } from "yaml";
import { deriveTooling, toolingSchema } from "../shared/tooling.ts";

test("the actual tooling YAML validates without losing authored fields, Markdown or precision", () => {
  const authored = parse(readFileSync(new URL("../content/tooling.yml", import.meta.url), "utf8"));
  assert.deepEqual(toolingSchema.parse(authored), authored);
});

test("YAML roundtrips nullable dates, endpoint variants, contexts and period arrays", () => {
  const source = `tools:
  - id: editor
    name: Editor
    category: Development
    url: https://example.com/
    description: |-
      - Exact **Markdown**, [link](https://example.com/) and :timestamp{date="2025-06-03"}
      - Unicode é and \`code\`
    periods:
      - start: null
        end: { kind: ended, date: null }
        context: Known departure, unknown dates.
      - start: "2024"
        end: { kind: ended, date: "2024-02" }
      - start: "2025-06-03"
        end: { kind: unknown }
      - start: null
        end: { kind: ongoing, verifiedOn: "2026-11-03" }
`;
  const authored = parse(source);
  const document = toolingSchema.parse(authored);
  assert.deepEqual(document, authored);
  assert.deepEqual(toolingSchema.parse(parse(stringify(document))), authored);
  assert.deepEqual(
    deriveTooling(document, "2026-11-03").current.map((entry) => entry.id),
    ["editor"],
  );
});

test("YAML unknown endpoints do not imply current and unknown-ended departures remain historical", () => {
  const document = toolingSchema.parse(
    parse(`tools:
  - id: unconfirmed
    name: Unconfirmed
    category: Apps
    description: Earlier wording, not a current assertion.
    periods:
      - start: null
        end: { kind: unknown }
  - id: departed
    name: Departed
    category: Apps
    description: Known past use.
    periods:
      - start: null
        end: { kind: ended, date: null }
`),
  );
  const view = deriveTooling(document, "2026-11-03");
  assert.deepEqual(view.current, []);
  assert.deepEqual(
    view.unconfirmed.map((entry) => entry.id),
    ["unconfirmed"],
  );
  assert.deepEqual(
    view.timeline.map((entry) => [entry.tool.id, entry.state]),
    [
      ["departed", "historical"],
      ["unconfirmed", "unconfirmed"],
    ],
  );
});

test("numeric YAML years are rejected instead of inventing date precision", () => {
  const document = {
    tools: [
      {
        id: "editor",
        name: "Editor",
        category: "Apps",
        description: "Copy",
        periods: [{ start: 2026, end: { kind: "unknown" } }],
      },
    ],
  };
  const result = toolingSchema.safeParse(parse(stringify(document)));
  assert.equal(result.success, false);
  if (!result.success)
    assert.deepEqual(result.error.issues[0]?.path, ["tools", 0, "periods", 0, "start"]);
});

test("an empty YAML tools array is an honest empty setup", () => {
  const document = toolingSchema.parse(parse("tools: []"));
  assert.deepEqual(deriveTooling(document, "2026-11-03"), {
    current: [],
    unconfirmed: [],
    timeline: [],
  });
});

test("malformed tooling YAML fails before domain validation", () => {
  assert.throws(() => toolingSchema.parse(parse("tools: [")), { name: "YAMLParseError" });
});
