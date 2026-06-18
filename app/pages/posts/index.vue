<script setup lang="ts">
const { data: posts } = await useAsyncData("all-posts", () =>
  queryCollection("posts").where("draft", "=", false).order("publishDate", "DESC").all(),
);

// Topic filter — `null` means "ALL".
const activeTag = ref<string | null>(null);

// Unique topics across all posts, in first-seen order.
const topics = computed(() => {
  if (!posts.value) return [];
  return [...new Set(posts.value.flatMap((post) => post.tags ?? []))];
});

// Posts matching the active topic filter.
const filteredPosts = computed(() => {
  if (!posts.value) return [];
  if (!activeTag.value) return posts.value;
  return posts.value.filter((post) => post.tags?.includes(activeTag.value as string));
});

// Entry № counts down from the newest filtered post.
const total = computed(() => filteredPosts.value.length);

// Load-more: reveal posts in batches.
const PAGE_SIZE = 8;
const visibleCount = ref(PAGE_SIZE);

// Reset pagination whenever the filter changes.
watch(activeTag, () => {
  visibleCount.value = PAGE_SIZE;
});

const visiblePosts = computed(() => filteredPosts.value.slice(0, visibleCount.value));
const hasMore = computed(() => visibleCount.value < total.value);

const loadMore = () => {
  visibleCount.value += PAGE_SIZE;
};

const selectTag = (tag: string | null) => {
  activeTag.value = tag;
};

useSeoMeta({
  title: "Posts",
  description: "Read my collection of posts and the things that interest me",
});
</script>

<template>
  <div>
    <!-- Hero header -->
    <header class="mb-16 grid grid-cols-1 gap-8 md:grid-cols-12">
      <div class="md:col-span-8">
        <Eyebrow class="mb-4" label="TECHNICAL_LOG" />
        <h1
          class="font-headline text-5xl font-bold leading-[1.05] tracking-[-0.04em] text-highlighted md:text-6xl"
        >
          Articles, side projects &amp; engineering notes.
        </h1>
      </div>
      <div class="flex items-start md:col-span-4 md:items-end md:justify-end">
        <p class="max-w-xs font-body text-sm leading-relaxed text-muted md:text-right">
          Documentation of my journey through distributed systems, frontend architecture, and
          developer tooling. Updated sporadically.
          <a
            class="ml-1 inline-flex align-middle text-outline transition-colors hover:text-highlighted"
            href="/rss.xml"
            target="_blank"
          >
            <span class="sr-only">RSS feed</span>
            <UIcon aria-hidden="true" class="size-4" name="i-mdi-rss" />
          </a>
        </p>
      </div>
    </header>

    <!-- Topic filter -->
    <section
      v-if="topics.length"
      aria-label="Filter posts by topic"
      class="mb-12 flex flex-wrap gap-2 bg-surface-container-lowest p-4"
    >
      <FilterChip label="ALL" :active="activeTag === null" @select="selectTag(null)" />
      <FilterChip
        v-for="topic in topics"
        :key="topic"
        :label="topic"
        :active="activeTag === topic"
        @select="selectTag(topic)"
      />
    </section>

    <!-- Article list -->
    <div class="flex flex-col divide-y divide-outline-variant">
      <BlogPostListItem
        v-for="(post, i) in visiblePosts"
        :key="post.path"
        :post="post"
        :index="total - i"
      />
    </div>

    <p v-if="!visiblePosts.length" class="py-16 text-center font-body text-sm text-muted">
      No posts match this topic yet.
    </p>

    <!-- Load more -->
    <div v-if="hasMore" class="mt-16 flex justify-center">
      <UButton
        color="primary"
        variant="solid"
        size="lg"
        :ui="{
          base: 'rounded-none font-label text-[0.6875rem] uppercase tracking-[0.2em] font-bold px-12 py-4',
        }"
        @click="loadMore"
      >
        LOAD_ARCHIVE_DATA
      </UButton>
    </div>
  </div>
</template>
