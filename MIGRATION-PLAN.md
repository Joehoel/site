# Migration Plan: Astro to Nuxt 4 + Nuxt Studio

## Overview

Migrate the current Astro + Keystatic site to Nuxt 4 with Nuxt Studio for content management.

### Why Migrate?

| Problem with Current Setup                 | How Nuxt Solves It                                                |
| ------------------------------------------ | ----------------------------------------------------------------- |
| Dual schemas (Keystatic + Astro)           | **Single schema** - Nuxt Content schema IS Studio's schema        |
| Can't use native render pipeline           | **Native rendering** - Shiki built-in, remark/rehype plugins work |
| Keystatic requires custom Markdoc renderer | **MDC is native** - Vue components work out of the box            |

**Nuxt Studio is FREE** (MIT licensed, self-hosted) - no vendor lock-in.

### Decisions

- **Guestbook**: Remove (not used)
- **Analytics**: Vercel Analytics only (remove custom analytics.longux.xyz)
- **Webmentions**: Remove
- **Repository**: Migrate in place
- **Approach**: Incremental

---

## Phase 1: Project Setup

### 1.1 Install Nuxt alongside Astro

Since we're migrating incrementally in the same repo, we'll set up Nuxt in a subdirectory first, then swap when ready.

```bash
# Create nuxt app in subdirectory
npx nuxi@latest init nuxt-app
cd nuxt-app

# Install required modules
npx nuxi module add content
npx nuxi module add tailwindcss
npx nuxi module add image
npx nuxi module add sitemap
npx nuxi module add icon
npx nuxi module add color-mode
npx nuxi module add og-image

# Install Studio
npm install @nuxt/studio

# Install additional dependencies
npm install feed  # For RSS
npm install @vercel/analytics
```

### 1.2 Configure nuxt.config.ts

```ts
export default defineNuxtConfig({
	modules: [
		"@nuxt/content",
		"@nuxtjs/tailwindcss",
		"@nuxt/image",
		"@nuxtjs/sitemap",
		"@nuxt/icon",
		"@nuxtjs/color-mode",
		"@nuxt/og-image",
		"@nuxt/studio",
	],

	content: {
		highlight: {
			theme: {
				default: "github-light",
				dark: "plastic",
			},
			langs: [
				"ts",
				"tsx",
				"vue",
				"bash",
				"toml",
				"yaml",
				"json",
				"python",
				"css",
				"html",
			],
		},
	},

	colorMode: {
		classSuffix: "",
		dataValue: "theme",
		preference: "system",
	},

	studio: {
		route: "/admin",
		repository: {
			provider: "github",
			owner: "joehoel",
			repo: "site",
			branch: "main",
		},
	},

	site: {
		url: "https://joelkuijper.me",
	},

	routeRules: {
		"/admin/**": { ssr: true },
		"/**": { prerender: true },
	},
});
```

### 1.3 Tasks

- [ ] Create `nuxt-app/` subdirectory with Nuxt 4
- [ ] Install all required modules
- [ ] Configure `nuxt.config.ts`
- [ ] Verify dev server starts

---

## Phase 2: Content Schema & Migration

### 2.1 Define Content Schema

Create `content.config.ts`:

```ts
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
```

### 2.2 Content File Migration

Convert `.mdoc` files to `.md` with MDC syntax:

| Source                | Destination                   |
| --------------------- | ----------------------------- |
| `content/post/*.mdoc` | `nuxt-app/content/posts/*.md` |
| `content/page/*.mdoc` | `nuxt-app/content/pages/*.md` |
| `content/note/*.mdoc` | `nuxt-app/content/notes/*.md` |

**Syntax conversion:**

```md
<!-- Markdoc -->

{% Timestamp date="2024-01-15" /%}

<!-- MDC -->

::timestamp{date="2024-01-15"}
::
```

### 2.3 App Config for Navigation/Socials

Create `app.config.ts`:

```ts
export default defineAppConfig({
	navigation: [
		{ label: "Posts", url: "/posts" },
		{ label: "Notes", url: "/notes" },
		{ label: "Tags", url: "/tags" },
		{ label: "Uses", url: "/uses" },
	],
	socials: [
		{ label: "GitHub", url: "https://github.com/joehoel", icon: "mdi:github" },
		{
			label: "LinkedIn",
			url: "https://linkedin.com/in/joelkuijper",
			icon: "mdi:linkedin",
		},
		{ label: "X", url: "https://x.com/joaborr", icon: "mdi:twitter" },
	],
	site: {
		title: "Joël",
		author: "Joël Kuijper",
		description: "Personal website of Joël Kuijper",
		lang: "nl-NL",
		ogLocale: "nl_NL",
	},
});
```

