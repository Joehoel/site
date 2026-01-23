<script setup lang="ts">
const { data: posts } = await useAsyncData("all-posts", () =>
  queryCollection("posts").where("draft", "=", false).order("publishDate", "DESC").all(),
);

// Group posts by year
const groupedByYear = computed(() => {
  if (!posts.value) return {};
  return posts.value.reduce(
    (acc, post) => {
      const year = new Date(post.publishDate).getFullYear().toString();
      if (!acc[year]) acc[year] = [];
      acc[year].push(post);
      return acc;
    },
    {} as Record<string, typeof posts.value>,
  );
});

const descYearKeys = computed(() => Object.keys(groupedByYear.value).sort((a, b) => +b - +a));

// Get unique tags (max 7)
const uniqueTags = computed(() => {
  if (!posts.value) return [];
  const tags = posts.value.flatMap((post) => post.tags || []);
  return [...new Set(tags)].slice(0, 7);
});

useSeoMeta({
  title: "Posts",
  description: "Read my collection of posts and the things that interest me",
});
</script>

<template>
  <div>
    <h1 class="title mb-6 flex items-center gap-3">
      Posts
      <a class="text-accent" href="/rss.xml" target="_blank">
        <span class="sr-only">RSS feed</span>
        <Icon aria-hidden="true" class="h-6 w-6" focusable="false" name="mdi:rss" />
      </a>
    </h1>
    <div class="grid gap-y-16 sm:grid-cols-[3fr_1fr] sm:gap-x-8">
      <section aria-label="Blog post list">
        <template v-for="yearKey in descYearKeys" :key="yearKey">
          <h2 class="title text-lg">{{ yearKey }}</h2>
          <ul class="mb-16 mt-5 space-y-4 text-start">
            <li
              v-for="post in groupedByYear[yearKey]"
              :key="post.path"
              class="grid gap-2 sm:grid-cols-[auto_1fr] sm:[&_q]:col-start-2"
            >
              <BlogPostPreview :post="post" />
            </li>
          </ul>
        </template>
      </section>
      <aside v-if="uniqueTags.length">
        <h2 class="title mb-4 flex items-center gap-2 text-lg">
          Tags
          <svg
            aria-hidden="true"
            class="h-6 w-6"
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M0 0h24v24H0z" fill="none" stroke="none" />
            <path
              d="M7.859 6h-2.834a2.025 2.025 0 0 0 -2.025 2.025v2.834c0 .537 .213 1.052 .593 1.432l6.116 6.116a2.025 2.025 0 0 0 2.864 0l2.834 -2.834a2.025 2.025 0 0 0 0 -2.864l-6.117 -6.116a2.025 2.025 0 0 0 -1.431 -.593z"
            />
            <path d="M17.573 18.407l2.834 -2.834a2.025 2.025 0 0 0 0 -2.864l-7.117 -7.116" />
            <path d="M6 9h-.01" />
          </svg>
        </h2>
        <ul class="flex flex-wrap gap-2">
          <li v-for="tag in uniqueTags" :key="tag">
            <a
              :aria-label="`View all posts with the tag: ${tag}`"
              class="link flex items-center justify-center"
              :href="`/tags/${tag}/`"
            >
              #{{ tag }}
            </a>
          </li>
        </ul>
        <span class="mt-4 block sm:text-end">
          <a aria-label="View all blog categories" class="sm:hover:text-link" href="/tags/">
            View all →
          </a>
        </span>
      </aside>
    </div>
  </div>
</template>
