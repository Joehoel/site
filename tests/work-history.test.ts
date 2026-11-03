import assert from "node:assert/strict";
import { test } from "node:test";
import { orderRoles, selectCurrent, type Role } from "../shared/career.ts";
import { formatWorkDate, formatWorkPeriod } from "../shared/work-history.ts";

function role(fields: Partial<Role> = {}): Role {
  return {
    id: "developer",
    employer: { name: "Example employer" },
    title: "Developer",
    start: "2026-02",
    ...fields,
  };
}

for (const [value, expected] of [
  ["2026", "2026"],
  ["2026-02", "Feb 2026"],
  ["2026-02-02", "2 Feb 2026"],
  ["2024-02-29", "29 Feb 2024"],
  ["2000-02-29", "29 Feb 2000"],
  ["0001", "0001"],
  ["0001-01", "Jan 1"],
  ["0099-12-31", "31 Dec 99"],
  ["9999", "9999"],
  ["9999-12", "Dec 9999"],
  ["9999-12-31", "31 Dec 9999"],
] satisfies [string, string][]) {
  test(`work date ${value} keeps its supplied precision`, () => {
    assert.equal(formatWorkDate(value), expected);
  });
}

test("explicit end dates keep both boundaries at their supplied precision", () => {
  for (const [start, end, expected] of [
    ["2024", "2025", "2024 to 2025"],
    ["2024-02", "2025-03", "Feb 2024 to Mar 2025"],
    ["2024-02-29", "2025-03-02", "29 Feb 2024 to 2 Mar 2025"],
    ["2024", "2025-03", "2024 to Mar 2025"],
    ["2027-02", "2028", "Feb 2027 to 2028"],
  ] satisfies [string, string, string][]) {
    const entry = role({ start, end });
    for (const asOf of ["2023-01-01", "2024-03-01", "2026-11-02", "2029-01-01"]) {
      assert.equal(formatWorkPeriod(entry, asOf), expected);
    }
  }
});

test("open roles say present only when their supplied start period has begun", () => {
  for (const [start, before, first, expected] of [
    ["2026", "2025-12-31", "2026-01-01", "2026"],
    ["2026-02", "2026-01-31", "2026-02-01", "Feb 2026"],
    ["2024-02-29", "2024-02-28", "2024-02-29", "29 Feb 2024"],
  ] satisfies [string, string, string, string][]) {
    const entry = role({ start });
    assert.equal(formatWorkPeriod(entry, before), `From ${expected}`);
    assert.equal(formatWorkPeriod(entry, first), `${expected} to present`);
    assert.equal(formatWorkPeriod(entry, "2026-11-02"), `${expected} to present`);
  }
});

test("overlapping open roles each say present regardless of a primary role", () => {
  const roles = [
    role({ id: "older", start: "2025", primary: true }),
    role({ id: "newer", start: "2026-02", primary: false }),
  ];
  const asOf = "2026-11-02";
  assert.equal(selectCurrent({ roles }, asOf).kind, "selected");
  assert.deepEqual(
    roles.map((entry) => formatWorkPeriod(entry, asOf)),
    ["2025 to present", "Feb 2026 to present"],
  );
  const withoutPrimary = roles.map((entry) => ({ ...entry, primary: false }));
  assert.equal(selectCurrent({ roles: withoutPrimary }, asOf).kind, "ambiguous");
  assert.deepEqual(
    withoutPrimary.map((entry) => formatWorkPeriod(entry, asOf)),
    ["2025 to present", "Feb 2026 to present"],
  );
  assert.equal(formatWorkPeriod(role({ primary: true, start: "2027" }), asOf), "From 2027");
});

test("work periods follow canonical ordering without changing authored roles or precision", () => {
  const career = {
    roles: [
      role({ id: "older", start: "2024", end: "2025-02" }),
      role({ id: "z-same-day", start: "2026-02-01" }),
      role({ id: "a-same-day", start: "2026-02" }),
      role({ id: "future", start: "2027" }),
    ],
  };
  const original = structuredClone(career);
  assert.deepEqual(
    orderRoles(career).map((entry) => [entry.id, formatWorkPeriod(entry, "2026-11-02")]),
    [
      ["future", "From 2027"],
      ["a-same-day", "Feb 2026 to present"],
      ["z-same-day", "1 Feb 2026 to present"],
      ["older", "2024 to Feb 2025"],
    ],
  );
  assert.deepEqual(career, original);
});
