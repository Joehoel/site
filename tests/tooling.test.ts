import assert from "node:assert/strict";
import { test } from "node:test";
import { dateBounds, formatPartialDate } from "../shared/partial-date.ts";
import {
  deriveTooling,
  toolingSchema,
  type Tool,
  type Tooling,
  type ToolPeriod,
} from "../shared/tooling.ts";

function tool(id: string, periods: ToolPeriod[]): Tool {
  return { id, name: id, category: "Development", description: "Authored **Markdown**.", periods };
}

function state(period: ToolPeriod, asOf: string) {
  return deriveTooling({ tools: [tool("example", [period])] }, asOf).timeline[0]?.state;
}

test("empty tooling has no current, unconfirmed or history entries", () => {
  assert.deepEqual(deriveTooling({ tools: [] }, "2026-11-03"), {
    current: [],
    unconfirmed: [],
    timeline: [],
  });
});

test("stopping and restarting a tool preserves each period and does not duplicate current tools", () => {
  const document = toolingSchema.parse({
    tools: [
      tool("editor", [
        { start: "2024-01-01", end: { kind: "ended", date: "2024-06-30" } },
        { start: "2025-01-01", end: { kind: "ongoing", verifiedOn: "2025-01-02" } },
        { start: null, end: { kind: "unknown" } },
      ]),
    ],
  });
  assert.equal(deriveTooling(document, "2024-06-30").current.length, 1);
  assert.equal(deriveTooling(document, "2024-07-01").current.length, 0);
  const view = deriveTooling(document, "2026-11-03");
  assert.deepEqual(
    view.current.map((entry) => entry.id),
    ["editor"],
  );
  assert.deepEqual(view.unconfirmed, []);
  assert.deepEqual(
    view.timeline.map((entry) => [entry.index, entry.state]),
    [
      [1, "current"],
      [0, "historical"],
      [2, "unconfirmed"],
    ],
  );
});

test("parallel tools and overlapping periods are allowed without an exclusive primary", () => {
  const period: ToolPeriod = { start: "2025", end: { kind: "ongoing", verifiedOn: "2025-06-03" } };
  const document = toolingSchema.parse({
    tools: [tool("terminal", [period]), tool("editor", [period, period])],
  });
  const view = deriveTooling(document, "2026-11-03");
  assert.deepEqual(
    view.current.map((entry) => entry.id),
    ["editor", "terminal"],
  );
  assert.equal(view.timeline.length, 3);
});

for (const [period, day, expected] of [
  [{ start: null, end: { kind: "unknown" } }, "2026-11-03", "unconfirmed"],
  [{ start: "2024", end: { kind: "unknown" } }, "9999-12-31", "unconfirmed"],
  [{ start: "2027", end: { kind: "unknown" } }, "2026-12-31", "future"],
  [{ start: "2027", end: { kind: "unknown" } }, "2027-01-01", "unconfirmed"],
  [{ start: null, end: { kind: "ended", date: null } }, "2026-11-03", "historical"],
  [{ start: "2027", end: { kind: "ended", date: null } }, "2026-11-03", "historical"],
  [{ start: null, end: { kind: "ended", date: "2026" } }, "2026-06-01", "unconfirmed"],
  [{ start: null, end: { kind: "ended", date: "2026" } }, "2027-01-01", "historical"],
  [
    { start: null, end: { kind: "ongoing", verifiedOn: "2026-11-03" } },
    "2026-11-02",
    "unconfirmed",
  ],
  [{ start: null, end: { kind: "ongoing", verifiedOn: "2026-11-03" } }, "2026-11-03", "current"],
  [{ start: null, end: { kind: "ongoing", verifiedOn: "2026-11-03" } }, "9999-12-31", "current"],
  [
    { start: "2027-02", end: { kind: "ongoing", verifiedOn: "2027-02-15" } },
    "2027-01-31",
    "future",
  ],
  [
    { start: "2027-02", end: { kind: "ongoing", verifiedOn: "2027-02-15" } },
    "2027-02-01",
    "unconfirmed",
  ],
  [
    { start: "2027-02", end: { kind: "ongoing", verifiedOn: "2027-02-15" } },
    "2027-02-15",
    "current",
  ],
] satisfies [ToolPeriod, string, string][]) {
  test(`${JSON.stringify(period)} is ${expected} on ${day}`, () => {
    assert.equal(
      state(toolingSchema.parse({ tools: [tool("example", [period])] }).tools[0]!.periods[0]!, day),
      expected,
    );
  });
}

