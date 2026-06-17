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

const isActive = (url: string) =>
  url === "/" ? route.path === "/" : route.path === url || route.path.startsWith(`${url}/`);

// Close the mobile menu on navigation.
watch(
  () => route.path,
  () => {
    menuOpen.value = false;
  },
);
</script>

<template>
  <header
    id="main-header"
    class="fixed inset-x-0 top-0 z-50 border-b border-outline-variant bg-surface/70 backdrop-blur-xl"
  >
    <div class="mx-auto flex h-16 max-w-3xl items-center justify-between px-4 sm:px-8">
      <!-- Wordmark -->
      <NuxtLink
        to="/"
        :aria-current="route.path === '/' ? 'page' : undefined"
        class="font-headline text-lg font-bold tracking-tight text-highlighted transition-opacity hover:opacity-80"
      >
        JK<span class="text-outline">//</span>DEV
      </NuxtLink>

      <!-- Desktop nav -->
      <nav
        aria-label="Main menu"
        class="hidden items-center gap-x-8 font-label text-[0.8125rem] uppercase tracking-[0.1em] sm:flex"
      >
        <NuxtLink
          v-for="link in appConfig.navigation"
          :key="link.url"
          :to="link.url"
          :aria-current="isActive(link.url) ? 'page' : undefined"
          class="border-b pb-1 transition-colors"
          :class="
            isActive(link.url)
              ? 'border-on-surface text-highlighted'
              : 'border-transparent text-outline hover:text-on-surface'
          "
        >
          {{ link.label }}
        </NuxtLink>
      </nav>

      <!-- Actions -->
      <div class="flex items-center gap-x-1">
        <Search />

        <!-- Theme toggle -->
        <button
          class="relative flex h-9 w-9 items-center justify-center text-outline transition-colors hover:text-highlighted"
          type="button"
          role="switch"
          :aria-checked="colorMode.value === 'dark'"
          aria-label="Toggle theme"
          @click="toggleTheme"
        >
          <span class="sr-only">Toggle theme</span>
          <UIcon
            :name="colorMode.value === 'dark' ? 'i-lucide-moon' : 'i-lucide-sun'"
            class="size-5"
          />
        </button>

        <!-- Mobile menu button -->
        <button
          :aria-expanded="menuOpen"
          aria-haspopup="menu"
          aria-label="Open main menu"
          class="flex h-9 w-9 items-center justify-center text-outline transition-colors hover:text-highlighted sm:hidden"
          type="button"
          @click="toggleMenu"
        >
          <UIcon :name="menuOpen ? 'i-lucide-x' : 'i-lucide-menu'" class="size-5" />
        </button>
      </div>
    </div>

    <!-- Mobile nav -->
    <nav
      v-show="menuOpen"
      aria-label="Mobile menu"
      class="border-t border-outline-variant bg-surface/95 backdrop-blur-xl sm:hidden"
    >
      <div class="mx-auto flex max-w-3xl flex-col px-4 py-2 sm:px-8">
        <NuxtLink
          v-for="link in appConfig.navigation"
          :key="link.url"
          :to="link.url"
          :aria-current="isActive(link.url) ? 'page' : undefined"
          class="py-3 font-label text-sm uppercase tracking-[0.1em] transition-colors"
          :class="isActive(link.url) ? 'text-highlighted' : 'text-outline hover:text-on-surface'"
        >
          {{ link.label }}
        </NuxtLink>
      </div>
    </nav>
  </header>
</template>

<style scoped>
header {
  view-transition-name: header;
}
</style>
