<script setup lang="ts">
import { formatPartialDate } from "#shared/partial-date";
import { deriveTooling, type Tool } from "#shared/tooling";
import SpecCard from "./SpecCard.vue";
import SpecItem from "./SpecItem.vue";
import SpecSection from "./SpecSection.vue";
import Timestamp from "./Timestamp.vue";

const markdownComponents = { timestamp: Timestamp };
const asOf = useState("tooling-as-of", () => new Date().toISOString().slice(0, 10));
const { data: document, error } = await useAsyncData("tooling", () =>
  queryCollection("tooling").first(),
);
const view = computed(() => (document.value ? deriveTooling(document.value, asOf.value) : null));
const currentGroups = computed(() => {
  const groups = new Map<string, Tool[]>();
  for (const tool of view.value?.current ?? []) {
    const tools = groups.get(tool.category) ?? [];
    tools.push(tool);
    groups.set(tool.category, tools);
  }
  return [...groups].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
});
const states = {
  current: "Current use",
  historical: "Past use",
  future: "Future period",
  unconfirmed: "Current use unconfirmed",
};
const icons: Record<string, string> = {
  Development: "i-lucide-code",
  Terminal: "i-lucide-terminal",
  Browser: "i-lucide-globe",
  Data: "i-lucide-database",
  Productivity: "i-lucide-command",
  Laravel: "i-lucide-feather",
  Apps: "i-lucide-layout-grid",
};
</script>

<template>
  <div class="flex flex-col gap-16">
    <p v-if="error || !view" role="status" class="text-on-surface-variant">
      Tooling history is unavailable. No current setup can be confirmed from this page.
    </p>
    <template v-else>
      <SpecSection heading="Current setup" layout="rows">
        <div class="bg-surface-container-low p-8 text-on-surface-variant">
          <p v-if="view.current.length === 0" class="font-headline text-lg text-highlighted">
            Current setup not confirmed
          </p>
          <p>
            Based on recorded periods as of
            <time :datetime="asOf">{{ formatPartialDate(asOf) }}</time
            >. Unknown endpoints do not establish current use.
          </p>
        </div>
      </SpecSection>

      <SpecSection
        v-for="[category, tools] in currentGroups"
        :key="category"
        :heading="category"
        kicker="Current setup"
        :layout="category === 'Hardware' ? 'rows' : 'grid'"
      >
        <component
          :is="category === 'Hardware' ? SpecItem : SpecCard"
          v-for="tool in tools"
          :key="tool.id"
          :name="tool.name"
          :category="tool.category"
          :icon="icons[category]"
        >
          <p v-if="tool.url">
            <a :href="tool.url">{{ tool.name }} website</a>
          </p>
          <MDC v-slot="{ body, data }" :value="tool.description">
            <ContentRenderer
              v-if="body"
              :value="{ ...data, body }"
              :components="markdownComponents"
            />
          </MDC>
        </component>
      </SpecSection>

      <SpecSection v-if="view.unconfirmed.length" heading="Unconfirmed setup" layout="rows">
        <div class="bg-surface-container-low p-8 text-on-surface-variant">
          <p class="mb-4 font-headline text-lg text-highlighted">
            Previously listed; current use unconfirmed
          </p>
          <ul class="flex flex-wrap gap-x-6 gap-y-2">
            <li v-for="tool in view.unconfirmed" :key="tool.id">
              <a :href="`#tooling-${tool.id}`" class="underline underline-offset-2">{{
                tool.name
              }}</a>
            </li>
          </ul>
          <p class="mt-4">The original descriptions and known periods are preserved below.</p>
        </div>
      </SpecSection>

      <SpecSection heading="Usage history" kicker="Known dates, honest gaps" layout="rows">
        <p v-if="view.timeline.length === 0" class="p-8 text-on-surface-variant">
          No usage periods recorded.
        </p>
        <ol class="flex flex-col gap-px">
          <li v-for="entry in view.timeline" :key="`${entry.tool.id}-${entry.index}`">
            <SpecItem
              :id="
                entry.tool.periods.length === 1 || entry.index === 0
                  ? `tooling-${entry.tool.id}`
                  : undefined
              "
              :name="entry.tool.name"
              :label="entry.tool.category"
              :status="states[entry.state]"
            >
              <p class="mb-3!">
                <template v-if="entry.period.start !== null">
                  From
                  <time :datetime="entry.period.start">{{
                    formatPartialDate(entry.period.start)
                  }}</time
                  >.
                </template>
                <template v-else>Start date unknown.</template>
                <template v-if="entry.period.end.kind === 'unknown'"> End status unknown.</template>
                <template v-else-if="entry.period.end.kind === 'ongoing'">
                  Recorded as ongoing. Last confirmed
                  <time :datetime="entry.period.end.verifiedOn">{{
                    formatPartialDate(entry.period.end.verifiedOn)
                  }}</time
                  >.
                  <template v-if="entry.period.end.verifiedOn > asOf"
                    >Not yet confirmed as of this reference day.</template
                  >
                </template>
                <template v-else-if="entry.period.end.date !== null">
                  End date
                  <time :datetime="entry.period.end.date">{{
                    formatPartialDate(entry.period.end.date)
                  }}</time
                  >.
                </template>
                <template v-else> Use ended; end date unknown.</template>
              </p>
              <p v-if="entry.tool.url" class="mb-3!">
                <a :href="entry.tool.url">{{ entry.tool.name }} website</a>
              </p>
              <p class="mb-2! font-label text-xs uppercase tracking-wide">
                Preserved tool description
              </p>
              <MDC v-slot="{ body, data }" :value="entry.tool.description">
                <ContentRenderer
                  v-if="body"
                  :value="{ ...data, body }"
                  :components="markdownComponents"
                />
              </MDC>
              <div v-if="entry.period.context" class="mt-3">
                <MDC v-slot="{ body, data }" :value="entry.period.context">
                  <ContentRenderer
                    v-if="body"
                    :value="{ ...data, body }"
                    :components="markdownComponents"
                  />
                </MDC>
              </div>
            </SpecItem>
          </li>
        </ol>
      </SpecSection>
    </template>
  </div>
</template>
