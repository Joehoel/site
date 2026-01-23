<script setup lang="ts">
const route = useRoute();
const slug = Array.isArray(route.params.slug) ? route.params.slug.join("/") : route.params.slug;

const { data: post } = await useAsyncData(`post-${slug}`, () =>
	queryCollection("posts").where("_stem", "=", slug).first(),
);

if (!post.value) {
	throw createError({ statusCode: 404, message: "Post not found" });
}

useSeoMeta({
	title: post.value.title,
	description: post.value.description,
	ogTitle: post.value.title,
	ogDescription: post.value.description,
});

definePageMeta({
	layout: "post",
});
</script>

<template>
	<div v-if="post">
		<BlogMasthead :post="post" />
		<ContentRenderer :value="post" class="prose prose-lg max-w-none dark:prose-invert" />
	</div>
</template>