### 2.4 Tasks

- [ ] Create `content.config.ts` with schemas
- [ ] Write migration script for content files
- [ ] Convert posts (1 file)
- [ ] Convert notes (4 files)
- [ ] Convert pages (1 file - uses)
- [ ] Create `app.config.ts` with navigation/socials
- [ ] Verify content loads in Nuxt

---

## Phase 3: Layouts & Core Components

### 3.1 Directory Structure

```
nuxt-app/
├── app/
│   ├── layouts/
│   │   ├── default.vue
│   │   └── post.vue
│   ├── pages/
│   │   ├── index.vue
│   │   ├── about.vue
│   │   ├── posts/
│   │   │   ├── index.vue
│   │   │   └── [...slug].vue
│   │   ├── notes/
│   │   │   ├── index.vue
│   │   │   └── [...slug].vue
│   │   ├── tags/
│   │   │   ├── index.vue
│   │   │   └── [tag].vue
│   │   └── [...slug].vue
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.vue
│   │   │   └── Footer.vue
│   │   ├── blog/
│   │   │   ├── Masthead.vue
│   │   │   └── PostPreview.vue
│   │   ├── note/
│   │   │   └── NoteCard.vue
│   │   ├── content/
│   │   │   └── Timestamp.vue
│   │   ├── ThemeToggle.vue
│   │   ├── Search.vue
│   │   ├── Paginator.vue
│   │   ├── FormattedDate.vue
│   │   └── SocialList.vue
│   └── composables/
│       └── useFormattedDate.ts
├── content/
│   ├── posts/
│   ├── notes/
│   └── pages/
├── public/
│   └── images/
└── server/
    └── routes/
        ├── rss.xml.ts
        └── notes/rss.xml.ts
```

### 3.2 Layout Components

**default.vue:**

```vue
<template>
	<div class="mx-auto flex min-h-screen max-w-3xl flex-col px-4 pt-16 sm:px-8">
		<LayoutHeader />
		<main class="flex-1">
			<slot />
		</main>
		<LayoutFooter />
	</div>
</template>
```

**post.vue:**

```vue
<template>
	<div class="mx-auto flex min-h-screen max-w-3xl flex-col px-4 pt-16 sm:px-8">
		<LayoutHeader />
		<main class="flex-1">
			<article>
				<slot />
			</article>
		</main>
		<LayoutFooter />
	</div>
</template>
```

### 3.3 Tasks

- [ ] Create `layouts/default.vue`
- [ ] Create `layouts/post.vue`
- [ ] Create `components/layout/Header.vue`
- [ ] Create `components/layout/Footer.vue`
- [ ] Create `components/ThemeToggle.vue`
- [ ] Create `components/FormattedDate.vue`
- [ ] Create `components/SocialList.vue`
- [ ] Create `composables/useFormattedDate.ts`

---

## Phase 4: Pages

### 4.1 Homepage

```vue
<!-- app/pages/index.vue -->
<script setup lang="ts">
const { data: posts } = await useAsyncData("latest-posts", () =>
	queryCollection("posts")
		.where("draft", "=", false)
		.order("publishDate", "DESC")
		.limit(5)
		.all(),
);

const { data: notes } = await useAsyncData("latest-notes", () =>
	queryCollection("notes").order("publishDate", "DESC").limit(3).all(),
);

useSeoMeta({
	title: "Joël Kuijper",
	description: "Personal website of Joël Kuijper",
});
</script>

<template>
	<div>
		<section>
			<h2>Latest Posts</h2>
			<BlogPostPreview v-for="post in posts" :key="post._path" :post="post" />
			<NuxtLink to="/posts">View all posts →</NuxtLink>
		</section>

		<section>
			<h2>Recent Notes</h2>
			<NoteCard v-for="note in notes" :key="note._path" :note="note" />
			<NuxtLink to="/notes">View all notes →</NuxtLink>
		</section>
	</div>
</template>
```

### 4.2 Post Detail

```vue
<!-- app/pages/posts/[...slug].vue -->
<script setup lang="ts">
const route = useRoute();
const slug = Array.isArray(route.params.slug)
	? route.params.slug.join("/")
	: route.params.slug;

const { data: post } = await useAsyncData(`post-${slug}`, () =>
	queryCollection("posts").where("_path", "=", `/posts/${slug}`).first(),
);

if (!post.value) {
	throw createError({ statusCode: 404, message: "Post not found" });
}

useSeoMeta({
	title: post.value.title,
	description: post.value.description,
	ogTitle: post.value.title,
	ogDescription: post.value.description,
});

defineOgImageComponent("BlogPost", {
	title: post.value.title,
	date: post.value.publishDate,
});

definePageMeta({
	layout: "post",
});
</script>

<template>
	<div>
		<BlogMasthead :post="post" />
		<ContentRenderer :value="post" class="prose prose-joel" />
	</div>
</template>
```

