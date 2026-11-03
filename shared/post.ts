import { z } from "zod";

export const postSchema = z.object({
  title: z.string().max(60),
  draft: z.boolean().default(true),
  description: z.string().optional(),
  tags: z.array(z.string()).default([]),
  coverImage: z
    .object({
      src: z.string(),
      alt: z.string(),
    })
    .optional(),
  ogImage: z.string().optional(),
  publishDate: z.string().date(),
  updatedDate: z.string().date().optional(),
});
