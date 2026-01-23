<script setup lang="ts">
const route = useRoute();

const { data: page } = await useAsyncData(route.path, () =>
  queryCollection("pages").path(route.path).first(),
);

if (!page.value) {
  throw createError({ statusCode: 404, message: "Page not found" });
}

useSeoMeta({
  title: page.value.title,
  ogImage: page.value.ogImage ?? undefined,
});
</script>

<template>
  <div v-if="page">
    <h1 class="title mb-6">{{ page.title }}</h1>
    <div
      class="prose prose-sm prose-joel mt-12 prose-headings:font-semibold prose-headings:text-accent-2 prose-headings:before:absolute prose-headings:before:-ms-4 prose-headings:before:text-accent sm:prose-headings:before:content-['#'] sm:prose-th:before:content-none"
    >
      <ContentRenderer :value="page" />
    </div>
  </div>
</template>
