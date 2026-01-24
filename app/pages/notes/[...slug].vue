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
  <NoteCard v-if="note" :note="note" heading-level="h1" />
</template>
