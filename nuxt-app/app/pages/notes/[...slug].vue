<script setup lang="ts">
const route = useRoute();

const { data: note } = await useAsyncData(route.path, () =>
	queryCollection("notes").path(route.path).first(),
);

if (!note.value) {
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
