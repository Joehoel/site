<script setup lang="ts">
useHead({
  htmlAttrs: {
    class: "scroll-smooth",
  },
});

const site = useSiteConfig();
const fallbackImage = new URL("/og/default.png", site.url).href;
useServerSeoMeta({
  ogImage: fallbackImage,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageType: "image/png",
  twitterImage: fallbackImage,
});

const canSeeDrafts = useCanSeeDrafts();
const audience = computed(() => (canSeeDrafts.value ? "preview" : "published"));
const searchKey = computed(() => `content-search-${audience.value}`);

const { data: searchSnapshot, status: searchStatus } = useLazyAsyncData(
  searchKey,
  async () => {
    const requestAudience = audience.value;
    const postSections = queryCollectionSearchSections("posts");
    const postNavigation = queryCollectionNavigation("posts");

    if (requestAudience === "published") {
      postSections.where("draft", "=", false);
      postNavigation.where("draft", "=", false);
    }

    const [files, navigation] = await Promise.all([postSections, postNavigation]);

    return { audience: requestAudience, files, navigation };
  },
  { server: false },
);

const currentSearch = computed(() =>
  searchStatus.value === "success" && searchSnapshot.value?.audience === audience.value
    ? searchSnapshot.value
    : undefined,
);
const searchMessage = computed(() =>
  searchStatus.value === "error"
    ? "Search couldn't load. Reload the page and try again."
    : !currentSearch.value
      ? "Loading search…"
      : "",
);

const links = [
  {
    label: "Log",
    icon: "i-lucide-file-text",
    to: "/log",
  },
];
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <ClientOnly>
    <LazyUContentSearch
      :files="currentSearch?.files ?? []"
      :navigation="currentSearch?.navigation ?? []"
      :links="links"
      :loading="!currentSearch && searchStatus !== 'error'"
      title="Search"
      description="Search Log entries."
      placeholder="Search Log entries"
    >
      <template #empty>
        <p v-if="currentSearch" role="status">No results found. Try another search.</p>
      </template>
      <template v-if="searchMessage" #footer>
        <p class="px-4 py-3 text-sm text-muted" role="status">{{ searchMessage }}</p>
      </template>
    </LazyUContentSearch>
  </ClientOnly>
</template>
