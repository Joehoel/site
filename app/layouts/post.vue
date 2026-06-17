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
  <div class="flex min-h-screen flex-col bg-default font-body text-default antialiased">
    <LayoutHeader />
    <main id="main" class="mx-auto w-full max-w-7xl flex-1 px-6 pt-28 sm:px-8">
      <slot />
      <button
        aria-label="Back to Top"
        class="z-90 fixed bottom-8 end-4 flex h-10 w-10 translate-y-28 items-center justify-center border border-outline-variant bg-surface-container-high text-3xl text-on-surface opacity-0 transition-all duration-300 hover:border-outline hover:text-highlighted sm:end-8 sm:h-12 sm:w-12"
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
