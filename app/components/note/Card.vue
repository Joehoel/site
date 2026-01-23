<script setup lang="ts">
import type { NoteCollectionItem } from "@nuxt/content";

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
  hour: "2-digit",
  minute: "2-digit",
  year: "2-digit",
  month: "2-digit",
  day: "2-digit",
};

const HeadingTag = computed(() => props.headingLevel);
</script>

<template>
  <article
    :class="[
      isPreview && 'inline-grid rounded-md bg-[rgb(240,240,240)] px-4 py-3 dark:bg-[rgb(33,35,38)]',
    ]"
    :data-pagefind-body="!isPreview"
  >
    <component :is="HeadingTag" :class="['title', isPreview && 'text-base']">
      <NuxtLink v-if="isPreview" :to="note.path" class="link">
        {{ note.title }}
      </NuxtLink>
      <template v-else>{{ note.title }}</template>
    </component>
    <time
      :datetime="new Date(note.publishDate).toISOString()"
      :title="new Date(note.publishDate).toISOString()"
    >
      {{ new Date(note.publishDate).toLocaleDateString("nl-NL", dateTimeOptions) }}
    </time>
    <div
      :class="[
        'prose prose-sm prose-joel mt-4 max-w-none [&>p:last-of-type]:mb-0',
        isPreview && 'line-clamp-6',
      ]"
    >
      <ContentRenderer :value="note" />
    </div>
  </article>
</template>
