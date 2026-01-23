<script setup lang="ts">
const appConfig = useAppConfig();
const colorMode = useColorMode();

const toggleTheme = () => {
	colorMode.preference = colorMode.value === "dark" ? "light" : "dark";
};
</script>

<template>
	<header class="group relative mb-28 flex items-center sm:ps-[4.5rem]">
		<div class="flex sm:flex-col">
			<NuxtLink
				to="/"
				class="inline-flex items-center grayscale hover:filter-none sm:relative sm:inline-block"
			>
				<svg
					aria-hidden="true"
					class="me-3 h-10 w-6 sm:absolute sm:start-[-4.5rem] sm:me-0 sm:h-20 sm:w-12"
					fill="none"
					focusable="false"
					viewBox="0 0 272 480"
					xmlns="http://www.w3.org/2000/svg"
				>
					<title>Logo</title>
					<path
						d="M181.334 93.333v-40L226.667 80v40l-45.333-26.667ZM136.001 53.333 90.667 26.667v426.666L136.001 480V53.333Z"
						fill="#B04304"
					/>
					<path
						d="m136.001 119.944 45.333-26.667 45.333 26.667-45.333 26.667-45.333-26.667ZM90.667 26.667 136.001 0l45.333 26.667-45.333 26.666-45.334-26.666ZM181.334 53.277l45.333-26.666L272 53.277l-45.333 26.667-45.333-26.667ZM0 213.277l45.333-26.667 45.334 26.667-45.334 26.667L0 213.277ZM136 239.944l-45.333-26.667v53.333L136 239.944Z"
						fill="#FF5D01"
					/>
					<path
						d="m136 53.333 45.333-26.666v120L226.667 120V80L272 53.333V160l-90.667 53.333v240L136 480V306.667L45.334 360V240l45.333-26.667v53.334L136 240V53.333Z"
						fill="#53C68C"
					/>
					<path d="M45.334 240 0 213.334v120L45.334 360V240Z" fill="#B04304" />
				</svg>
				<span class="text-xl font-bold sm:text-2xl">{{
					appConfig.site?.author ?? "Joel Kuijper"
				}}</span>
			</NuxtLink>
			<nav aria-label="Main menu" class="mt-1 hidden sm:-ms-4 sm:flex sm:flex-row sm:items-center">
				<template v-for="(link, index) in appConfig.navigation ?? []" :key="link.url">
					<span v-if="index > 0" class="text-gray-400">×</span>
					<NuxtLink :to="link.url" class="px-4 py-4 underline-offset-2 sm:py-0 sm:hover:underline">
						{{ link.label }}
					</NuxtLink>
				</template>
			</nav>
		</div>
		<div class="ms-auto flex items-center gap-2">
			<button @click="toggleTheme" class="p-2 hover:text-accent" aria-label="Toggle theme">
				<Icon v-if="colorMode.value === 'dark'" name="mdi:sun" class="h-6 w-6" />
				<Icon v-else name="mdi:moon" class="h-6 w-6" />
			</button>
		</div>
	</header>
</template>
