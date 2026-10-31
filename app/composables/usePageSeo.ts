import type { MaybeRefOrGetter } from "vue";

export interface PageSeo {
  title: string;
  description?: string;
  image?: string;
  article?: { published: string | Date; modified?: string | Date };
  noindex?: boolean;
}

export function usePageSeo(input: MaybeRefOrGetter<PageSeo>) {
  const route = useRoute();
  const site = useSiteConfig();
  const appConfig = useAppConfig();
  const { seoImages } = useRuntimeConfig().public;
  const page = computed(() => toValue(input));
  const title = computed(() => page.value.title.trim() || appConfig.site.title);
  const description = computed(() => page.value.description?.trim() || appConfig.site.description);
  const canonical = computed(() => new URL(route.path.replace(/\/+$/, "") || "/", site.url).href);
  const image = computed(() => {
    if (!page.value.image) return undefined;
    try {
      const url = new URL(page.value.image, site.url);
      const dimensions = seoImages[decodeURIComponent(url.pathname)];
      if (url.origin !== new URL(site.url).origin || !dimensions) return undefined;
      url.search = "";
      url.hash = "";
      return { url: url.href, ...dimensions };
    } catch {
      return undefined;
    }
  });
  const date = (value?: string | Date) => (value ? new Date(value).toISOString() : undefined);
  useHead(() => ({
    htmlAttrs: { lang: appConfig.site.lang },
    link: [{ rel: "canonical", href: canonical.value }],
  }));
  useSeoMeta({
    title: () =>
      title.value === appConfig.site.title
        ? title.value
        : `${title.value} | ${appConfig.site.title}`,
    description,
    ogTitle: title,
    ogDescription: description,
    ogUrl: canonical,
    ogSiteName: appConfig.site.title,
    ogLocale: appConfig.site.ogLocale,
    ogType: () => (page.value.article ? "article" : "website"),
    twitterCard: "summary_large_image",
    twitterTitle: title,
    twitterDescription: description,
    articlePublishedTime: () => date(page.value.article?.published),
    articleModifiedTime: () => date(page.value.article?.modified),
    robots: () => (page.value.noindex ? "noindex, nofollow" : "index, follow"),
  });
  const nuxt = useNuxtApp();
  const defineImage = () =>
    defineOgImage(
      "Site",
      { title },
      {
        url: computed(() => image.value?.url),
        extension: "png",
        width: computed(() => image.value?.width ?? 1200),
        height: computed(() => image.value?.height ?? 630),
        alt: title,
      },
    );
  defineImage();
  if (import.meta.client) {
    watch([() => route.fullPath, page], () => nuxt.runWithContext(defineImage), { deep: true });
  }
}
