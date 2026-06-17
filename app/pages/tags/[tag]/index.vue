<script setup lang="ts">
const route = useRoute();
const tag = computed(() => route.params.tag as string);

const { data: allPosts } = await useAsyncData("all-posts-no-draft", () =>
  queryCollection("posts").where("draft", "=", false).order("publishDate", "DESC").all(),
);

const posts = computed(
  () => allPosts.value?.filter((post) => post.tags?.includes(tag.value)) ?? [],
);

if (posts.value.length === 0) {
  throw createError({ statusCode: 404, message: `No posts found with tag: ${tag.value}` });
}

const total = computed(() => posts.value.length);

useSeoMeta({
  title: `Tag: ${tag.value}`,
  description: `View all posts with the tag - ${tag.value}`,
});
</script>

<template>
  <div>
    <!-- Hero header -->
    <header class="mb-16 grid grid-cols-1 gap-8 md:grid-cols-12">
      <div class="md:col-span-8">
        <NuxtLink
          to="/tags/"
          class="mb-4 inline-flex items-center gap-x-2 font-label text-[0.6875rem] font-medium uppercase tracking-[0.1em] text-outline transition-colors hover:text-highlighted"
        >
          <UIcon aria-hidden="true" name="i-lucide-arrow-left" class="size-3.5" />
          ALL_TOPICS
        </NuxtLink>
        <h1
          class="font-headline text-5xl font-bold leading-[1.05] tracking-[-0.04em] text-highlighted md:text-6xl"
        >
          #{{ tag }}
        </h1>
      </div>
      <div class="flex items-start md:col-span-4 md:items-end md:justify-end">
        <p class="max-w-xs font-body text-sm leading-relaxed text-muted md:text-right">
          {{ total }} entr{{ total === 1 ? "y" : "ies" }} tagged
          <span class="text-highlighted">{{ tag }}</span
          >, newest first.
        </p>
      </div>
    </header>

    <!-- Article list -->
    <section aria-label="Blog post list">
      <div class="flex flex-col divide-y divide-outline-variant">
        <BlogPostListItem
          v-for="(post, i) in posts"
          :key="post.path"
          :post="post"
          :index="total - i"
        />
      </div>
    </section>
  </div>
</template>
