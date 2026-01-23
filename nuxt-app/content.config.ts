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
				publishDate: z.coerce.date(),
				updatedDate: z.coerce.date().optional(),
			}),
		}),

		pages: defineCollection({
			type: "page",
			source: "pages/**/*.md",
			schema: z.object({
				title: z.string(),
				ogImage: z.string().optional(),
				publishDate: z.coerce.date(),
				updatedDate: z.coerce.date().optional(),
			}),
		}),

		notes: defineCollection({
			type: "page",
			source: "notes/**/*.md",
			schema: z.object({
				title: z.string(),
				description: z.string().optional(),
				publishDate: z.coerce.date(),
			}),
		}),
	},
});
