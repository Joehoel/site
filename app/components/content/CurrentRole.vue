<script setup lang="ts">
import type { CurrentSelection } from "#shared/career";
import { currentRoleSentence, type HomeIntro } from "#shared/home";

const props = defineProps<{
  selection: CurrentSelection;
  rolePrefix: HomeIntro["rolePrefix"];
  employerPrefix: HomeIntro["employerPrefix"];
}>();
</script>

<template>
  <span>{{ currentRoleSentence(props.selection, props) }}</span>
</template>