for (const [start, end, checks] of [
  [
    "2024",
    "2025",
    [
      ["2023-12-31", "future"],
      ["2024-01-01", "unconfirmed"],
      ["2024-12-30", "unconfirmed"],
      ["2024-12-31", "current"],
      ["2025-01-01", "current"],
      ["2025-01-02", "unconfirmed"],
      ["2025-12-31", "unconfirmed"],
      ["2026-01-01", "historical"],
    ],
  ],
  [
    "2024-02",
    "2024-03",
    [
      ["2024-01-31", "future"],
      ["2024-02-01", "unconfirmed"],
      ["2024-02-28", "unconfirmed"],
      ["2024-02-29", "current"],
      ["2024-03-01", "current"],
      ["2024-03-02", "unconfirmed"],
      ["2024-03-31", "unconfirmed"],
      ["2024-04-01", "historical"],
    ],
  ],
  [
    "2025-06-03",
    "2025-06-03",
    [
      ["2025-06-02", "future"],
      ["2025-06-03", "current"],
      ["2025-06-04", "historical"],
    ],
  ],
  [
    "2024-02",
    "2024-02",
    [
      ["2024-02-01", "unconfirmed"],
      ["2024-02-29", "unconfirmed"],
      ["2024-03-01", "historical"],
    ],
  ],
] satisfies [string, string, [string, string][]][]) {
  for (const [day, expected] of checks) {
    test(`dated interval ${start} through ${end} is ${expected} on ${day}`, () => {
      assert.equal(state({ start, end: { kind: "ended", date: end } }, day), expected);
    });
  }
}

test("history sorts known starts or fallback ends, then precision, ASCII ID and period index", () => {
  const document: Tooling = {
    tools: [
      tool("z-same", [{ start: "2026-01-01", end: { kind: "unknown" } }]),
      tool("a-month", [{ start: "2026-01", end: { kind: "unknown" } }]),
      tool("a-year", [{ start: "2026", end: { kind: "unknown" } }]),
      tool("a-same", [
        { start: "2026-01-01", end: { kind: "unknown" } },
        { start: "2026-01-01", end: { kind: "unknown" } },
      ]),
      tool("fallback", [{ start: null, end: { kind: "ended", date: "2027" } }]),
      tool("unknown", [{ start: null, end: { kind: "ended", date: null } }]),
      tool("start-not-end", [{ start: "2025", end: { kind: "ended", date: "2028" } }]),
    ],
  };
  const expected = [
    "fallback:0",
    "a-same:0",
    "a-same:1",
    "z-same:0",
    "a-month:0",
    "a-year:0",
    "start-not-end:0",
    "unknown:0",
  ];
  for (let offset = 0; offset < document.tools.length; offset++) {
    const rotated = {
      tools: [...document.tools.slice(offset), ...document.tools.slice(0, offset)],
    };
    assert.deepEqual(
      deriveTooling(rotated, "2026-11-03").timeline.map(
        (entry) => `${entry.tool.id}:${entry.index}`,
      ),
      expected,
    );
  }
});

test("derivation is immutable and independent of wall clock time", () => {
  const document = {
    tools: [tool("example", [{ start: null, end: { kind: "ongoing", verifiedOn: "2026-11-03" } }])],
  };
  const original = structuredClone(document);
  function freeze(value: object) {
    Object.values(value).forEach((child) => {
      if (child && typeof child === "object") freeze(child);
    });
    Object.freeze(value);
  }
  freeze(document);
  assert.deepEqual(deriveTooling(document, "2026-11-03"), deriveTooling(document, "2026-11-03"));
  assert.deepEqual(document, original);
});

