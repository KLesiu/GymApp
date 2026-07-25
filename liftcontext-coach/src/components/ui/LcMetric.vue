<script setup lang="ts">
import LcCard from './LcCard.vue'

defineProps<{ label: string; value: string | number; hint?: string; unavailable?: boolean }>()
</script>
<template><LcCard><p class="text-sm font-semibold text-textMuted">{{ label }}</p><p class="mt-2 font-display text-3xl font-bold" :class="{ 'text-textMuted': unavailable }">{{ value }}</p><p v-if="hint" class="mt-1 text-sm text-textMuted">{{ hint }}</p></LcCard></template>
