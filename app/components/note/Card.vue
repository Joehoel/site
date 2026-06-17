<script setup lang="ts">
import type { NoteCollectionItem } from "@nuxt/content";

const appConfig = useAppConfig();

const props = withDefaults(
  defineProps<{
    note: NoteCollectionItem;
    /** Listing context: the title links to the note and the body is hidden from Pagefind. */
    isPreview?: boolean;
    headingLevel?: "h1" | "h2" | "h3";
  }>(),
  {
    isPreview: false,
    headingLevel: "h2",
  },
);

// Notes carry a full timestamp — surface date + time in the technical-terminal style.
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
    <!-- Spec header: // NOTE eyebrow + timestamp -->
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

    <!-- Title -->
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

    <!-- Body: full content inline; code rendered via the compact CodeBlock. -->
    <div class="prose prose-atelier mt-2 max-w-4xl [&>:first-child]:mt-0 [&>:last-child]:mb-0">
      <ContentRenderer :value="note" />
    </div>
  </article>
</template>
