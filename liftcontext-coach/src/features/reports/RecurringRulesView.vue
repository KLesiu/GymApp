<script setup lang="ts">
import { usePauseRule, useRecurringRulesQuery, useResumeRule } from '@/api/queries/domainQueries'
import LcButton from '@/components/ui/LcButton.vue'
import LcCard from '@/components/ui/LcCard.vue'
import LcEmptyState from '@/components/ui/LcEmptyState.vue'
import LcErrorState from '@/components/ui/LcErrorState.vue'
import LcSkeleton from '@/components/ui/LcSkeleton.vue'

const rules = useRecurringRulesQuery()
const pause = usePauseRule()
const resume = useResumeRule()
const field = (item: unknown, key: string) => item && typeof item === 'object' ? String((item as Record<string, unknown>)[key] ?? '—') : '—'
</script>

<template>
  <section class="grid gap-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p class="font-display text-xs font-bold uppercase tracking-[0.28em] text-contextDark">Coach reports</p>
        <h1 class="mt-2 font-display text-3xl font-bold text-ink">Reports</h1>
      </div>
      <div class="flex rounded-full border border-border bg-surface p-1 shadow-sm">
        <RouterLink to="/reports/templates" class="rounded-full px-5 py-2 text-sm font-bold text-textMuted transition hover:text-contextDark">Templates</RouterLink>
        <RouterLink to="/reports/assignments" class="rounded-full px-5 py-2 text-sm font-bold text-textMuted transition hover:text-contextDark">Assign</RouterLink>
        <RouterLink to="/reports/submissions" class="rounded-full px-5 py-2 text-sm font-bold text-textMuted transition hover:text-contextDark">Submissions</RouterLink>
        <RouterLink to="/reports/recurring-rules" class="rounded-full bg-contextDark px-5 py-2 text-sm font-bold text-white shadow-sm">Recurring</RouterLink>
      </div>
    </div>

    <div class="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
      <div class="grid gap-6 border-b border-border bg-gradient-to-br from-surface via-canvas to-surfaceMuted p-6 lg:grid-cols-[1fr_auto] lg:items-start">
        <div>
          <p class="font-display text-xs font-bold uppercase tracking-[0.28em] text-contextDark">Schedule</p>
          <h1 class="mt-3 font-display text-3xl font-bold text-ink">Recurring reports</h1>
          <p class="mt-2 max-w-3xl text-sm leading-6 text-textMuted">Manage automated check-ins that keep coaching feedback consistent over time.</p>
        </div>
        <div class="rounded-xl border border-border bg-surface/80 p-4 text-sm"><p class="text-textMuted">Rules</p><p class="font-display text-2xl font-bold text-contextDark">{{ rules.data.value?.length ?? 0 }}</p></div>
      </div>
    </div>

    <LcSkeleton v-if="rules.isLoading.value" />
    <LcErrorState v-else-if="rules.isError.value" @retry="rules.refetch()" />
    <LcEmptyState v-else-if="(rules.data.value ?? []).length === 0" title="No recurring reports" description="Recurring check-ins will appear here after they are scheduled." />
    <div v-else class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      <LcCard v-for="rule in rules.data.value ?? []" :key="field(rule, 'id')">
        <h2 class="font-display text-xl font-bold text-ink">Every {{ field(rule, 'intervalValue') }} {{ field(rule, 'intervalUnit').toLowerCase() }}</h2>
        <p class="mt-2 text-sm text-textMuted">Next run: {{ field(rule, 'nextRunAt') }}</p>
        <p class="text-sm text-textMuted">Paused: {{ field(rule, 'pausedAt') }}</p>
        <div class="mt-4 flex gap-2"><LcButton variant="secondary" @click="pause.mutate(field(rule, 'id'))">Pause</LcButton><LcButton variant="secondary" @click="resume.mutate(field(rule, 'id'))">Resume</LcButton></div>
      </LcCard>
    </div>
  </section>
</template>
