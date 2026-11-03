import { selectCurrent, type AsOf, type Role } from "./career.ts";

export function formatWorkDate(value: Role["start"]): string {
  if (value.length === 4) return value;
  const date = value.length === 7 ? `${value}-01` : value;
  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "short",
    day: value.length === 10 ? "numeric" : undefined,
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

export function formatWorkPeriod(role: Role, asOf: AsOf): string {
  const start = formatWorkDate(role.start);
  if (role.end !== undefined) return `${start} to ${formatWorkDate(role.end)}`;
  return selectCurrent({ roles: [role] }, asOf).kind === "selected"
    ? `${start} to present`
    : `From ${start}`;
}
