<template>
  <div
    class="mx-auto flex min-h-screen max-w-3xl flex-col bg-bg-color px-4 pt-16 font-sans font-normal text-text-color antialiased sm:px-8"
  >
    <LayoutHeader />
    <main id="main" class="flex-1">
      <slot />
    </main>
    <LayoutFooter />
  </div>
</template>
