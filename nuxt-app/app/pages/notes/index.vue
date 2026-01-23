<script setup lang="ts">
const appConfig = useAppConfig();

const { data: notes } = await useAsyncData("all-notes", () =>
	queryCollection("notes").order("publishDate", "DESC").all(),
);

useSeoMeta({
	title: `Notes | ${appConfig.site.title}`,
	description: "Quick notes and code snippets",
});
</script>

<template>
	<div>
		<h1 class="title mb-8 text-3xl">Notes</h1>
		<div class="space-y-6">
			<NoteCard v-for="note in notes" :key="note._path" :note="note" />
		</div>
	</div>
</template>
