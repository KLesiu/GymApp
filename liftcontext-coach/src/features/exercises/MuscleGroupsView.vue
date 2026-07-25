<script setup lang="ts">
import { useMuscleGroupsQuery } from '@/api/queries/domainQueries'
import LcCard from '@/components/ui/LcCard.vue'; import LcEmptyState from '@/components/ui/LcEmptyState.vue'
const groups = useMuscleGroupsQuery()
</script>
<template><section class="grid gap-6"><h1 class="font-display text-3xl font-bold">Muscle groups</h1><LcEmptyState v-if="(groups.data.value ?? []).length === 0" title="No muscle groups"/><div v-else class="grid gap-3 md:grid-cols-2"><LcCard v-for="group in groups.data.value" :key="String((group as Record<string, unknown>).id)"><pre class="overflow-auto text-sm">{{ group }}</pre></LcCard></div></section></template>
