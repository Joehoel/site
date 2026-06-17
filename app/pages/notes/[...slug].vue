<script setup lang="ts">
const route = useRoute();
const canSeeDrafts = useCanSeeDrafts();

const { data: note } = await useAsyncData(route.path, () =>
  queryCollection("notes").path(route.path).first(),
);

// 404 if note not found or is a draft (unless in dev mode or logged in)
if (!note.value || (note.value.draft && !canSeeDrafts.value)) {
  throw createError({ statusCode: 404, message: "Note not found" });
}

useSeoMeta({
  title: note.value.title,
  description:
    note.value.description ||
    `Read about my note posted on: ${new Date(note.value.publishDate).toLocaleDateString()}`,
});
</script>

<template>
  <article v-if="note" class="break-words">
    <NuxtLink
      to="/notes"
      class="group mb-12 inline-flex items-center gap-2 font-label text-[0.6875rem] uppercase tracking-[0.1em] text-outline transition-colors hover:text-highlighted"
    >
      <UIcon
        name="i-lucide-arrow-left"
        class="size-3.5 transition-transform group-hover:-translate-x-0.5"
      />
      All notes
    </NuxtLink>

    <NoteCard :note="note" heading-level="h1" />
  </article>
</template>
