import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { parseMarkdown } from "@nuxtjs/mdc/runtime/parser/index";
import { selectCurrent, type Role } from "../shared/career.ts";
import { currentRoleSentence, homeSchema } from "../shared/home.ts";

const source = readFileSync(new URL("../content/index.md", import.meta.url), "utf8");
const document = await parseMarkdown(source);
const fixtureCopy = { rolePrefix: "I'm a", employerPrefix: "at the" };
const asOf = "2026-11-02";

function role(fields: Partial<Role> = {}): Role {
  return {
    id: "developer",
    title: "Full-stack Developer",
    employer: { name: "Evangelische Omroep" },
    start: "2026-02",
    ...fields,
  };
}

test("the home Markdown supplies editable copy without an authored path or publication date", () => {
  homeSchema.parse(document.data);
  assert.equal("path" in document.data, false);
  assert.equal("publishDate" in document.data, false);
});

test("the home body has one current role inside a paragraph with explicit data bindings", () => {
  type Node = (typeof document.body.children)[number];
  let currentRoleCount = 0;

  function visit(node: Node, ancestors: Node[] = []) {
    if (node.type !== "element") return;
    if (node.tag === "current-role") {
      currentRoleCount++;
      assert.ok(ancestors.some((ancestor) => ancestor.type === "element" && ancestor.tag === "p"));
      assert.deepEqual(node.props, {
        ":selection": "currentSelection",
        ":role-prefix": "rolePrefix",
        ":employer-prefix": "employerPrefix",
      });
    }
    for (const child of node.children) visit(child, [...ancestors, node]);
  }

  for (const child of document.body.children) visit(child);
  assert.equal(currentRoleCount, 1);
});

test("the canonical role and copy fixtures preserve the approved introduction", () => {
  const canonical = role();
  assert.equal(
    `${currentRoleSentence(selectCurrent({ roles: [canonical] }, asOf), fixtureCopy)} I write about what I build and learn.`,
    "I'm a full-stack developer at the Evangelische Omroep. I write about what I build and learn.",
  );
  assert.equal(canonical.title, "Full-stack Developer");
});

test("none describes missing career data without claiming unemployment", () => {
  assert.equal(
    currentRoleSentence({ kind: "none" }, fixtureCopy),
    "I don't have a current role listed.",
  );
});

for (const [name, roles] of [
  ["empty", []],
  ["ended", [role({ end: "2026-10" })]],
  ["future", [role({ start: "2027" })]],
] satisfies [string, Role[]][]) {
  test(`${name} careers do not name an employer as current`, () => {
    assert.equal(
      currentRoleSentence(selectCurrent({ roles }, asOf), fixtureCopy),
      "I don't have a current role listed.",
    );
  });
}

test("multiple active roles without a primary produce an honest ambiguity sentence", () => {
  const roles = [role(), role({ id: "second", employer: { name: "Another employer" } })];
  assert.equal(
    currentRoleSentence(selectCurrent({ roles }, asOf), fixtureCopy),
    "More than one current role is listed.",
  );
});

test("an active primary role supplies the sentence during an overlap", () => {
  const roles = [
    role(),
    role({ id: "primary", employer: { name: "Primary employer" }, primary: true }),
  ];
  assert.equal(
    currentRoleSentence(selectCurrent({ roles }, asOf), fixtureCopy),
    "I'm a full-stack developer at the Primary employer.",
  );
});

test("title and employer edits propagate while the canonical title keeps its casing", () => {
  const updated = role({ title: "Platform Engineer", employer: { name: "New Employer" } });
  assert.equal(
    currentRoleSentence(selectCurrent({ roles: [updated] }, asOf), fixtureCopy),
    "I'm a platform engineer at the New Employer.",
  );
  assert.equal(updated.title, "Platform Engineer");
});

test("authors can change the article and employer prefix without changing the component", () => {
  const updated = role({ title: "Engineer", employer: { name: "Acme" } });
  assert.equal(
    currentRoleSentence(selectCurrent({ roles: [updated] }, asOf), {
      rolePrefix: "I'm an",
      employerPrefix: "at",
    }),
    "I'm an engineer at Acme.",
  );
});
