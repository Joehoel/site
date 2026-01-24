<script setup lang="ts">
useHead({
  htmlAttrs: {
    class: "scroll-smooth border-t-8 border-t-accent",
  },
});

const canSeeDrafts = useCanSeeDrafts();

// Fetch published content paths for filtering search results
const { data: publishedPaths } = useLazyAsyncData(
  "published-paths",
  async () => {
    if (canSeeDrafts.value) return null;
    const [posts, notes] = await Promise.all([
      queryCollection("posts").select("path").where("draft", "=", false).all(),
      queryCollection("notes").select("path").where("draft", "=", false).all(),
    ]);
    return new Set([...posts, ...notes].map((p) => p.path));
  },
  { server: false },
);

// Fetch search files for ContentSearch
const { data: files } = useLazyAsyncData(
  "search-files",
  () =>
    Promise.all([queryCollectionSearchSections("posts"), queryCollectionSearchSections("notes")]),
  {
    server: false,
    transform: (data) => {
      const flat = data.flat();
      if (canSeeDrafts.value || !publishedPaths.value) return flat;
      return flat.filter((section) => {
        const contentPath = section.id.split("#")[0] ?? section.id;
        return publishedPaths.value!.has(contentPath);
      });
    },
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
