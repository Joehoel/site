<template>
  <div class="flex min-h-screen flex-col bg-default font-body text-default antialiased">
    <LayoutHeader />
    <main id="main" class="mx-auto w-full max-w-3xl flex-1 px-4 pt-28 sm:px-8">
      <slot />
    </main>
    <LayoutFooter />
  </div>
</template>
