<script setup lang="ts">
import { computed } from 'vue'
import { useRankingQuery } from '@/api/queries/domainQueries'
import LcCard from '@/components/ui/LcCard.vue'
import LcEmptyState from '@/components/ui/LcEmptyState.vue'
import LcErrorState from '@/components/ui/LcErrorState.vue'
const ranking = useRankingQuery()
const rows = computed(() => ranking.data.value ?? [])
const field = (item: unknown, key: string) => item && typeof item === 'object' ? String((item as Record<string, unknown>)[key] ?? '—') : '—'
</script>
<template><section class="grid gap-6"><h1 class="font-display text-3xl font-bold">LiftContext Rating</h1><p class="text-textMuted">Global ranking inspired by Elo. Scores are calculated by the API, not in the browser.</p><LcErrorState v-if="ranking.isError.value" @retry="ranking.refetch()"/><LcEmptyState v-else-if="rows.length === 0" title="No ranking data"/><LcCard v-else><table class="w-full text-left text-sm"><thead><tr class="text-textMuted"><th class="py-2">#</th><th>Name</th><th>Rating</th><th>Rank</th></tr></thead><tbody><tr v-for="(item, index) in rows" :key="field(item, 'id')" class="border-t border-border"><td class="py-2">{{ index + 1 }}</td><td>{{ field(item, 'name') }}</td><td>{{ field(item, 'elo') }}</td><td>{{ field(item, 'profileRank') }}</td></tr></tbody></table></LcCard></section></template>
