<script setup lang="ts">
const route = useRoute();
const slug = Array.isArray(route.params.slug) ? route.params.slug.join("/") : route.params.slug;

const { data: note } = await useAsyncData(`note-${slug}`, () =>
	queryCollection("notes").where("_stem", "=", slug).first(),
);

if (!note.value) {
	throw createError({ statusCode: 404, message: "Note not found" });
}

useSeoMeta({
	title: note.value.title,
	description: note.value.description,
});
</script>

<template>
	<div v-if="note">
		<header class="mb-8">
			<h1 class="title text-2xl">{{ note.title }}</h1>
			<p v-if="note.description" class="mt-2 text-gray-600 dark:text-gray-400">
				{{ note.description }}
			</p>
			<time class="mt-2 block text-sm text-gray-500">
				{{
					new Date(note.publishDate).toLocaleDateString("nl-NL", {
						day: "numeric",
						month: "short",
						year: "numeric",
					})
				}}
			</time>
		</header>
		<ContentRenderer :value="note" class="prose prose-lg max-w-none dark:prose-invert" />
	</div>
</template>
