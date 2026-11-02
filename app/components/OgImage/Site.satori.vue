<script setup lang="ts">
withDefaults(defineProps<{ title?: string }>(), { title: "Joël Kuijper" });
</script>

<template>
  <div
    style="
      display: flex;
      width: 100%;
      height: 100%;
      flex-direction: column;
      justify-content: space-between;
      padding: 72px;
      background: #131313;
      color: #e5e2e1;
      font-family: &quot;Site OG&quot;;
      font-weight: 700;
    "
  >
    <div style="display: flex; font-size: 28px; color: #919191">JOËL KUIJPER / LOG &amp; NOTES</div>
    <div
      :style="{
        display: 'flex',
        fontSize: title.length > 80 ? '56px' : '76px',
        lineHeight: 1.12,
        letterSpacing: '-2px',
        maxWidth: '1056px',
      }"
    >
      {{ title }}
    </div>
    <div style="display: flex; font-size: 26px; border-top: 2px solid #474747; padding-top: 28px">
      joelkuijper.me
    </div>
  </div>
</template>
