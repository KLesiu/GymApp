<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { usePlansQuery } from '@/api/queries/domainQueries'
import LcCard from '@/components/ui/LcCard.vue'
import LcButton from '@/components/ui/LcButton.vue'
import LcEmptyState from '@/components/ui/LcEmptyState.vue'
import LcErrorState from '@/components/ui/LcErrorState.vue'
import LcSkeleton from '@/components/ui/LcSkeleton.vue'
const plans = usePlansQuery()
const daysInWeek = (plan: { days: { weekNumber: number }[] }, weekNumber: number) => plan.days.filter((day) => day.weekNumber === weekNumber).length
</script>
<template><section class="grid gap-6"><div class="flex items-end justify-between gap-4"><div><h1 class="font-display text-3xl font-bold">Plans</h1><p class="mt-2 text-textMuted">Create, review, and assign multiweek training plans supported by `/api/v1/plans`.</p></div><RouterLink to="/plans/new"><LcButton>New plan</LcButton></RouterLink></div><LcSkeleton v-if="plans.isLoading.value"/><LcErrorState v-else-if="plans.isError.value" @retry="plans.refetch()"/><LcEmptyState v-else-if="(plans.data.value ?? []).length === 0" title="No plans yet" description="Create the first plan from the current API schema."/><div v-else class="grid gap-3 md:grid-cols-2"><RouterLink v-for="plan in plans.data.value" :key="plan.id" :to="`/plans/${plan.id}`"><LcCard><h2 class="font-display text-xl font-bold">{{ plan.name }}</h2><p class="mt-2 text-sm text-textMuted">{{ plan.description ?? 'No description' }}</p><div class="mt-3 flex flex-wrap gap-2 text-xs font-bold text-textMuted"><span v-for="week in plan.weeksCount" :key="week" class="rounded-full bg-surfaceMuted px-3 py-1">Week {{ week }} · {{ daysInWeek(plan, week) }} day(s)</span></div></LcCard></RouterLink></div></section></template>
