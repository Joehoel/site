import { z } from "zod";
import {
  dateBounds as bounds,
  partialDateSchema as dateSchema,
  type AsOf,
} from "./partial-date.ts";

export { asOfSchema, type AsOf } from "./partial-date.ts";
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
export type CurrentSelection =
  | { readonly kind: "none" }
  | { readonly kind: "selected"; readonly role: Role }
  | { readonly kind: "ambiguous"; readonly roles: readonly Role[] };

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
