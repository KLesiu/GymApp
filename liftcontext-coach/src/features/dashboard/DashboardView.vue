<script setup lang="ts">
import { computed } from 'vue'
import { useTraineesQuery, useSubmissionsQuery } from '@/api/queries/domainQueries'
import LcMetric from '@/components/ui/LcMetric.vue'
import LcSkeleton from '@/components/ui/LcSkeleton.vue'
import LcErrorState from '@/components/ui/LcErrorState.vue'
import LcCard from '@/components/ui/LcCard.vue'

const trainees = useTraineesQuery()
const submissions = useSubmissionsQuery()
const activeCount = computed(() => trainees.data.value?.filter((t) => t.relationshipStatus === 'ACTIVE').length ?? 0)
const pendingReports = computed(() => submissions.data.value?.length ?? undefined)
</script>

<template>
  <section class="grid gap-6">
    <div>
      <p class="text-sm font-bold uppercase text-contextDark">LiftContext Coach</p>
      <h1 class="font-display text-3xl font-bold">Start</h1>
      <p class="mt-2 text-textMuted">A quick overview of active coaching work and recent trainee activity.</p>
    </div>
    <LcErrorState v-if="trainees.isError.value || submissions.isError.value" @retry="() => { trainees.refetch(); submissions.refetch() }" />
    <div v-else-if="trainees.isLoading.value" class="grid gap-4 md:grid-cols-3"><LcSkeleton /><LcSkeleton /><LcSkeleton /></div>
    <div v-else class="grid gap-4 md:grid-cols-3">
      <LcMetric label="Active trainees" :value="activeCount" hint="Accepted coaching relationships" />
      <LcMetric label="Submitted reports" :value="pendingReports ?? '—'" :unavailable="pendingReports === undefined" hint="Reports ready for review" />
      <LcMetric label="Recent workouts" value="—" unavailable hint="Open a trainee profile to review workout history" />
    </div>
    <LcCard><h2 class="font-display text-xl font-bold">Coaching workspace</h2><p class="mt-2 text-textMuted">Use the side navigation to manage invitations, trainees, plans, reports, and exercise libraries from one place.</p></LcCard>
  </section>
</template>
