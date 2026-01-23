<script setup lang="ts">
const route = useRoute();

const { data: post } = await useAsyncData(route.path, () =>
	queryCollection("posts").path(route.path).first(),
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
	<div v-if="post" class="gap-x-10 lg:flex lg:items-start">
		<article class="flex-grow break-words" data-pagefind-body>
			<div id="blog-hero">
				<BlogMasthead :post="post" />
			</div>
			<div
				class="prose prose-sm prose-joel mt-12 prose-headings:font-semibold prose-headings:text-accent-2 prose-headings:before:absolute prose-headings:before:-ms-4 prose-headings:before:text-accent sm:prose-headings:before:content-['#'] sm:prose-th:before:content-none"
			>
				<ContentRenderer :value="post" />
			</div>
		</article>
	</div>
</template>
