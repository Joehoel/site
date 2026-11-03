import { defineCollection, defineContentConfig, z } from "@nuxt/content";
import { contentSource } from "./lib/content-source.ts";
import { careerSchema } from "./shared/career.ts";
import { homeSchema } from "./shared/home.ts";

const audience = process.env.NODE_ENV === "development" ? "authoring" : "public";

export default defineContentConfig({
  collections: {
    home: defineCollection({
      type: "page",
      source: "index.md",
      schema: homeSchema,
    }),

    career: defineCollection({
      type: "data",
      source: "career.yml",
      schema: careerSchema,
    }),

    posts: defineCollection({
      type: "page",
      source: contentSource(
        {
          include: "posts/**/*.md",
          prefix: "/log",
        },
        audience,
      ),
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
      source: contentSource({ include: "notes/**/*.md" }, audience),
      schema: z.object({
        title: z.string(),
        draft: z.boolean().default(true),
        description: z.string().optional(),
        publishDate: z.coerce.date(),
      }),
    }),

    projects: defineCollection({
      type: "page",
      source: contentSource({ include: "projects/**/*.md" }, audience),
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
