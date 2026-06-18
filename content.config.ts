import { defineCollection, defineContentConfig, z } from "@nuxt/content";

export default defineContentConfig({
  collections: {
    posts: defineCollection({
      type: "page",
      source: "posts/**/*.md",
      schema: z.object({
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
      }),
    }),

    pages: defineCollection({
      type: "page",
      source: {
        include: "pages/**/*.md",
        prefix: "/",
      },
      schema: z.object({
        title: z.string(),
        description: z.string().optional(),
        ogImage: z.string().optional(),
        publishDate: z.string().date(),
        updatedDate: z.string().date().optional(),
      }),
    }),

    notes: defineCollection({
      type: "page",
      source: "notes/**/*.md",
      schema: z.object({
        title: z.string(),
        draft: z.boolean().default(true),
        description: z.string().optional(),
        publishDate: z.coerce.date(),
      }),
    }),

    projects: defineCollection({
      type: "page",
      source: "projects/**/*.md",
      schema: z.object({
        title: z.string().max(60),
        description: z.string(),
        techStack: z.array(z.string()).default([]),
        link: z.string().optional(),
        order: z.number().default(0),
        draft: z.boolean().default(true),
        coverImage: z
          .object({
            src: z.string(),
            alt: z.string(),
          })
          .optional(),
      }),
    }),
  },
});
