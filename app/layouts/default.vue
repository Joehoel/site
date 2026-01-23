<template>
	<div
		class="mx-auto flex min-h-screen max-w-3xl flex-col bg-bgColor px-4 pt-16 font-albert font-normal text-textColor antialiased sm:px-8"
	>
		<LayoutHeader />
		<main id="main" class="flex-1">
			<slot />
		</main>
		<LayoutFooter />
	</div>
</template>
