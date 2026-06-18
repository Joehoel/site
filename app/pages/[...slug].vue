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
  <!--
    Pages render their own Atelier MDC layout (hero + sticky-aside sections).
    The flex gap goes on ContentRenderer's own wrapper so the top-level blocks
    (hero + each section) become direct children and are evenly spaced.
  -->
  <ContentRenderer v-if="page" :value="page" class="flex flex-col gap-24 md:gap-32" />
</template>
