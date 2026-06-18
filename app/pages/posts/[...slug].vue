<script setup lang="ts">
const route = useRoute();
const canSeeDrafts = useCanSeeDrafts();

const { data: post } = await useAsyncData(route.path, () =>
  queryCollection("posts").path(route.path).first(),
);

// 404 if post not found or is a draft (unless in dev mode or logged in)
if (!post.value || (post.value.draft && !canSeeDrafts.value)) {
  throw createError({ statusCode: 404, message: "Post not found" });
}

useSeoMeta({
  title: post.value.title,
  description: post.value.description,
  ogTitle: post.value.title,
  ogDescription: post.value.description,
});

definePageMeta({
  layout: "post",
});

interface TocLink {
  id: string;
  text: string;
  depth: number;
  children?: TocLink[];
}

// Table of contents derived from the document headings (Nuxt Content v3).
const toc = computed<TocLink[]>(
  () => (post.value?.body as { toc?: { links?: TocLink[] } } | undefined)?.toc?.links ?? [],
);

// Reading time — walk the minimark body AST for text, ~200 wpm.
const readingMinutes = computed(() => {
  const root = (post.value?.body as { value?: unknown[] } | undefined)?.value;
  if (!root) return 0;

  let words = 0;
  const countNode = (node: unknown) => {
    if (typeof node === "string") {
      words += node.split(/\s+/).filter(Boolean).length;
      return;
    }
    // minimark element: [tag, props, ...children] — skip tag + props, walk children.
    if (Array.isArray(node)) node.slice(2).forEach(countNode);
  };
  root.forEach(countNode);

  return words ? Math.max(1, Math.round(words / 200)) : 0;
});
</script>

<template>
  <article v-if="post" class="break-words" data-pagefind-body>
    <div id="blog-hero">
      <BlogMasthead :post="post" />
    </div>

    <div class="mt-20 grid grid-cols-1 gap-12 lg:grid-cols-12">
      <!-- Left rail: reading time + table of contents -->
      <aside class="lg:col-span-3">
        <div class="flex flex-col gap-y-10 lg:sticky lg:top-28">
          <div v-if="readingMinutes">
            <Eyebrow label="Reading Time" class="mb-3" />
            <p class="font-headline font-medium text-highlighted">{{ readingMinutes }} min</p>
          </div>

          <nav v-if="toc.length" aria-label="Table of contents">
            <Eyebrow label="Contents" class="mb-4" />
            <ul class="flex flex-col gap-y-2.5 border-l border-outline-variant">
              <li v-for="link in toc" :key="link.id">
                <a
                  :href="`#${link.id}`"
                  class="-ml-px block border-l border-transparent pl-4 font-body text-sm leading-snug text-muted transition-colors hover:border-highlighted hover:text-highlighted"
                >
                  {{ link.text }}
                </a>
                <ul v-if="link.children?.length" class="mt-2 flex flex-col gap-y-2">
                  <li v-for="child in link.children" :key="child.id">
                    <a
                      :href="`#${child.id}`"
                      class="-ml-px block border-l border-transparent pl-8 font-body text-[0.8125rem] leading-snug text-outline transition-colors hover:border-highlighted hover:text-muted"
                    >
                      {{ child.text }}
                    </a>
                  </li>
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </aside>

      <!-- Article body -->
      <div class="prose prose-atelier lg:col-span-9">
        <ContentRenderer :value="post" />
      </div>
    </div>
  </article>
</template>
