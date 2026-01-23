<script setup lang="ts">
useHead({
  htmlAttrs: {
    class: "scroll-smooth border-t-8 border-t-accent",
  },
});

// Fetch search files for ContentSearch
const { data: files } = useLazyAsyncData(
  "search-files",
  () =>
    Promise.all([queryCollectionSearchSections("posts"), queryCollectionSearchSections("notes")]),
  {
    server: false,
    transform: (data) => data.flat(),
  },
);

// Fetch navigation for ContentSearch
const { data: navigation } = useLazyAsyncData(
  "search-navigation",
  () => Promise.all([queryCollectionNavigation("posts"), queryCollectionNavigation("notes")]),
  {
    server: false,
    transform: (data) => data.flat(),
  },
);

const links = [
  {
    label: "Posts",
    icon: "i-lucide-file-text",
    to: "/posts",
  },
  {
    label: "Notes",
    icon: "i-lucide-notebook-pen",
    to: "/notes",
  },
];
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <ClientOnly>
    <LazyUContentSearch :files="files || []" :navigation="navigation || []" :links="links" />
  </ClientOnly>
</template>
