<script setup lang="ts">
import { MarkdownDocument } from "@comark/vue";
import { Binding } from "@comark/vue/plugins/binding";
import {
  SpecHero, SpecSection, SpecItem, SpecCard, Timestamp, ProseCallout, ProsePre,
  ProseA, ProseP, ProseH1, ProseH2, ProseH3, ProseH4, ProseH5, ProseH6,
  ProseImg, ProseCode, ProseUl, ProseOl, ProseLi, ProseStrong, ProseEm,
  ProseBlockquote, ProseHr, ProseTable, ProseThead, ProseTbody, ProseTr, ProseTh, ProseTd,
} from "#components";
import NativePre from "../../components/compat/NativePre.vue";
import CurrentRoleProbe from "../../components/compat/CurrentRoleProbe.vue";
import SlotProbe from "../../components/compat/SlotProbe.vue";
import { issue87Fixtures, issue87Renderers } from "#shared/issue87";

const route = useRoute();
const fixtureKey = computed(() => String(route.query.fixture || "uses") as keyof typeof issue87Fixtures);
const renderer = computed(() => String(route.query.renderer || "baseline") as keyof typeof issue87Renderers);
const fixture = computed(() => issue87Fixtures[fixtureKey.value]);
if (!fixture.value || !issue87Renderers[renderer.value]) throw createError({ statusCode: 400 });
const { data: probe } = await useFetch("/api/__compat/comark", { query: { fixture: fixtureKey } });
const { data: page } = await useAsyncData(`issue87-${fixtureKey.value}`, async () => {
  const value = fixture.value;
  if (!value.collection) return probe.value?.syntheticLegacy;
  return queryCollection(value.collection).path(value.path).first();
}, { watch: [fixtureKey] });
const bridge = computed(() => {
  const document = page.value;
  if (!document || document.body?.type !== "minimark") throw createError({ statusCode: 422, message: "Probe requires compressed Content v3 input" });
  const { title, description, publishDate, probeLabel } = document;
  return { nodes: document.body.value, frontmatter: { title, description, publishDate, probeLabel }, meta: { toc: document.body.toc } };
});
const components = {
  SpecHero, SpecSection, SpecItem, SpecCard, Timestamp, ProseCallout, ProsePre,
  ProseA, ProseP, ProseH1, ProseH2, ProseH3, ProseH4, ProseH5, ProseH6,
  ProseImg, ProseCode, ProseUl, ProseOl, ProseLi, ProseStrong, ProseEm,
  ProseBlockquote, ProseHr, ProseTable, ProseThead, ProseTbody, ProseTr, ProseTh, ProseTd,
  CurrentRoleProbe, SlotProbe,
};
const nativeComponents = { ...components, ProsePre: NativePre, Binding };
const renderData = { runtimeLabel: "SYNTHETIC RUNTIME" };
const hydrated = ref(false);
onMounted(() => { hydrated.value = true; });
const wrapperClass = computed(() => fixtureKey.value === "uses" ? "flex flex-col gap-24 md:gap-32" : "prose max-w-none");
</script>

<template>
  <div data-issue87-probe :data-hydrated="hydrated" :data-fixture="fixtureKey" :data-renderer="renderer">
    <header class="mb-12 space-y-4 border-b pb-6">
      <h1>Throwaway issue 87 renderer compatibility probe</h1>
      <p>No production migration. Synthetic labels are not personal role claims.</p>
      <nav aria-label="Fixture switcher" class="flex flex-wrap gap-4">
        <a v-for="(_, key) in issue87Fixtures" :key="key" :href="`?fixture=${key}&renderer=${renderer}`">{{ key }}</a>
      </nav>
      <nav aria-label="Renderer switcher" class="flex flex-col gap-2">
        <a v-for="(label, key) in issue87Renderers" :key="key" :href="`?fixture=${fixtureKey}&renderer=${key}`">{{ label }}</a>
      </nav>
      <p data-renderer-label>{{ issue87Renderers[renderer] }}</p>
    </header>
    <div data-probe-output>
      <ContentRenderer v-if="renderer === 'baseline' && page" :value="page" :components="components" :data="renderData" :class="wrapperClass" />
      <MarkdownDocument v-else-if="renderer === 'bridge'" :value="bridge" :components="components" :data="renderData" :class="wrapperClass" />
      <MarkdownDocument v-else-if="renderer === 'native' && probe" :value="probe.native" :components="nativeComponents" :data="renderData" :class="wrapperClass" />
    </div>
    <details class="mt-12">
      <summary>Observed input and TOC</summary>
      <pre data-probe-metadata class="overflow-auto">{{ JSON.stringify({ type: page?.body?.type, frontmatter: bridge.frontmatter, legacyToc: bridge.meta.toc, nativeToc: probe?.native.meta.toc }, null, 2) }}</pre>
    </details>
  </div>
</template>
