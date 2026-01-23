import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

// Minimal passthrough schema - Keystatic is the source of truth for field definitions
const post = defineCollection({
	loader: glob({ base: "./content/post", pattern: "**/*.mdoc" }),
	schema: z
		.object({
			title: z.string(),
			draft: z.boolean().default(false),
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
		})
		.passthrough(),
});

const page = defineCollection({
	loader: glob({ base: "./content/page", pattern: "**/*.mdoc" }),
	schema: z
		.object({
			title: z.string(),
			ogImage: z.string().optional(),
			publishDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
		})
		.passthrough(),
});

const note = defineCollection({
	loader: glob({ base: "./content/note", pattern: "**/*.mdoc" }),
	schema: z
		.object({
			title: z.string(),
			description: z.string().optional(),
			publishDate: z.coerce.date(),
		})
		.passthrough(),
});

export const collections = { post, page, note };
