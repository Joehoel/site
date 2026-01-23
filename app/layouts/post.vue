<script setup lang="ts">
const showToTop = ref(false);

const scrollToTop = () => {
  document.documentElement.scrollTo({ behavior: "smooth", top: 0 });
};

onMounted(() => {
  const blogHero = document.getElementById("blog-hero");
  if (!blogHero) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      showToTop.value = !entry.isIntersecting;
    });
  });

  observer.observe(blogHero);

  onUnmounted(() => {
    observer.disconnect();
  });
});
</script>

<template>
  <div
    class="mx-auto flex min-h-screen max-w-3xl flex-col bg-bg-color px-4 pt-16 font-sans font-normal text-text-color antialiased sm:px-8"
  >
    <LayoutHeader />
    <main id="main" class="flex-1">
      <slot />
      <button
        aria-label="Back to Top"
        class="z-90 fixed bottom-8 end-4 flex h-10 w-10 translate-y-28 items-center justify-center rounded-full border-2 border-transparent bg-zinc-200 text-3xl opacity-0 transition-all duration-300 hover:border-link dark:bg-zinc-700 sm:end-8 sm:h-12 sm:w-12"
        :class="{ '!translate-y-0 !opacity-100': showToTop }"
        type="button"
        @click="scrollToTop"
      >
        <svg
          aria-hidden="true"
          class="h-6 w-6"
          fill="none"
          focusable="false"
          stroke="currentColor"
          stroke-width="2"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M4.5 15.75l7.5-7.5 7.5 7.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    </main>
    <LayoutFooter />
  </div>
</template>
