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
    const noteSections = queryCollectionSearchSections("notes");
    const postNavigation = queryCollectionNavigation("posts");
    const noteNavigation = queryCollectionNavigation("notes");

    if (requestAudience === "published") {
      postSections.where("draft", "=", false);
      noteSections.where("draft", "=", false);
      postNavigation.where("draft", "=", false);
      noteNavigation.where("draft", "=", false);
    }

    const [posts, notes, postsNav, notesNav] = await Promise.all([
      postSections,
      noteSections,
      postNavigation,
      noteNavigation,
    ]);

    return {
      audience: requestAudience,
      files: [...posts, ...notes],
      navigation: [...postsNav, ...notesNav],
    };
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
    <LazyUContentSearch
      :files="currentSearch?.files ?? []"
      :navigation="currentSearch?.navigation ?? []"
      :links="links"
      :loading="!currentSearch && searchStatus !== 'error'"
      title="Search"
      description="Search Log entries and notes."
      placeholder="Search Log entries and notes"
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
