<script setup lang="ts">
const appConfig = useAppConfig();

const props = defineProps<{
  post: {
    path?: string;
    slug?: string;
    title: string;
    description?: string;
    publishDate: string | Date;
    updatedDate?: string | Date;
    tags?: string[];
    coverImage?: { src: string; alt: string };
    draft?: boolean;
  };
}>();

const slug = computed(() => props.post.slug ?? props.post.path?.split("/").pop());

const isoDate = computed(() => new Date(props.post.publishDate).toISOString());

const displayDate = computed(() =>
  new Date(props.post.publishDate)
    .toLocaleDateString(appConfig.date.locale, appConfig.date.options)
    .toUpperCase(),
);

const updatedIso = computed(() =>
  props.post.updatedDate ? new Date(props.post.updatedDate).toISOString() : undefined,
);

const updatedDisplay = computed(() =>
  props.post.updatedDate
    ? new Date(props.post.updatedDate)
        .toLocaleDateString(appConfig.date.locale, appConfig.date.options)
        .toUpperCase()
    : undefined,
);
</script>

<template>
  <header class="flex flex-col gap-y-8">
    <!-- Cover image: grayscale, tonal fade into the page (no border). -->
    <div
      v-if="post.coverImage?.src"
      class="relative aspect-[21/9] overflow-hidden bg-surface-container-low"
    >
      <NuxtImg
        class="size-full object-cover opacity-60 grayscale"
        fetchpriority="high"
        loading="eager"
        :src="post.coverImage.src"
        :alt="post.coverImage.alt ?? ''"
        width="1200"
        height="515"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-surface to-transparent" />
    </div>

    <!-- Eyebrow + meta -->
    <div class="flex flex-col gap-y-3">
      <Eyebrow :label="post.draft ? 'Technical Post // Draft' : 'Technical Post'" />
      <MetaRow :items="[displayDate]">
        <template v-if="updatedDisplay">
          <span aria-hidden="true" class="h-px w-6 bg-outline-variant" />
          <span
            class="font-label text-[0.6875rem] uppercase tracking-[0.1em] text-on-surface-variant"
          >
            Bijgewerkt
            <time :datetime="updatedIso" :title="updatedIso">{{ updatedDisplay }}</time>
          </span>
        </template>
        <time :datetime="isoDate" class="sr-only">{{ isoDate }}</time>
      </MetaRow>
    </div>

    <!-- Title -->
    <h1
      class="max-w-4xl font-headline text-4xl font-bold leading-[1.1] tracking-[-0.04em] text-highlighted md:text-5xl"
      :style="slug ? { viewTransitionName: `post-${slug}` } : {}"
    >
      {{ post.title }}
    </h1>

    <!-- Tags -->
    <div v-if="post.tags?.length" class="flex flex-wrap gap-2">
      <Tag v-for="tag in post.tags" :key="tag" :label="tag" :to="`/tags/${tag}/`" />
    </div>
  </header>
</template>
