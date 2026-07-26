<script setup lang="ts">
import { computed } from 'vue'
import { useMuscleGroupsQuery } from '@/api/queries/domainQueries'
import LcCard from '@/components/ui/LcCard.vue'
import LcEmptyState from '@/components/ui/LcEmptyState.vue'
const groups = useMuscleGroupsQuery()
const rows = computed(() => groups.data.value ?? [])
const field = (item: unknown, key: string) => item && typeof item === 'object' ? String((item as Record<string, unknown>)[key] ?? '—') : '—'
</script>
<template><section class="grid gap-6"><h1 class="font-display text-3xl font-bold">Muscle groups</h1><LcEmptyState v-if="rows.length === 0" title="No muscle groups"/><div v-else class="grid gap-3 md:grid-cols-2"><LcCard v-for="group in rows" :key="field(group, 'id')"><h2 class="font-display text-lg font-bold">{{ field(group, 'name') }}</h2><p class="text-sm text-textMuted">Region: {{ field(group, 'region') }}</p></LcCard></div></section></template>
