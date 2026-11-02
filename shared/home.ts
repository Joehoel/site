import { z } from "zod";
import type { CurrentSelection } from "./career.ts";

export const homeSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  rolePrefix: z.string().min(1),
  employerPrefix: z.string().min(1),
});

export type HomeIntro = z.infer<typeof homeSchema>;

export function currentRoleSentence(
  selection: CurrentSelection,
  copy: Pick<HomeIntro, "rolePrefix" | "employerPrefix">,
): string {
  switch (selection.kind) {
    case "none":
      return "I don't have a current role listed.";
    case "ambiguous":
      return "More than one current role is listed.";
    case "selected":
      return `${copy.rolePrefix} ${selection.role.title.toLowerCase()} ${copy.employerPrefix} ${selection.role.employer.name}.`;
  }
}
