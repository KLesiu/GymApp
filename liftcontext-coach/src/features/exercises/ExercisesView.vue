<script setup lang="ts">
import { computed, ref } from 'vue'
import { useExercisesQuery } from '@/api/queries/domainQueries'
import LcBadge from '@/components/ui/LcBadge.vue'
import LcCard from '@/components/ui/LcCard.vue'
import LcEmptyState from '@/components/ui/LcEmptyState.vue'
import LcErrorState from '@/components/ui/LcErrorState.vue'
import LcInput from '@/components/ui/LcInput.vue'
import LcSkeleton from '@/components/ui/LcSkeleton.vue'

const search = ref('')
const exercises = useExercisesQuery()
const field = (item: unknown, key: string) => item && typeof item === 'object' ? String((item as Record<string, unknown>)[key] ?? (key === 'id' ? (item as Record<string, unknown>)._id : undefined) ?? '—') : '—'
const rows = computed(() => (exercises.data.value ?? []).filter((item) => [field(item, 'name'), field(item, 'bodyPart'), field(item, 'formula')].join(' ').toLowerCase().includes(search.value.toLowerCase())))
const globalCount = computed(() => (exercises.data.value ?? []).filter((item) => field(item, 'isGlobal') === 'true').length)
</script>

<template>
  <section class="grid gap-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p class="font-display text-xs font-bold uppercase tracking-[0.28em] text-contextDark">Exercise library</p>
        <h1 class="mt-2 font-display text-3xl font-bold text-ink">Exercises</h1>
      </div>
    </div>

    <div class="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
      <div class="grid gap-6 border-b border-border bg-gradient-to-br from-surface via-canvas to-surfaceMuted p-6 lg:grid-cols-[1fr_auto] lg:items-start">
        <div>
          <p class="font-display text-xs font-bold uppercase tracking-[0.28em] text-contextDark">Movement catalogue</p>
          <h2 class="mt-3 font-display text-3xl font-bold text-ink">Shared exercise base</h2>
          <p class="mt-2 max-w-3xl text-sm leading-6 text-textMuted">Browse the shared movement library and coach-created exercises used across plans and workout history.</p>
        </div>
        <div class="grid grid-cols-2 gap-3 rounded-xl border border-border bg-surface/80 p-4 text-sm">
          <div><p class="text-textMuted">Available</p><p class="font-display text-2xl font-bold text-contextDark">{{ exercises.data.value?.length ?? 0 }}</p></div>
          <div><p class="text-textMuted">Global</p><p class="font-display text-2xl font-bold text-reference">{{ globalCount }}</p></div>
        </div>
      </div>
      <div class="grid gap-4 p-6 lg:grid-cols-[minmax(280px,520px)_1fr] lg:items-end">
        <LcInput v-model="search" label="Search exercises" />
        <p class="text-sm text-textMuted lg:text-right">Filter by name, body part, or scoring formula.</p>
      </div>
    </div>

    <LcSkeleton v-if="exercises.isLoading.value" />
    <LcErrorState v-else-if="exercises.isError.value" @retry="exercises.refetch()" />
    <LcEmptyState v-else-if="rows.length === 0" title="No exercises found" description="Adjust your search or add a custom exercise from your training workflow." />
    <div v-else class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      <LcCard v-for="exercise in rows" :key="field(exercise, 'id')">
        <div class="flex h-full flex-wrap items-start justify-between gap-3">
          <div>
            <h2 class="font-display text-xl font-bold text-ink">{{ field(exercise, 'name') }}</h2>
            <p class="mt-1 text-sm text-textMuted">{{ field(exercise, 'bodyPart') }}</p>
          </div>
          <LcBadge :tone="field(exercise, 'isGlobal') === 'true' ? 'success' : 'neutral'">{{ field(exercise, 'isGlobal') === 'true' ? 'global' : 'custom' }}</LcBadge>
        </div>
        <div class="mt-4 rounded-lg bg-surfaceMuted px-3 py-2 text-sm font-semibold text-textMuted">Formula: {{ field(exercise, 'formula') }}</div>
      </LcCard>
    </div>
  </section>
</template>
