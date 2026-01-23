<script setup lang="ts">
const route = useRoute();
const slug = Array.isArray(route.params.slug) ? route.params.slug.join("/") : route.params.slug;

const { data: page } = await useAsyncData(`page-${slug}`, () =>
	queryCollection("pages").where("_stem", "=", slug).first(),
);

if (!page.value) {
	throw createError({ statusCode: 404, message: "Page not found" });
}

useSeoMeta({
	title: page.value.title,
});
</script>

<template>
	<div v-if="page">
		<header class="mb-8">
			<h1 class="title text-3xl">{{ page.title }}</h1>
		</header>
		<ContentRenderer :value="page" class="prose prose-lg max-w-none dark:prose-invert" />
	</div>
</template>
