<script setup lang="ts">
const appConfig = useAppConfig();

const props = defineProps<{
  post: {
    path?: string;
    title: string;
    description?: string;
    publishDate: string | Date;
    tags?: string[];
    draft?: boolean;
  };
  /** Sequential entry number (e.g. 24 → rendered as `#024`). Optional. */
  index?: number;
}>();

const slug = computed(() => props.post.path?.split("/").pop());

const isoDate = computed(() => new Date(props.post.publishDate).toISOString());

const displayDate = computed(() =>
  new Date(props.post.publishDate)
    .toLocaleDateString(appConfig.date.locale, appConfig.date.options)
    .toUpperCase(),
);

const entryNo = computed(() =>
  props.index === undefined ? undefined : `#${String(props.index).padStart(3, "0")}`,
);
</script>

<template>
  <NuxtLink
    :to="post.path"
    class="group relative flex flex-col gap-y-4 bg-surface px-4 py-10 transition-colors duration-300 hover:bg-surface-container-low sm:px-6 md:flex-row md:gap-x-8"
  >
    <!-- Left rail: date + entry № -->
    <div class="md:w-1/4 md:shrink-0">
      <MetaRow stacked>
        <time :datetime="isoDate" class="font-label text-[0.6875rem] uppercase tracking-[0.1em]">
          {{ displayDate }}
        </time>
        <span
          v-if="entryNo"
          class="mt-1 font-label text-[0.6875rem] uppercase tracking-[0.1em] text-on-surface-variant/40"
        >
          {{ entryNo }}
        </span>
      </MetaRow>
    </div>

    <!-- Content -->
    <div class="md:w-3/4">
      <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h3
            class="mb-3 font-headline text-xl font-bold tracking-tight text-highlighted md:text-2xl"
            :style="slug ? { viewTransitionName: `post-${slug}` } : {}"
          >
            <span v-if="post.draft" class="text-on-surface-variant">(Draft) </span>{{ post.title }}
          </h3>
          <p
            v-if="post.description"
            class="mb-6 max-w-2xl font-body text-sm leading-relaxed text-muted"
          >
            {{ post.description }}
          </p>
          <div v-if="post.tags?.length" class="flex flex-wrap gap-2">
            <Tag v-for="tag in post.tags" :key="tag" :label="tag" />
          </div>
        </div>

        <UIcon
          name="i-lucide-arrow-up-right"
          class="hidden size-5 shrink-0 text-outline-variant transition-colors group-hover:text-highlighted md:block"
        />
      </div>
    </div>
  </NuxtLink>
</template>
