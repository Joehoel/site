import { z } from "zod";

export const asOfSchema = z
  .string()
  .date()
  .regex(/^(?!0000)\d{4}-\d{2}-\d{2}(?![\s\S])/, "Expected a full calendar day in years 0001-9999");

export const partialDateSchema = z.union([
  z.string().regex(/^(?!0000)\d{4}(?:-(?:0[1-9]|1[0-2]))?(?![\s\S])/, "Expected YYYY or YYYY-MM"),
  asOfSchema,
]);

export type AsOf = z.infer<typeof asOfSchema>;
export type PartialDate = z.infer<typeof partialDateSchema>;

function daysInMonth(year: number, month: number): number {
  if (month === 2) {
    return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 29 : 28;
  }
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

export function dateBounds(date: PartialDate): { first: number; last: number } {
  const [year = 0, month = 1, day = 1] = date.split("-").map(Number);
  const lastMonth = date.length === 4 ? 12 : month;
  const lastDay = date.length === 10 ? day : daysInMonth(year, lastMonth);
  return {
    first: year * 10000 + month * 100 + day,
    last: year * 10000 + lastMonth * 100 + lastDay,
  };
}

export function formatPartialDate(value: PartialDate): string {
  if (value.length === 4) return value;
  const date = value.length === 7 ? `${value}-01` : value;
  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "short",
    day: value.length === 10 ? "numeric" : undefined,
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}
