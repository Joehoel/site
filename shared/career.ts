import { z } from "zod";

export const asOfSchema = z
  .string()
  .date()
  .regex(/^(?!0000)\d{4}-\d{2}-\d{2}(?![\s\S])/, "Expected a full calendar day in years 0001-9999");

const dateSchema = z.union([
  z.string().regex(/^(?!0000)\d{4}(?:-(?:0[1-9]|1[0-2]))?(?![\s\S])/, "Expected YYYY or YYYY-MM"),
  asOfSchema,
]);
const nonemptyString = z.string().regex(/\S/, "Must not be blank");
const roleSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*(?![\s\S])/, "Expected a lowercase ASCII slug"),
    employer: z.object({
      name: nonemptyString,
      url: z
        .string()
        .url()
        .refine((url) => /^https?:/i.test(url.trim()), "Expected an HTTP or HTTPS URL")
        .optional(),
    }),
    title: nonemptyString,
    start: dateSchema,
    end: dateSchema.optional(),
    summary: nonemptyString.optional(),
    primary: z.boolean().optional(),
  })
  .refine((role) => role.end === undefined || bounds(role.start).first <= bounds(role.end).last, {
    path: ["end"],
    message: "Period ends before it starts",
  });

export const careerSchema = z.object({
  roles: z.array(roleSchema).superRefine((roles, ctx) => {
    const ids = new Set<string>();
    let hasPrimary = false;
    roles.forEach((role, index) => {
      if (ids.has(role.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [index, "id"],
          message: `Duplicate role ID ${role.id}`,
        });
      }
      ids.add(role.id);
      if (role.primary) {
        if (hasPrimary) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [index, "primary"],
            message: "Only one primary role is allowed",
          });
        }
        hasPrimary = true;
      }
    });
  }),
});

export type Career = z.infer<typeof careerSchema>;
export type Role = z.infer<typeof roleSchema>;
export type AsOf = z.infer<typeof asOfSchema>;
export type CurrentSelection =
  | { readonly kind: "none" }
  | { readonly kind: "selected"; readonly role: Role }
  | { readonly kind: "ambiguous"; readonly roles: readonly Role[] };

function daysInMonth(year: number, month: number): number {
  if (month === 2) {
    return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 29 : 28;
  }
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

function bounds(date: string): { first: number; last: number } {
  const [year = 0, month = 1, day = 1] = date.split("-").map(Number);
  const lastMonth = date.length === 4 ? 12 : month;
  const lastDay = date.length === 10 ? day : daysInMonth(year, lastMonth);
  return {
    first: year * 10000 + month * 100 + day,
    last: year * 10000 + lastMonth * 100 + lastDay,
  };
}

export function orderRoles(career: Career): readonly Role[] {
  return [...career.roles].sort((a, b) => {
    const startOrder = bounds(b.start).first - bounds(a.start).first;
    return startOrder || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
  });
}

export function selectCurrent(career: Career, asOf: AsOf): CurrentSelection {
  const day = bounds(asOf).first;
  const active = orderRoles(career).filter(
    (role) =>
      bounds(role.start).first <= day && (role.end === undefined || day <= bounds(role.end).last),
  );
  if (active.length === 0) return { kind: "none" };
  const selected = active.length === 1 ? active[0] : active.find((role) => role.primary);
  return selected ? { kind: "selected", role: selected } : { kind: "ambiguous", roles: active };
}
