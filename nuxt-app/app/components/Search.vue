<script setup lang="ts">
const isOpen = ref(false);
const dialogRef = ref<HTMLDialogElement | null>(null);
const dialogFrameRef = ref<HTMLDivElement | null>(null);
const searchInputRef = ref<HTMLInputElement | null>(null);

const openModal = () => {
	isOpen.value = true;
	nextTick(() => {
		dialogRef.value?.showModal();
		// Focus the Pagefind input if it exists
		const input = document.querySelector("#pagefind-search input") as HTMLInputElement | null;
		input?.focus();
	});
};

const closeModal = () => {
	if (dialogRef.value?.open) {
		dialogRef.value.close();
		isOpen.value = false;
	}
};

const onWindowClick = (event: MouseEvent) => {
	const target = event.target as HTMLElement;
	// Check if it's a link
	const isLink = target.tagName === "A";
	// Make sure the click is either a link or outside of the dialog
	if (isLink || (document.body.contains(target) && !dialogFrameRef.value?.contains(target))) {
		closeModal();
	}
};

const onKeydown = (event: KeyboardEvent) => {
	// Open search with "/" key
	if (event.key === "/" && !isOpen.value) {
		event.preventDefault();
		openModal();
	}
	// Close with Escape
	if (event.key === "Escape" && isOpen.value) {
		closeModal();
	}
};

// Initialize Pagefind UI when modal opens (production only)
const initPagefind = async () => {
	if (import.meta.env.DEV) return;

	const { PagefindUI } = await import("@pagefind/default-ui");
	new PagefindUI({
		element: "#pagefind-search",
		showImages: false,
		showSubResults: true,
	});
};

watch(isOpen, async (newVal) => {
	if (newVal) {
		window.addEventListener("click", onWindowClick);
		await nextTick();
		await initPagefind();
	} else {
		window.removeEventListener("click", onWindowClick);
	}
});

onMounted(() => {
	window.addEventListener("keydown", onKeydown);
});

onUnmounted(() => {
	window.removeEventListener("keydown", onKeydown);
	window.removeEventListener("click", onWindowClick);
});
</script>

<template>
	<div class="ms-auto">
		<button
			class="flex h-9 w-9 items-center justify-center rounded-md hover:text-accent"
			type="button"
			aria-label="Search"
			@click="openModal"
		>
			<svg
				aria-hidden="true"
				class="h-7 w-7"
				fill="none"
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="1.5"
				viewBox="0 0 24 24"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path d="M0 0h24v24H0z" stroke="none" />
				<path d="M3 10a7 7 0 1 0 14 0 7 7 0 1 0-14 0M21 21l-6-6" />
			</svg>
		</button>

		<Teleport to="body">
			<dialog
				ref="dialogRef"
				aria-label="search"
				class="h-full max-h-full w-full max-w-full border border-zinc-400 bg-bgColor shadow backdrop:backdrop-blur sm:mx-auto sm:mb-auto sm:mt-16 sm:h-max sm:max-h-[calc(100%-8rem)] sm:min-h-[15rem] sm:w-5/6 sm:max-w-[48rem] sm:rounded-md"
			>
				<div ref="dialogFrameRef" class="dialog-frame flex flex-col gap-4 p-6 pt-12 sm:pt-6">
					<button
						class="ms-auto cursor-pointer rounded-md bg-zinc-200 p-2 font-semibold dark:bg-zinc-700"
						type="button"
						@click="closeModal"
					>
						Close
					</button>
					<div v-if="$config.public.dev" class="mx-auto text-center">
						<p>
							Search is only available in production builds.<br />
							Try building and previewing the site to test it out locally.
						</p>
					</div>
					<div v-else class="search-container">
						<div id="pagefind-search" />
					</div>
				</div>
			</dialog>
		</Teleport>
	</div>
</template>

<style>
@import "@pagefind/default-ui/css/ui.css";

:root {
	--pagefind-ui-font: inherit;
}

#pagefind-search {
	--pagefind-ui-primary: theme("colors.accent");
	--pagefind-ui-text: theme("colors.textColor");
	--pagefind-ui-background: theme("colors.bgColor");
	--pagefind-ui-border: theme("colors.zinc.400");
	--pagefind-ui-border-width: 1px;
}

#pagefind-search .pagefind-ui__search-clear {
	width: calc(60px * var(--pagefind-ui-scale));
	padding: 0;
	background-color: transparent;
	overflow: hidden;
}

#pagefind-search .pagefind-ui__search-clear:focus {
	outline: 1px solid theme("colors.accent-2");
}

#pagefind-search .pagefind-ui__search-clear::before {
	content: "";
	-webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='currentColor' %3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M6 18L18 6M6 6l12 12'%3E%3C/path%3E%3C/svg%3E")
		center / 60% no-repeat;
	mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='currentColor' %3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M6 18L18 6M6 6l12 12'%3E%3C/path%3E%3C/svg%3E")
		center / 60% no-repeat;
	background-color: theme("colors.accent");
	display: block;
	width: 100%;
	height: 100%;
}

#pagefind-search .pagefind-ui__result {
	border: 0;
}

#pagefind-search .pagefind-ui__result-link {
	background-size: 100% 6px;
	background-position: bottom;
	background-repeat: repeat-x;
	background-image: linear-gradient(
		transparent,
		transparent 5px,
		theme("colors.textColor") 5px,
		theme("colors.textColor")
	);
}

#pagefind-search .pagefind-ui__result-link:hover {
	text-decoration: none;
	background-image: linear-gradient(
		transparent,
		transparent 4px,
		theme("colors.link") 4px,
		theme("colors.link")
	);
}

#pagefind-search mark {
	color: theme("colors.quote");
	background-color: transparent;
	font-weight: 600;
}
</style>
