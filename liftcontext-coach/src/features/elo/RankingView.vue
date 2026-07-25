<script setup lang="ts">
import { useRankingQuery } from '@/api/queries/domainQueries'
import LcCard from '@/components/ui/LcCard.vue'; import LcEmptyState from '@/components/ui/LcEmptyState.vue'; import LcErrorState from '@/components/ui/LcErrorState.vue'
const ranking = useRankingQuery()
</script>
<template><section class="grid gap-6"><h1 class="font-display text-3xl font-bold">Ranking</h1><p class="text-textMuted">Global ranking is shown only because `/api/v1/ranking` exists in the current OpenAPI.</p><LcErrorState v-if="ranking.isError.value" @retry="ranking.refetch()"/><LcEmptyState v-else-if="(ranking.data.value ?? []).length === 0" title="No ranking data"/><LcCard v-for="item in ranking.data.value ?? []" v-else :key="JSON.stringify(item)"><pre class="overflow-auto text-sm">{{ item }}</pre></LcCard></section></template>