### 4.3 Tasks

- [ ] Create `pages/index.vue` (homepage)
- [ ] Create `pages/posts/index.vue` (posts list)
- [ ] Create `pages/posts/[...slug].vue` (post detail)
- [ ] Create `pages/notes/index.vue` (notes list)
- [ ] Create `pages/notes/[...slug].vue` (note detail)
- [ ] Create `pages/tags/index.vue` (all tags)
- [ ] Create `pages/tags/[tag].vue` (posts by tag)
- [ ] Create `pages/[...slug].vue` (dynamic pages)
- [ ] Create `pages/about.vue`
- [ ] Create error page

---

## Phase 5: Blog Components

### 5.1 Masthead

```vue
<!-- app/components/blog/Masthead.vue -->
<script setup lang="ts">
defineProps<{
	post: {
		title: string;
		description?: string;
		publishDate: Date;
		updatedDate?: Date;
		tags?: string[];
		coverImage?: { src: string; alt: string };
	};
}>();
</script>

<template>
	<header class="mb-8">
		<div v-if="post.coverImage" class="mb-6">
			<NuxtImg
				:src="post.coverImage.src"
				:alt="post.coverImage.alt"
				class="rounded-lg"
				width="768"
				height="432"
			/>
		</div>
		<h1 class="title text-3xl sm:text-4xl">{{ post.title }}</h1>
		<p v-if="post.description" class="mt-2 text-gray-600 dark:text-gray-400">
			{{ post.description }}
		</p>
		<div class="mt-4 flex flex-wrap gap-2 text-sm text-gray-500">
			<FormattedDate :date="post.publishDate" />
			<span v-if="post.updatedDate">
				(Updated: <FormattedDate :date="post.updatedDate" />)
			</span>
		</div>
		<div v-if="post.tags?.length" class="mt-4 flex flex-wrap gap-2">
			<NuxtLink
				v-for="tag in post.tags"
				:key="tag"
				:to="`/tags/${tag}`"
				class="rounded bg-gray-100 px-2 py-1 text-sm dark:bg-gray-800"
			>
				{{ tag }}
			</NuxtLink>
		</div>
	</header>
</template>
```

### 5.2 Post Preview

```vue
<!-- app/components/blog/PostPreview.vue -->
<script setup lang="ts">
defineProps<{
	post: {
		_path: string;
		title: string;
		description?: string;
		publishDate: Date;
	};
}>();
</script>

<template>
	<article class="mb-6">
		<NuxtLink :to="post._path" class="group">
			<h3 class="title text-xl group-hover:text-link">{{ post.title }}</h3>
		</NuxtLink>
		<p v-if="post.description" class="mt-1 text-gray-600 dark:text-gray-400">
			{{ post.description }}
		</p>
		<FormattedDate
			:date="post.publishDate"
			class="mt-2 text-sm text-gray-500"
		/>
	</article>
</template>
```

### 5.3 Tasks

- [ ] Create `components/blog/Masthead.vue`
- [ ] Create `components/blog/PostPreview.vue`
- [ ] Create `components/note/NoteCard.vue`
- [ ] Create `components/Paginator.vue`
- [ ] Create `components/content/Timestamp.vue` (MDC component)

---

## Phase 6: Features

### 6.1 RSS Feeds

```ts
// server/routes/rss.xml.ts
import { Feed } from "feed";
import { serverQueryContent } from "#content/server";

export default defineEventHandler(async (event) => {
	const posts = await serverQueryContent(event, "posts")
		.where({ draft: { $ne: true } })
		.sort({ publishDate: -1 })
		.find();

	const feed = new Feed({
		title: "Joël Kuijper",
		description: "Personal website of Joël Kuijper",
		id: "https://joelkuijper.me/",
		link: "https://joelkuijper.me/",
		language: "nl",
		copyright: `© ${new Date().getFullYear()} Joël Kuijper`,
		feedLinks: {
			rss: "https://joelkuijper.me/rss.xml",
		},
	});

	for (const post of posts) {
		feed.addItem({
			title: post.title!,
			id: `https://joelkuijper.me${post._path}`,
			link: `https://joelkuijper.me${post._path}`,
			description: post.description,
			date: new Date(post.publishDate),
		});
	}

	setHeader(event, "content-type", "application/xml");
	return feed.rss2();
});
```

### 6.2 Search (Pagefind)

```bash
npm install -D pagefind
```

Add to `package.json`:

```json
{
	"scripts": {
		"postbuild": "pagefind --site .output/public"
	}
}
```

Create search component that loads Pagefind UI.

### 6.3 OG Images

`@nuxt/og-image` handles this automatically. Create a template:

```vue
<!-- app/components/OgImage/BlogPost.vue -->
<script setup lang="ts">
defineProps<{
	title: string;
	date: Date;
}>();
</script>

