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

useSeoMeta({
  title: `Tag: ${tag.value}`,
  description: `View all posts with the tag - ${tag.value}`,
});
</script>

<template>
  <h1 class="title mb-6 flex items-center">
    <NuxtLink class="text-accent sm:hover:underline" to="/tags/">Tags</NuxtLink>
    <span class="me-3 ms-2">&rarr;</span>
    <span class="text-xl">#{{ tag }}</span>
  </h1>
  <section aria-label="Blog post list">
    <ul class="space-y-4">
      <li v-for="post in posts" :key="post.path" class="grid gap-2 sm:grid-cols-[auto_1fr]">
        <BlogPostPreview :post="post" as="h2" />
      </li>
    </ul>
  </section>
</template>
