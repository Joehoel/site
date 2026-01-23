<script setup lang="ts">
defineProps<{
	post: {
		slug?: string;
		title: string;
		description?: string;
		publishDate: string | Date;
		updatedDate?: string | Date;
		tags?: string[];
		coverImage?: { src: string; alt: string };
		draft?: boolean;
	};
}>();

const dateTimeOptions: Intl.DateTimeFormatOptions = {
	month: "long",
};
</script>

<template>
	<div v-if="post.coverImage?.src" class="mb-6 aspect-[16/9]">
		<NuxtImg
			class="object-cover"
			fetchpriority="high"
			loading="eager"
			:src="post.coverImage.src"
			:alt="post.coverImage.alt ?? ''"
			width="1200"
			height="675"
		/>
	</div>
	<span v-if="post.draft" class="text-base text-red-500">(Draft)</span>
	<h1 class="title">{{ post.title }}</h1>
	<div class="flex flex-wrap items-center gap-x-3 gap-y-2">
		<p class="font-semibold">
			<time
				:datetime="new Date(post.publishDate).toISOString()"
				:title="new Date(post.publishDate).toISOString()"
			>
				{{ new Date(post.publishDate).toLocaleDateString("nl-NL", dateTimeOptions) }}
			</time>
		</p>
		<span v-if="post.updatedDate" class="rounded-lg bg-quote/5 px-2 py-1 text-quote">
			Updated:
			<time
				:datetime="new Date(post.updatedDate).toISOString()"
				:title="new Date(post.updatedDate).toISOString()"
				class="ms-1"
			>
				{{ new Date(post.updatedDate).toLocaleDateString("nl-NL", dateTimeOptions) }}
			</time>
		</span>
	</div>
	<div v-if="post.tags?.length" class="mt-2">
		<svg
			aria-hidden="true"
			class="inline-block h-6 w-6"
			fill="none"
			focusable="false"
			stroke="currentColor"
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="1.5"
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path d="M0 0h24v24H0z" fill="none" stroke="none" />
			<path
				d="M7.859 6h-2.834a2.025 2.025 0 0 0 -2.025 2.025v2.834c0 .537 .213 1.052 .593 1.432l6.116 6.116a2.025 2.025 0 0 0 2.864 0l2.834 -2.834a2.025 2.025 0 0 0 0 -2.864l-6.117 -6.116a2.025 2.025 0 0 0 -1.431 -.593z"
			/>
			<path d="M17.573 18.407l2.834 -2.834a2.025 2.025 0 0 0 0 -2.864l-7.117 -7.116" />
			<path d="M6 9h-.01" />
		</svg>
		<template v-for="(tag, i) in post.tags" :key="tag">
			<span class="contents">
				<a
					:aria-label="`View more blogs with the tag ${tag}`"
					class="link inline-block before:content-['#']"
					:href="`/tags/${tag}/`"
					>{{ tag }}</a
				><template v-if="i < post.tags.length - 1">, </template>
			</span>
		</template>
	</div>
</template>
