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
</script>

<template>
  <article v-if="post" class="break-words" data-pagefind-body>
    <div id="blog-hero">
      <BlogMasthead :post="post" />
    </div>
    <div class="prose prose-atelier mt-16 max-w-4xl">
      <ContentRenderer :value="post" />
    </div>
  </article>
</template>