<template>
	<div
		class="flex h-full w-full flex-col justify-between bg-gray-900 p-12 text-white"
	>
		<div>
			<h1 class="text-5xl font-bold">{{ title }}</h1>
			<p class="mt-4 text-xl text-gray-400">
				{{ new Date(date).toLocaleDateString("nl-NL") }}
			</p>
		</div>
		<div class="text-2xl font-semibold text-green-400">joelkuijper.me</div>
	</div>
</template>
```

### 6.4 Tasks

- [ ] Create `server/routes/rss.xml.ts`
- [ ] Create `server/routes/notes/rss.xml.ts`
- [ ] Set up Pagefind for search
- [ ] Create search component
- [ ] Create OG image template
- [ ] Add Vercel Analytics

---

## Phase 7: Styling

### 7.1 Tailwind Migration

Copy and adapt `tailwind.config.ts`:

```ts
// tailwind.config.ts
import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

export default {
	content: [],
	darkMode: ["selector", '[data-theme="dark"]'],
	theme: {
		extend: {
			colors: {
				bgColor: "hsl(var(--theme-bg) / <alpha-value>)",
				textColor: "hsl(var(--theme-text) / <alpha-value>)",
				link: "hsl(var(--theme-link) / <alpha-value>)",
				accent: "hsl(var(--theme-accent) / <alpha-value>)",
				"accent-2": "hsl(var(--theme-accent-2) / <alpha-value>)",
				quote: "hsl(var(--theme-quote) / <alpha-value>)",
			},
			fontFamily: {
				albert: ["Albert Sans Variable", "sans-serif"],
				mono: ["DM Mono", "monospace"],
			},
		},
	},
	plugins: [typography],
} satisfies Config;
```

### 7.2 Global Styles

Copy CSS variables from `src/styles/global.css` to `assets/css/main.css`.

### 7.3 Tasks

- [ ] Create `tailwind.config.ts`
- [ ] Create `assets/css/main.css` with CSS variables
- [ ] Copy typography plugin customizations
- [ ] Verify dark mode works
- [ ] Test all color themes

---

## Phase 8: Deployment & Cutover

### 8.1 Vercel Configuration

```ts
// nuxt.config.ts
export default defineNuxtConfig({
	// ...
	nitro: {
		preset: "vercel",
	},
});
```

### 8.2 Environment Variables

```env
# Vercel will set these automatically
NUXT_PUBLIC_SITE_URL=https://joelkuijper.me
```

### 8.3 Cutover Steps

1. Test Nuxt app thoroughly in `nuxt-app/` subdirectory
2. Move Nuxt files to root, archive/remove Astro files
3. Update Vercel project settings if needed
4. Deploy and verify
5. Set up Studio authentication

### 8.4 Tasks

- [ ] Test all pages locally
- [ ] Test production build
- [ ] Deploy to Vercel preview
- [ ] Verify all routes work
- [ ] Move Nuxt to root directory
- [ ] Remove Astro files
- [ ] Final production deploy
- [ ] Configure Studio authentication
- [ ] Test Studio editing workflow

---

## Files to Remove (After Migration)

```
# Astro-specific
astro.config.ts
src/
keystatic.config.tsx
markdoc.config.mjs (already deleted)

# Old content location
content/post/
content/page/
content/note/
content/navigation.yaml
content/socials.yaml

# Astro dependencies in package.json
@astrojs/*
astro
astro-*
@keystatic/*
```

---

## Summary

| Metric                       | Value       |
| ---------------------------- | ----------- |
| **Pages to create**          | 10          |
| **Components to create**     | ~15         |
| **Content files to migrate** | 6           |
| **Estimated total effort**   | 20-25 hours |

### Migration Order

1. **Week 1**: Phases 1-2 (Setup + Content)
2. **Week 2**: Phases 3-4 (Layouts + Pages)
3. **Week 3**: Phases 5-6 (Components + Features)
4. **Week 4**: Phases 7-8 (Styling + Cutover)
