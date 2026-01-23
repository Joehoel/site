<script setup lang="ts">
const appConfig = useAppConfig() as any;

const { data: posts } = await useAsyncData("all-posts", () =>
	queryCollection("posts").where("draft", "=", false).order("publishDate", "DESC").all(),
);

useSeoMeta({
	title: `Posts | ${appConfig.site.title}`,
	description: "All blog posts",
});
</script>

<template>
	<div>
		<h1 class="title mb-8 text-3xl">All Posts</h1>
		<div class="space-y-8">
			<BlogPostPreview v-for="post in posts" :key="post._path" :post="post" />
		</div>
	</div>
</template>
