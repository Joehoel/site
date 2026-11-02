import assert from "node:assert/strict";
import { test } from "node:test";
import { orderRoles, parseAsOf, parseCareer, selectCurrent } from "../shared/career.ts";

function role(id = "role-a", fields: Record<string, unknown> = {}) {
  return {
    id,
    employer: { name: "Example employer" },
    title: "Developer",
    start: "2026-02",
    ...fields,
  };
}

test("empty, future, and completed careers have no current role", () => {
  for (const roles of [
    [],
    [role("future", { start: "2027" })],
    [role("completed", { start: "2024", end: "2025" })],
    [role("future", { start: "2027" }), role("completed", { start: "2024", end: "2025" })],
  ]) {
    assert.deepEqual(selectCurrent(parseCareer({ roles }), parseAsOf("2026-11-02")), {
      kind: "none",
    });
  }
});

test("one active role is selected without an explicit primary", () => {
  const career = parseCareer({ roles: [role()] });
  assert.deepEqual(selectCurrent(career, parseAsOf("2026-11-02")), {
    kind: "selected",
    role: career.roles[0],
  });
});

test("overlap is explicit and ordered, regardless of false primary flags", () => {
  const career = parseCareer({
    roles: [role("older", { start: "2025", primary: false }), role("newer")],
  });
  assert.deepEqual(selectCurrent(career, parseAsOf("2026-11-02")), {
    kind: "ambiguous",
    roles: [career.roles[1], career.roles[0]],
  });
});

test("an active primary resolves overlap even when another role starts later", () => {
  const career = parseCareer({
    roles: [role("primary", { start: "2025", primary: true }), role("newer")],
  });
  assert.deepEqual(selectCurrent(career, parseAsOf("2026-11-02")), {
    kind: "selected",
    role: career.roles[0],
  });
});

test("future and completed primary roles cannot resolve an active overlap", () => {
  for (const primary of [
    role("primary", { start: "2027", primary: true }),
    role("primary", { start: "2024", end: "2025", primary: true }),
  ]) {
    const career = parseCareer({ roles: [primary, role("active-a"), role("active-b")] });
    assert.deepEqual(selectCurrent(career, parseAsOf("2026-11-02")), {
      kind: "ambiguous",
      roles: [career.roles[1], career.roles[2]],
    });
    const single = parseCareer({ roles: [primary, role("active")] });
    assert.deepEqual(selectCurrent(single, parseAsOf("2026-11-02")), {
      kind: "selected",
      role: single.roles[1],
    });
  }
});

for (const period of [
  {
    start: "2024",
    end: "2024",
    before: "2023-12-31",
    first: "2024-01-01",
    last: "2024-12-31",
    after: "2025-01-01",
  },
  {
    start: "2024-02",
    end: "2024-02",
    before: "2024-01-31",
    first: "2024-02-01",
    last: "2024-02-29",
    after: "2024-03-01",
  },
  {
    start: "2026-02",
    end: "2026-02",
    before: "2026-01-31",
    first: "2026-02-01",
    last: "2026-02-28",
    after: "2026-03-01",
  },
  {
    start: "2024-02-29",
    end: "2024-02-29",
    before: "2024-02-28",
    first: "2024-02-29",
    last: "2024-02-29",
    after: "2024-03-01",
  },
]) {
  test(`${period.start} through ${period.end} includes the whole supplied period`, () => {
    const career = parseCareer({ roles: [role("role", period)] });
    for (const day of [period.first, period.last]) {
      assert.equal(selectCurrent(career, parseAsOf(day)).kind, "selected", day);
    }
    for (const day of [period.before, period.after]) {
      assert.equal(selectCurrent(career, parseAsOf(day)).kind, "none", day);
    }
  });
}

test("overlapping partial periods are valid without inventing more precise dates", () => {
  for (const [start, end] of [
    ["2026", "2026-01"],
    ["2026-12", "2026"],
    ["2026-02-28", "2026-02"],
  ]) {
    const career = parseCareer({ roles: [role("role", { start, end })] });
    assert.equal(career.roles[0]?.start, start);
    assert.equal(career.roles[0]?.end, end);
  }
});

test("all date precisions and optional supplied fields survive parsing and selection", () => {
  const input = {
    roles: [
      role("year", { start: "2024", end: "2024" }),
      role("month", { start: "2025-02", end: "2025-03" }),
      role("day", {
        start: "2026-02-28",
        employer: { name: "Example employer", url: "https://example.com/about" },
        summary: "Supplied summary.",
        primary: false,
      }),
    ],
  };
  const original = structuredClone(input);
  const career = parseCareer(input);
  assert.deepEqual(career, original);
  orderRoles(career);
  selectCurrent(career, parseAsOf("2026-11-02"));
  assert.deepEqual(career, original);
  assert.deepEqual(input, original);
});