for (const date of [
  "2026-02-29",
  "1900-02-29",
  "2100-02-29",
  "2024-04-31",
  "0000",
  "0000-01-01",
  "10000",
  "2026-13",
  "2026-1",
  "2026-01-01T00:00:00Z",
  "2026\n",
]) {
  test(`tooling rejects invalid partial date ${JSON.stringify(date)} at either boundary`, () => {
    for (const period of [
      { start: date, end: { kind: "unknown" } },
      { start: null, end: { kind: "ended", date } },
    ])
      assert.equal(
        toolingSchema.safeParse({ tools: [tool("example", [period as ToolPeriod])] }).success,
        false,
      );
  });
}

test("date bounds and display preserve year, month and leap-day precision", () => {
  for (const [date, first, last, label] of [
    ["2024", 20240101, 20241231, "2024"],
    ["2024-02", 20240201, 20240229, "Feb 2024"],
    ["1900-02", 19000201, 19000228, "Feb 1900"],
    ["2000-02", 20000201, 20000229, "Feb 2000"],
    ["2024-02-29", 20240229, 20240229, "29 Feb 2024"],
    ["0001", 10101, 11231, "0001"],
    ["9999", 99990101, 99991231, "9999"],
  ] satisfies [string, number, number, string][]) {
    assert.deepEqual(dateBounds(date), { first, last });
    assert.equal(formatPartialDate(date), label);
  }
});

test("reversed intervals and confirmations before the earliest start have field-addressed errors", () => {
  for (const [period, path] of [
    [{ start: "2026-03", end: { kind: "ended", date: "2026-02" } }, "date"],
    [{ start: "2026-03", end: { kind: "ongoing", verifiedOn: "2026-02-28" } }, "verifiedOn"],
  ] satisfies [ToolPeriod, string][]) {
    const result = toolingSchema.safeParse({ tools: [tool("example", [period])] });
    assert.equal(result.success, false);
    if (!result.success)
      assert.deepEqual(result.error.issues[0]?.path, ["tools", 0, "periods", 0, "end", path]);
  }
  assert.ok(
    toolingSchema.safeParse({
      tools: [
        tool("example", [{ start: "2026", end: { kind: "ongoing", verifiedOn: "2026-01-01" } }]),
      ],
    }).success,
  );
});

test("duplicate tool IDs are rejected even when periods do not overlap", () => {
  const result = toolingSchema.safeParse({
    tools: [
      tool("same", [{ start: "2024", end: { kind: "ended", date: "2025" } }]),
      tool("same", [{ start: "2026", end: { kind: "unknown" } }]),
    ],
  });
  assert.equal(result.success, false);
  if (!result.success) assert.deepEqual(result.error.issues[0]?.path, ["tools", 1, "id"]);
});

test("missing endpoints, required fields, invalid URLs and blank copy are rejected", () => {
  const valid = tool("example", [{ start: null, end: { kind: "unknown" } }]);
  for (const candidate of [
    {},
    { tools: null },
    { tools: [null] },
    { tools: [{ ...valid, periods: [] }] },
    { tools: [{ ...valid, periods: [{ start: null }] }] },
    { tools: [{ ...valid, periods: [{ end: { kind: "unknown" } }] }] },
    { tools: [{ ...valid, periods: [{ start: null, end: { kind: "ended" } }] }] },
    { tools: [{ ...valid, periods: [{ start: null, end: { kind: "ongoing" } }] }] },
    {
      tools: [
        { ...valid, periods: [{ start: null, end: { kind: "ongoing", verifiedOn: "2026-11" } }] },
      ],
    },
    {
      tools: [
        {
          ...valid,
          periods: [{ start: null, end: { kind: "ongoing", verifiedOn: "2026-02-29" } }],
        },
      ],
    },
    { tools: [{ ...valid, periods: [{ start: null, end: { kind: "present" } }] }] },
    ...["id", "name", "category", "description"].map((key) => ({
      tools: [{ ...valid, [key]: " " }],
    })),
    ...["Example", "example\n", "with space"].map((id) => ({ tools: [{ ...valid, id }] })),
    ...["ftp://example.com", "javascript:alert(1)", "relative/path"].map((url) => ({
      tools: [{ ...valid, url }],
    })),
  ])
    assert.equal(toolingSchema.safeParse(candidate).success, false, JSON.stringify(candidate));
});
