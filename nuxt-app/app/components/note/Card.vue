<script setup lang="ts">
const appConfig = useAppConfig() as any;

defineProps<{
	note: {
		_path?: string;
		title: string;
		description?: string;
		publishDate: string | Date;
	};
}>();
</script>

<template>
	<article class="border-l-2 border-gray-200 pl-4 dark:border-gray-700">
		<NuxtLink :to="note._path" class="group">
			<h3 class="font-semibold group-hover:text-link">{{ note.title }}</h3>
		</NuxtLink>
		<p v-if="note.description" class="mt-1 text-sm text-gray-600 dark:text-gray-400">
			{{ note.description }}
		</p>
		<time class="mt-1 block text-xs text-gray-500">
			{{
				new Date(note.publishDate).toLocaleDateString(appConfig.date.locale, appConfig.date.options)
			}}
		</time>
	</article>
</template>
