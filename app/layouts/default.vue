<template>
  <div class="flex min-h-screen flex-col bg-default font-body text-default antialiased">
    <LayoutHeader />
    <main id="main" class="mx-auto w-full max-w-[1800px] flex-1 px-6 pt-28 sm:px-8 lg:px-12">
      <slot />
    </main>
    <LayoutFooter />
  </div>
</template>
