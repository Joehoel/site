<script setup lang="ts">
const appConfig = useAppConfig() as any;

defineProps<{
	post: {
		_path?: string;
		title: string;
		description?: string;
		publishDate: string | Date;
	};
}>();
</script>

<template>
	<article>
		<NuxtLink :to="post._path" class="group">
			<h3 class="title text-xl group-hover:text-link">{{ post.title }}</h3>
		</NuxtLink>
		<p v-if="post.description" class="mt-1 text-gray-600 dark:text-gray-400">
			{{ post.description }}
		</p>
		<time class="mt-2 block text-sm text-gray-500">
			{{
				new Date(post.publishDate).toLocaleDateString(appConfig.date.locale, appConfig.date.options)
			}}
		</time>
	</article>
</template>