test("ordering uses start bounds, then ASCII IDs, without mutating frozen inputs", () => {
  const career = parseCareer({
    roles: [
      role("a-2", { start: "2026" }),
      role("newest", { start: "2026-02" }),
      role("a-10", { start: "2026-01-01" }),
      role("a-1", { start: "2026-01" }),
    ],
  });
  const original = structuredClone(career);
  for (const item of career.roles) {
    Object.freeze(item.employer);
    Object.freeze(item);
  }
  Object.freeze(career.roles);
  Object.freeze(career);
  assert.deepEqual(
    orderRoles(career).map((item) => item.id),
    ["newest", "a-1", "a-10", "a-2"],
  );
  assert.equal(selectCurrent(career, parseAsOf("2026-11-02")).kind, "ambiguous");
  assert.deepEqual(career, original);
});

test("all input permutations produce the same ordering and current selection", () => {
  const a = role("a", { start: "2025" });
  const b = role("b", { start: "2026-01" });
  const c = role("c", { start: "2026-01-01" });
  for (const primary of [false, true]) {
    const third = { ...c, primary };
    const permutations = [
      [a, b, third],
      [a, third, b],
      [b, a, third],
      [b, third, a],
      [third, a, b],
      [third, b, a],
    ];
    const expected = parseCareer({ roles: permutations[0] });
    for (const roles of permutations) {
      const career = parseCareer({ roles });
      assert.deepEqual(orderRoles(career), orderRoles(expected));
      assert.deepEqual(
        selectCurrent(career, parseAsOf("2026-11-02")),
        selectCurrent(expected, parseAsOf("2026-11-02")),
      );
    }
  }
});

for (const date of [
  "2026-02-29",
  "1900-02-29",
  "2100-02-29",
  "2024-04-31",
  "0000",
  "10000",
  "2026-00",
  "2026-13",
  "2026-1",
  "2026-01-00",
  "2026-01-32",
  "2026-01-1",
  "2026-01-01T00:00:00Z",
  " 2026",
  "2026\n",
  "2026-02-01\n",
  "not-a-date",
]) {
  test(`invalid calendar value ${JSON.stringify(date)} is rejected at either period boundary`, () => {
    assert.throws(
      () => parseCareer({ roles: [role("role", { start: date })] }),
      /roles\[0\]\.start/,
    );
    assert.throws(() => parseCareer({ roles: [role("role", { end: date })] }), /roles\[0\]\.end/);
  });
}

test("full reference days validate leap years and the supported year range", () => {
  for (const date of ["0001-01-01", "2000-02-29", "2024-02-29", "9999-12-31"]) {
    assert.equal(parseAsOf(date), date);
  }
  for (const date of [
    "2026",
    "2026-02",
    "2026-02-29",
    "1900-02-29",
    "0000-01-01",
    "2026-11-02\n",
  ]) {
    assert.throws(() => parseAsOf(date), /asOf/);
  }
});

test("malformed documents and required fields are rejected", () => {
  const invalid: unknown[] = [
    null,
    [],
    {},
    { roles: null },
    { roles: "roles" },
    { roles: [null] },
    { roles: Array(1) },
    ...[
      { id: undefined },
      { id: "" },
      { id: "Role" },
      { id: "bad id" },
      { id: "role\n" },
      { employer: undefined },
      { employer: { name: " " } },
      { title: undefined },
      { title: "" },
      { start: undefined },
      { end: null },
      { summary: " " },
      { primary: "true" },
      { employer: { name: "Employer", url: "not-a-url" } },
      { employer: { name: "Employer", url: "javascript:alert(1)" } },
    ].map((fields) => ({ roles: [role("role", fields)] })),
  ];
  for (const input of invalid) {
    assert.throws(() => parseCareer(input), TypeError, JSON.stringify(input));
  }
});

test("periods cannot end before their earliest start", () => {
  for (const [start, end] of [
    ["2026", "2025"],
    ["2026-03", "2026-02"],
    ["2026-02-02", "2026-02-01"],
  ]) {
    assert.throws(() => parseCareer({ roles: [role("role", { start, end })] }), /ends before/);
  }
});

test("IDs are unique and only one explicit primary is allowed, even without overlap", () => {
  assert.throws(() => parseCareer({ roles: [role("same"), role("same")] }), /duplicate role ID/);
  assert.throws(
    () =>
      parseCareer({
        roles: [
          role("past", { start: "2024", end: "2025", primary: true }),
          role("future", { start: "2027", primary: true }),
        ],
      }),
    /only one primary/,
  );
});
