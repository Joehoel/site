<script setup lang="ts">
const appConfig = useAppConfig();

defineProps<{
	post: {
		path?: string;
		title: string;
		description?: string;
		publishDate: string | Date;
		draft?: boolean;
	};
	withDesc?: boolean;
}>();
</script>

<template>
	<time
		:datetime="new Date(post.publishDate).toISOString()"
		:title="new Date(post.publishDate).toISOString()"
		class="min-w-[120px] font-semibold text-gray-600 dark:text-gray-400"
	>
		{{
			new Date(post.publishDate).toLocaleDateString(appConfig.date.locale, appConfig.date.options)
		}}
	</time>
	<div>
		<span v-if="post.draft" class="text-red-500">(Draft) </span>
		<NuxtLink :to="post.path" class="link">
			{{ post.title }}
		</NuxtLink>
	</div>
	<q v-if="withDesc && post.description" class="line-clamp-3 italic">{{ post.description }}</q>
</template>
