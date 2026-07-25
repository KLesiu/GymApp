<script setup lang="ts">
import type { ChartPoint } from '@/api/adapters/viewModels'
import LcCard from './LcCard.vue'

defineProps<{ title: string; points: ChartPoint[]; summary: string }>()
</script>
<template><LcCard><h3 class="font-display text-lg font-bold">{{ title }}</h3><div class="mt-4 flex h-32 items-end gap-2" role="img" :aria-label="summary"><span v-for="point in points" :key="`${point.label}-${point.value}`" class="min-h-2 flex-1 rounded-t bg-context" :style="{ height: `${Math.max(8, Math.min(100, point.value))}%` }" :title="`${point.label}: ${point.value}`" /></div><p class="mt-3 text-sm text-textMuted">{{ summary }}</p></LcCard></template>
