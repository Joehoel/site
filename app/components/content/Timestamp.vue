<script setup lang="ts">
const appConfig = useAppConfig();

const props = defineProps<{
  date: string;
}>();

const parsedDate = computed(() => {
  const dateStr = props.date;
  // Handle YYYY-MM-DD format to avoid timezone issues
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
  }
  return new Date(dateStr);
});

const formattedDate = computed(() =>
  parsedDate.value.toLocaleDateString(appConfig.date.locale, appConfig.date.options),
);

const datetimeAttr = computed(() => {
  // For date-only inputs, use the original string to avoid timezone drift
  if (/^\d{4}-\d{2}-\d{2}$/.test(props.date)) {
    return props.date;
  }
  return parsedDate.value.toISOString();
});
</script>

<template>
  <time :datetime="datetimeAttr" :title="datetimeAttr">{{ formattedDate }}</time>
</template>
