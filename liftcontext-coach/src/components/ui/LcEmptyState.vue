<script setup lang="ts">
defineProps<{ title: string; description?: string }>()
</script>
<template><div class="rounded-xl border border-dashed border-border bg-surfaceMuted p-8 text-center"><h3 class="font-display text-lg font-bold">{{ title }}</h3><p v-if="description" class="mt-2 text-sm text-textMuted">{{ description }}</p><div class="mt-4"><slot /></div></div></template>
