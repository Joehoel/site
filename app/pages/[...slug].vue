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
    Pages render their own Atelier MDC layout (hero + sticky-aside sections),
    so we break out of the layout's max-w-3xl column to a full-width 7xl grid.
  -->
  <div
    v-if="page"
    class="relative left-1/2 right-1/2 -mx-[50vw] w-screen max-w-[100vw] overflow-x-clip"
  >
    <div class="mx-auto max-w-7xl px-4 sm:px-8">
      <div class="flex flex-col gap-24 md:gap-32">
        <ContentRenderer :value="page" />
      </div>
    </div>
  </div>
</template>
