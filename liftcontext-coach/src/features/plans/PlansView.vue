<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useDeletePlan, usePlansQuery } from '@/api/queries/domainQueries'
import LcButton from '@/components/ui/LcButton.vue'
import LcCard from '@/components/ui/LcCard.vue'
import LcEmptyState from '@/components/ui/LcEmptyState.vue'
import LcErrorState from '@/components/ui/LcErrorState.vue'
import LcSkeleton from '@/components/ui/LcSkeleton.vue'

const plans = usePlansQuery()
const deletePlan = useDeletePlan()
const totalWeeks = computed(() => (plans.data.value ?? []).reduce((sum, plan) => sum + plan.weeksCount, 0))
const daysInWeek = (plan: { days: { weekNumber: number }[] }, weekNumber: number) => plan.days.filter((day) => day.weekNumber === weekNumber).length
const removePlan = (planId: string, planName: string) => {
  if (window.confirm(`Delete plan template "${planName}"? Assigned trainee plans will stay available.`)) deletePlan.mutate(planId)
}
</script>

<template>
  <section class="grid gap-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p class="font-display text-xs font-bold uppercase tracking-[0.28em] text-contextDark">Training plans</p>
        <h1 class="mt-2 font-display text-3xl font-bold text-ink">Plans</h1>
      </div>
    </div>

    <div class="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
      <div class="grid gap-6 border-b border-border bg-gradient-to-br from-surface via-canvas to-surfaceMuted p-6 lg:grid-cols-[1fr_auto] lg:items-start">
        <div>
          <p class="font-display text-xs font-bold uppercase tracking-[0.28em] text-contextDark">Plan library</p>
          <h2 class="mt-3 font-display text-3xl font-bold text-ink">Reusable training blocks</h2>
          <p class="mt-2 max-w-3xl text-sm leading-6 text-textMuted">Build structured training blocks, review existing templates, and prepare plans for trainee assignments.</p>
        </div>
        <div class="grid grid-cols-2 gap-3 rounded-xl border border-border bg-surface/80 p-4 text-sm">
          <div><p class="text-textMuted">Plans</p><p class="font-display text-2xl font-bold text-contextDark">{{ plans.data.value?.length ?? 0 }}</p></div>
          <div><p class="text-textMuted">Weeks</p><p class="font-display text-2xl font-bold text-reference">{{ totalWeeks }}</p></div>
        </div>
      </div>
      <div class="flex flex-wrap items-center justify-between gap-4 p-6">
        <p class="text-sm text-textMuted">Keep plan structure readable before assigning it to a trainee.</p>
        <RouterLink to="/plans/new"><LcButton>New plan</LcButton></RouterLink>
      </div>
    </div>

    <LcSkeleton v-if="plans.isLoading.value" />
    <LcErrorState v-else-if="plans.isError.value" @retry="plans.refetch()" />
    <LcEmptyState v-else-if="(plans.data.value ?? []).length === 0" title="No plans yet" description="Create your first plan to start building reusable training blocks." />
    <div v-else class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      <div v-for="plan in plans.data.value" :key="plan.id" class="h-full rounded-xl border border-border bg-surface p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-contextDark hover:shadow-card">
        <div class="flex items-start justify-between gap-3">
          <RouterLink :to="`/plans/${plan.id}`" class="min-w-0 flex-1"><h2 class="font-display text-xl font-bold text-ink">{{ plan.name }}</h2></RouterLink>
          <button type="button" class="text-sm font-bold text-danger" :disabled="deletePlan.isPending.value" @click="removePlan(plan.id, plan.name)">Delete</button>
        </div>
        <RouterLink :to="`/plans/${plan.id}`" class="block">
          <p class="mt-2 min-h-10 text-sm text-textMuted">{{ plan.description ?? 'Structured training block ready for editing.' }}</p>
          <div class="mt-4 flex flex-wrap gap-2 text-xs font-bold text-textMuted">
            <span v-for="week in plan.weeksCount" :key="week" class="rounded-full bg-surfaceMuted px-3 py-1">Week {{ week }} · {{ daysInWeek(plan, week) }} day(s)</span>
          </div>
        </RouterLink>
      </div>
    </div>
  </section>
</template>
