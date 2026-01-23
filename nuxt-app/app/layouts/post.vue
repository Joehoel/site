<script setup lang="ts">
const appConfig = useAppConfig();
</script>

<template>
	<div class="mx-auto flex min-h-screen max-w-3xl flex-col px-4 pt-16 sm:px-8">
		<LayoutHeader />
		<main class="flex-1">
			<article>
				<slot />
			</article>
		</main>
		<LayoutFooter />
	</div>
</template>
