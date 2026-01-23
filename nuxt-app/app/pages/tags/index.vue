<script setup lang="ts">
const { data: posts } = await useAsyncData("all-posts-for-tags", () =>
	queryCollection("posts").where("draft", "=", false).all(),
);

// Get unique tags with counts
const tagsWithCount = computed(() => {
	const tagMap = new Map<string, number>();
	posts.value?.forEach((post) => {
		post.tags?.forEach((tag: string) => {
			tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
		});
	});
	return Array.from(tagMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));
});

useSeoMeta({
	title: "All Tags",
	description: "A list of all the topics I've written about in my posts",
});
</script>

<template>
	<h1 class="title mb-6">Tags</h1>
	<ul class="space-y-4">
		<li v-for="[tag, count] in tagsWithCount" :key="tag" class="flex items-center gap-x-2">
			<NuxtLink
				class="link inline-block"
				:to="`/tags/${tag}/`"
				:title="`View posts with the tag: ${tag}`"
			>
				#{{ tag }}
			</NuxtLink>
			<span class="inline-block"> - {{ count }} Post{{ count > 1 ? "s" : "" }} </span>
		</li>
	</ul>
</template>
