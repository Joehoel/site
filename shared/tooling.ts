import { z } from "zod";
import { asOfSchema, dateBounds, partialDateSchema, type AsOf } from "./partial-date.ts";

const nonblank = z.string().regex(/\S/, "Must not be blank");
const periodSchema = z
  .object({
    start: partialDateSchema.nullable(),
    end: z.discriminatedUnion("kind", [
      z.object({ kind: z.literal("unknown") }),
      z.object({ kind: z.literal("ongoing"), verifiedOn: asOfSchema }),
      z.object({ kind: z.literal("ended"), date: partialDateSchema.nullable() }),
    ]),
    context: nonblank.optional(),
  })
  .superRefine((period, ctx) => {
    if (period.start === null) return;
    const first = dateBounds(period.start).first;
    if (
      period.end.kind === "ended" &&
      period.end.date !== null &&
      first > dateBounds(period.end.date).last
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["end", "date"],
        message: "Period ends before it starts",
      });
    }
    if (period.end.kind === "ongoing" && first > dateBounds(period.end.verifiedOn).first) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["end", "verifiedOn"],
        message: "Confirmation precedes the start",
      });
    }
  });

export const toolingSchema = z.object({
  tools: z
    .array(
      z.object({
        id: z
          .string()
          .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*(?![\s\S])/, "Expected a lowercase ASCII slug"),
        name: nonblank,
        category: nonblank,
        url: z
          .string()
          .url()
          .refine((url) => /^https?:/i.test(url.trim()), "Expected an HTTP or HTTPS URL")
          .optional(),
        description: nonblank,
        periods: z.array(periodSchema).min(1),
      }),
    )
    .superRefine((tools, ctx) => {
      const ids = new Set<string>();
      tools.forEach((tool, index) => {
        if (ids.has(tool.id)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [index, "id"],
            message: `Duplicate tool ID ${tool.id}`,
          });
        }
        ids.add(tool.id);
      });
    }),
});

export type Tooling = z.infer<typeof toolingSchema>;
export type Tool = Tooling["tools"][number];
export type ToolPeriod = Tool["periods"][number];
export type PeriodView = {
  readonly tool: Tool;
  readonly period: ToolPeriod;
  readonly index: number;
  readonly state: "current" | "historical" | "future" | "unconfirmed";
};
export type ToolingView = {
  readonly current: readonly Tool[];
  readonly unconfirmed: readonly Tool[];
  readonly timeline: readonly PeriodView[];
};

function periodState(period: ToolPeriod, day: number): PeriodView["state"] {
  const start = period.start === null ? null : dateBounds(period.start);
  const future = start !== null && day < start.first;
  if (period.end.kind === "unknown") return future ? "future" : "unconfirmed";
  if (period.end.kind === "ongoing") {
    if (future) return "future";
    return day >= dateBounds(period.end.verifiedOn).first ? "current" : "unconfirmed";
  }
  if (period.end.date === null) return "historical";
  if (future) return "future";
  const end = dateBounds(period.end.date);
  if (day > end.last) return "historical";
  return start !== null && start.last <= day && day <= end.first ? "current" : "unconfirmed";
}

function orderDate(period: ToolPeriod): string | null {
  return period.start ?? (period.end.kind === "ended" ? period.end.date : null);
}

export function deriveTooling(document: Tooling, asOf: AsOf): ToolingView {
  const day = dateBounds(asOf).first;
  const timeline = document.tools
    .flatMap((tool) =>
      tool.periods.map(
        (period, index): PeriodView => ({
          tool,
          period,
          index,
          state: periodState(period, day),
        }),
      ),
    )
    .sort((a, b) => {
      const aDate = orderDate(a.period);
      const bDate = orderDate(b.period);
      if (aDate === null && bDate !== null) return 1;
      if (bDate === null && aDate !== null) return -1;
      const dateOrder =
        aDate !== null && bDate !== null
          ? dateBounds(bDate).first - dateBounds(aDate).first || bDate.length - aDate.length
          : 0;
      return (
        dateOrder || (a.tool.id < b.tool.id ? -1 : a.tool.id > b.tool.id ? 1 : a.index - b.index)
      );
    });
  const currentIds = new Set(
    timeline.filter((entry) => entry.state === "current").map((entry) => entry.tool.id),
  );
  const unconfirmedIds = new Set(
    timeline.filter((entry) => entry.state === "unconfirmed").map((entry) => entry.tool.id),
  );
  const tools = [...document.tools].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  return {
    current: tools.filter((tool) => currentIds.has(tool.id)),
    unconfirmed: tools.filter((tool) => unconfirmedIds.has(tool.id) && !currentIds.has(tool.id)),
    timeline,
  };
}
