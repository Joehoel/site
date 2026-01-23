<script setup lang="ts">
const appConfig = useAppConfig();
const colorMode = useColorMode();
const route = useRoute();
const menuOpen = ref(false);

const toggleTheme = () => {
	colorMode.preference = colorMode.value === "dark" ? "light" : "dark";
};

const toggleMenu = () => {
	menuOpen.value = !menuOpen.value;
};
</script>

<template>
	<header
		id="main-header"
		class="group relative mb-28 flex items-center sm:ps-[4.5rem]"
		:class="{ 'menu-open': menuOpen }"
	>
		<div class="flex sm:flex-col">
			<NuxtLink
				to="/"
				:aria-current="route.path === '/' ? 'page' : undefined"
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
				<span class="text-xl font-bold sm:text-2xl">Joël Kuijper</span>
			</NuxtLink>
			<nav
				id="navigation-menu"
				aria-label="Main menu"
				class="absolute -inset-x-4 top-14 hidden flex-col items-end gap-y-4 rounded-md bg-bgColor/[.85] py-4 text-accent shadow backdrop-blur group-[.menu-open]:z-50 group-[.menu-open]:flex sm:static sm:z-auto sm:-ms-4 sm:mt-1 sm:flex sm:flex-row sm:items-center sm:rounded-none sm:bg-transparent sm:py-0 sm:shadow-none sm:backdrop-blur-none"
			>
				<template v-for="(link, index) in appConfig.navigation" :key="link.url">
					<span v-if="index > 0">×</span>
					<NuxtLink
						:to="link.url"
						:aria-current="route.path === link.url ? 'page' : undefined"
						class="px-4 py-4 underline-offset-2 sm:py-0 sm:hover:underline"
					>
						{{ link.label }}
					</NuxtLink>
				</template>
			</nav>
		</div>
		<!-- Theme Toggle -->
		<div class="ms-2 sm:ms-4">
			<button
				class="relative h-9 w-9 rounded-md p-2 hover:text-accent"
				type="button"
				role="switch"
				:aria-checked="colorMode.value === 'dark'"
				aria-label="Toggle theme"
				@click="toggleTheme"
			>
				<span class="sr-only">Dark Theme</span>
				<svg
					aria-hidden="true"
					class="absolute start-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 scale-100 opacity-100 transition-all dark:scale-0 dark:opacity-0"
					fill="none"
					focusable="false"
					stroke-width="1.5"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18Z"
						stroke="currentColor"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
					<path
						d="M22 12L23 12"
						stroke="currentColor"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
					<path d="M12 2V1" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
					<path
						d="M12 23V22"
						stroke="currentColor"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
					<path
						d="M20 20L19 19"
						stroke="currentColor"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
					<path
						d="M20 4L19 5"
						stroke="currentColor"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
					<path
						d="M4 20L5 19"
						stroke="currentColor"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
					<path d="M4 4L5 5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
					<path
						d="M1 12L2 12"
						stroke="currentColor"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
				<svg
					aria-hidden="true"
					class="absolute start-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 scale-0 opacity-0 transition-all dark:scale-100 dark:opacity-100"
					fill="none"
					focusable="false"
					stroke="currentColor"
					stroke-width="1.5"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path d="M0 0h24v24H0z" fill="none" stroke="none" />
					<path
						d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z"
					/>
					<path d="M17 4a2 2 0 0 0 2 2a2 2 0 0 0 -2 2a2 2 0 0 0 -2 -2a2 2 0 0 0 2 -2" />
					<path d="M19 11h2m-1 -1v2" />
				</svg>
			</button>
		</div>
		<!-- Mobile Menu Button -->
		<button
			:aria-expanded="menuOpen"
			aria-haspopup="menu"
			aria-label="Open main menu"
			class="group relative ms-4 h-7 w-7 sm:invisible sm:hidden"
			type="button"
			@click="toggleMenu"
		>
			<svg
				aria-hidden="true"
				class="absolute start-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 transition-all"
				:class="{ 'scale-0 opacity-0': menuOpen }"
				fill="none"
				focusable="false"
				stroke="currentColor"
				stroke-width="1.5"
				viewBox="0 0 24 24"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path d="M3.75 9h16.5m-16.5 6.75h16.5" stroke-linecap="round" stroke-linejoin="round" />
			</svg>
			<svg
				aria-hidden="true"
				class="absolute start-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 scale-0 text-accent opacity-0 transition-all"
				:class="{ 'scale-100 opacity-100': menuOpen }"
				fill="none"
				focusable="false"
				stroke="currentColor"
				stroke-width="1.5"
				viewBox="0 0 24 24"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path d="M6 18L18 6M6 6l12 12" stroke-linecap="round" stroke-linejoin="round" />
			</svg>
		</button>
	</header>
</template>
