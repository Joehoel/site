<script setup lang="ts">
const appConfig = useAppConfig();
const year = new Date().getFullYear();
</script>

<template>
	<footer
		class="mt-auto flex w-full flex-col items-center justify-center gap-y-2 pb-4 pt-20 text-center align-top font-semibold text-gray-600 dark:text-gray-400 sm:flex-row sm:justify-between sm:text-xs"
	>
		<div class="me-0 sm:me-4">&copy; {{ appConfig.site.author }} {{ year }}</div>
		<nav aria-label="More on this site" class="flex gap-x-2 sm:gap-x-0">
			<template v-for="(link, index) in appConfig.navigation" :key="link.url">
				<span v-if="index > 0">×</span>
				<NuxtLink
					:to="link.url"
					class="px-4 py-2 sm:py-0 sm:hover:text-textColor sm:hover:underline"
				>
					{{ link.label }}
				</NuxtLink>
			</template>
		</nav>
	</footer>
</template>
