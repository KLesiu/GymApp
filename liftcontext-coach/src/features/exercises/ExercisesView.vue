<script setup lang="ts">
import { computed, ref } from 'vue'
import { useExercisesQuery } from '@/api/queries/domainQueries'
import LcCard from '@/components/ui/LcCard.vue'; import LcEmptyState from '@/components/ui/LcEmptyState.vue'; import LcErrorState from '@/components/ui/LcErrorState.vue'; import LcInput from '@/components/ui/LcInput.vue'; import LcSkeleton from '@/components/ui/LcSkeleton.vue'
const search = ref(''); const exercises = useExercisesQuery(); const rows = computed(() => (exercises.data.value ?? []).filter((item) => JSON.stringify(item).toLowerCase().includes(search.value.toLowerCase())))
</script>
<template><section class="grid gap-6"><div><h1 class="font-display text-3xl font-bold">Exercises</h1><p class="mt-2 text-textMuted">Exercise library available to the signed-in coach.</p></div><LcInput v-model="search" label="Search exercises"/><LcSkeleton v-if="exercises.isLoading.value"/><LcErrorState v-else-if="exercises.isError.value" @retry="exercises.refetch()"/><LcEmptyState v-else-if="rows.length === 0" title="No exercises"/><div v-else class="grid gap-3 md:grid-cols-2"><LcCard v-for="exercise in rows" :key="String((exercise as Record<string, unknown>).id)"><pre class="overflow-auto text-sm">{{ exercise }}</pre></LcCard></div></section></template>
