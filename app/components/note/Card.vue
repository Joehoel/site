<script setup lang="ts">
import type { NoteCollectionItem } from "@nuxt/content";

const appConfig = useAppConfig();

const props = withDefaults(
  defineProps<{
    note: NoteCollectionItem;
    isPreview?: boolean;
    headingLevel?: "h1" | "h2" | "h3";
  }>(),
  {
    isPreview: false,
    headingLevel: "h2",
  },
);

const dateTimeOptions: Intl.DateTimeFormatOptions = {
  ...appConfig.date.options,
  hour: "2-digit",
  minute: "2-digit",
};

const isoDate = computed(() => new Date(props.note.publishDate).toISOString());

const displayDate = computed(() =>
  new Date(props.note.publishDate)
    .toLocaleDateString(appConfig.date.locale, dateTimeOptions)
    .toUpperCase(),
);

const eyebrowLabel = computed(() => (props.note.draft ? "NOTE // DRAFT" : "NOTE"));

const HeadingTag = computed(() => props.headingLevel);
</script>

<template>
  <article class="flex flex-col gap-y-4" :data-pagefind-body="!isPreview">
    <div class="flex flex-col gap-y-3">
      <Eyebrow :label="eyebrowLabel" />
      <MetaRow>
        <time
          :datetime="isoDate"
          :title="isoDate"
          class="font-label text-[0.6875rem] uppercase tracking-[0.1em] text-on-surface-variant"
        >
          {{ displayDate }}
        </time>
      </MetaRow>
    </div>

    <component
      :is="HeadingTag"
      class="font-headline font-bold tracking-[-0.04em] text-highlighted"
      :class="isPreview ? 'text-xl md:text-2xl' : 'text-2xl md:text-3xl'"
    >
      <NuxtLink
        v-if="isPreview"
        :to="note.path"
        class="transition-colors hover:text-on-surface-variant"
      >
        {{ note.title }}
      </NuxtLink>
      <template v-else>{{ note.title }}</template>
    </component>

    <div
      class="prose prose-atelier mt-2 max-w-4xl [&>:first-child]:mt-0 [&>:last-child]:mb-0"
      :class="isPreview ? 'max-h-80 overflow-hidden' : undefined"
      :inert="isPreview ? true : undefined"
      :data-pagefind-ignore="isPreview ? true : undefined"
    >
      <ContentRenderer :value="note" />
    </div>
    <NuxtLink
      v-if="isPreview"
      :to="note.path"
      :aria-label="`Read note: ${note.title}`"
      class="inline-flex self-start items-center gap-2 font-label text-sm text-highlighted underline underline-offset-4"
    >
      Read note
      <UIcon name="i-lucide-arrow-right" aria-hidden="true" class="size-4" />
    </NuxtLink>
  </article>
</template>
