<script setup lang="ts">
defineProps<{ title: string; value: string; context?: string; date?: string }>()
</script>
<template><section class="rounded-xl border border-reference bg-reference/20 p-5"><p class="text-xs font-bold uppercase tracking-wide text-warning">Punkt odniesienia</p><h3 class="mt-2 font-display text-xl font-bold">{{ title }}</h3><p class="mt-2 font-display text-3xl font-bold">{{ value }}</p><p v-if="context || date" class="mt-2 text-sm text-textMuted">{{ context }} <span v-if="date">· {{ date }}</span></p></section></template>
