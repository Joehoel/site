<script setup lang="ts">
const { data: posts } = await useAsyncData("all-posts-for-tags", () =>
  queryCollection("posts").where("draft", "=", false).all(),
);

// Unique tags with post counts, sorted alphabetically.
const tagsWithCount = computed(() => {
  const tagMap = new Map<string, number>();
  posts.value?.forEach((post) => {
    post.tags?.forEach((tag: string) => {
      tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
    });
  });
  return Array.from(tagMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));
});

useSeoMeta({
  title: "All Tags",
  description: "A list of all the topics I've written about in my posts",
});
</script>

<template>
  <div>
    <!-- Hero header -->
    <header class="mb-16 grid grid-cols-1 gap-8 md:grid-cols-12">
      <div class="md:col-span-8">
        <Eyebrow class="mb-4" label="TOPIC_INDEX" />
        <h1
          class="font-headline text-5xl font-bold leading-[1.05] tracking-[-0.04em] text-highlighted md:text-6xl"
        >
          Every topic I've written about.
        </h1>
      </div>
      <div class="flex items-start md:col-span-4 md:items-end md:justify-end">
        <p class="max-w-xs font-body text-sm leading-relaxed text-muted md:text-right">
          Browse the archive by subject. Select a tag to filter the technical log down to a single
          thread.
        </p>
      </div>
    </header>

    <!-- Tag cloud -->
    <section
      v-if="tagsWithCount.length"
      aria-label="All tags"
      class="flex flex-wrap items-center gap-3 bg-surface-container-lowest p-6"
    >
      <span
        v-for="[tag, count] in tagsWithCount"
        :key="tag"
        class="inline-flex items-center gap-x-1.5"
      >
        <Tag :label="tag" :to="`/tags/${tag}/`" :title="`View posts with the tag: ${tag}`" />
        <span class="font-label text-[0.625rem] tabular-nums tracking-[0.1em] text-outline">
          {{ String(count).padStart(2, "0") }}
        </span>
      </span>
    </section>

    <p v-else class="py-16 text-center font-body text-sm text-muted">No tags yet.</p>
  </div>
</template>
