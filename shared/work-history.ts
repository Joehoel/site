import { selectCurrent, type AsOf, type Role } from "./career.ts";
import { formatPartialDate } from "./partial-date.ts";

export { formatPartialDate as formatWorkDate } from "./partial-date.ts";

export function formatWorkPeriod(role: Role, asOf: AsOf): string {
  const start = formatPartialDate(role.start);
  if (role.end !== undefined) return `${start} to ${formatPartialDate(role.end)}`;
  return selectCurrent({ roles: [role] }, asOf).kind === "selected"
    ? `${start} to present`
    : `From ${start}`;
}
