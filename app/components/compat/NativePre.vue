<script setup lang="ts">
import type { ElementNode } from "comark";
import { textContent } from "comark/utils";
import OriginalPre from "../content/ProsePre.vue";

defineOptions({ inheritAttrs: false });
const props = defineProps<{
  __node?: ElementNode;
  language?: string;
  filename?: string;
  highlights?: number[];
  meta?: string;
  class?: string;
}>();
const extracted = computed(() => props.__node ? textContent(props.__node) : "");
</script>

<template>
  <OriginalPre
    :code="extracted"
    :language="language"
    :filename="filename"
    :highlights="highlights"
    :meta="meta"
    :class="props.class"
    data-native-pre
  ><slot /></OriginalPre>
</template>
