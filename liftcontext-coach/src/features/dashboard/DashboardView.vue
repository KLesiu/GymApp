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
      <p class="mt-2 text-textMuted">The dashboard shows only metrics available from the current API.</p>
    </div>
    <LcErrorState v-if="trainees.isError.value" @retry="trainees.refetch()" />
    <div v-else-if="trainees.isLoading.value" class="grid gap-4 md:grid-cols-3"><LcSkeleton /><LcSkeleton /><LcSkeleton /></div>
    <div v-else class="grid gap-4 md:grid-cols-3">
      <LcMetric label="Active trainees" :value="activeCount" hint="Trainer relationships from the API" />
      <LcMetric label="Submitted reports" :value="pendingReports ?? 'Unavailable'" :unavailable="pendingReports === undefined" hint="The endpoint does not distinguish pending reports" />
      <LcMetric label="Recent workouts" value="Unavailable" unavailable hint="No coach endpoint exposes trainee workout lists" />
    </div>
    <LcCard><h2 class="font-display text-xl font-bold">Security rule</h2><p class="mt-2 text-textMuted">Trainee data is cached under keys that include the trainee ID. The API remains the authorization boundary for coach–trainee relationships.</p></LcCard>
  </section>
</template>
