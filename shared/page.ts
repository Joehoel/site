import { z } from "zod";

export const pageSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  ogImage: z.string().optional(),
  publishDate: z.string().date(),
  updatedDate: z.string().date().optional(),
});
