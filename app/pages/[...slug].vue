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
  description: page.value.description ?? undefined,
  ogImage: page.value.ogImage ?? undefined,
});
</script>

<template>
  <!-- Pages render their own Atelier MDC layout (hero + sticky-aside sections). -->
  <div v-if="page" class="flex flex-col gap-24 md:gap-32">
    <ContentRenderer :value="page" />
  </div>
</template>
