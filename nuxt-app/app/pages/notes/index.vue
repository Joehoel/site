<script setup lang="ts">
const { data: notes } = await useAsyncData("all-notes", () =>
	queryCollection("notes").order("publishDate", "DESC").all(),
);

useSeoMeta({
	title: "Notes",
	description: "Read my collection of notes",
});
</script>

<template>
	<section>
		<h1 class="title mb-6 flex items-center gap-3">
			Notes
			<a class="text-accent" href="/notes/rss.xml" target="_blank">
				<span class="sr-only">RSS feed</span>
				<Icon aria-hidden="true" class="h-6 w-6" focusable="false" name="mdi:rss" />
			</a>
		</h1>
		<ul class="mt-6 space-y-8 text-start">
			<li v-for="note in notes" :key="note.path">
				<NoteCard :note="note" is-preview />
			</li>
		</ul>
	</section>
</template>
