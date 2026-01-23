<script setup lang="ts">
const appConfig = useAppConfig() as any;

const { data: posts } = await useAsyncData("latest-posts", () =>
	queryCollection("posts").where("draft", "=", false).order("publishDate", "DESC").limit(5).all(),
);

const { data: notes } = await useAsyncData("latest-notes", () =>
	queryCollection("notes").order("publishDate", "DESC").limit(3).all(),
);

useSeoMeta({
	title: appConfig.site.title,
	description: appConfig.site.description,
});
</script>

<template>
	<div>
		<section class="mb-12">
			<h1 class="title mb-6 text-3xl">Latest Posts</h1>
			<div class="space-y-6">
				<BlogPostPreview v-for="post in posts" :key="post._path" :post="post" />
			</div>
			<NuxtLink to="/posts" class="mt-4 inline-block text-link hover:underline">
				View all posts →
			</NuxtLink>
		</section>

		<section>
			<h2 class="title mb-6 text-2xl">Recent Notes</h2>
			<div class="space-y-4">
				<NoteCard v-for="note in notes" :key="note._path" :note="note" />
			</div>
			<NuxtLink to="/notes" class="mt-4 inline-block text-link hover:underline">
				View all notes →
			</NuxtLink>
		</section>
	</div>
</template>
