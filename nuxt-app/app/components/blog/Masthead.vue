<script setup lang="ts">
const appConfig = useAppConfig() as any;

defineProps<{
	post: {
		title: string;
		description?: string;
		publishDate: string | Date;
		updatedDate?: string | Date;
		tags?: string[];
		coverImage?: { src: string; alt: string };
	};
}>();
</script>

<template>
	<header class="mb-8">
		<div v-if="post.coverImage" class="mb-6">
			<NuxtImg
				:src="post.coverImage.src"
				:alt="post.coverImage.alt"
				class="w-full rounded-lg"
				width="768"
				height="432"
			/>
		</div>
		<h1 class="title text-3xl sm:text-4xl">{{ post.title }}</h1>
		<p v-if="post.description" class="mt-2 text-gray-600 dark:text-gray-400">
			{{ post.description }}
		</p>
		<div class="mt-4 flex flex-wrap gap-2 text-sm text-gray-500">
			<time>
				{{
					new Date(post.publishDate).toLocaleDateString(
						appConfig.date.locale,
						appConfig.date.options,
					)
				}}
			</time>
			<span v-if="post.updatedDate">
				(Updated:
				{{
					new Date(post.updatedDate).toLocaleDateString(
						appConfig.date.locale,
						appConfig.date.options,
					)
				}})
			</span>
		</div>
		<div v-if="post.tags?.length" class="mt-4 flex flex-wrap gap-2">
			<NuxtLink
				v-for="tag in post.tags"
				:key="tag"
				:to="`/tags/${tag}`"
				class="rounded bg-gray-100 px-2 py-1 text-sm hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
			>
				{{ tag }}
			</NuxtLink>
		</div>
	</header>
</template>
