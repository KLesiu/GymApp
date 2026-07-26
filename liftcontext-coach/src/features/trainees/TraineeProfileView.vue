<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useTraineeBundle, useUnlinkTrainee, usePlansQuery, useAssignPlan, useTraineeActivePlanQuery } from '@/api/queries/domainQueries'
import LcBadge from '@/components/ui/LcBadge.vue'
import LcButton from '@/components/ui/LcButton.vue'
import LcCard from '@/components/ui/LcCard.vue'
import LcDialog from '@/components/ui/LcDialog.vue'
import LcEmptyState from '@/components/ui/LcEmptyState.vue'
import LcErrorState from '@/components/ui/LcErrorState.vue'
import LcMetric from '@/components/ui/LcMetric.vue'
import LcSelect from '@/components/ui/LcSelect.vue'
import LcSkeleton from '@/components/ui/LcSkeleton.vue'
import LcTrend from '@/components/ui/LcTrend.vue'

const props = defineProps<{ initialTab?: string }>()
const route = useRoute()
const traineeId = computed(() => String(route.params.traineeId))
const activeTab = ref(props.initialTab ?? 'summary')
watch(traineeId, () => { activeTab.value = 'summary' })
const bundle = useTraineeBundle(traineeId)
const unlink = useUnlinkTrainee()
const plans = usePlansQuery()
const assign = useAssignPlan()
const activePlan = useTraineeActivePlanQuery(traineeId)
const confirmOpen = ref(false)
const planId = ref('')
const tabs = [{ id: 'summary', label: 'Summary' }, { id: 'workouts', label: 'Workouts' }, { id: 'strength', label: 'Strength profile' }, { id: 'measurements', label: 'Measurements' }, { id: 'plans', label: 'Plans' }, { id: 'reports', label: 'Reports' }]
const finalized = computed(() => bundle.workouts.data.value ?? [])
const measurementPoints = computed(() => (bundle.measurements.data.value ?? []).map((m) => ({ label: new Date(m.takenAt).toLocaleDateString('en'), value: m.value, hint: `${m.bodyPart} ${m.unit}` })))
const eloValue = computed(() => {
  const value = bundle.elo.data.value
  if (value && typeof value === 'object' && 'elo' in value) return String((value as Record<string, unknown>).elo)
  return '—'
})
const assignPlan = async () => { if (planId.value) await assign.mutateAsync({ planId: planId.value, traineeId: traineeId.value }) }
</script>

<template>
  <section class="grid gap-6">
    <LcSkeleton v-if="bundle.trainees.isLoading.value" />
    <LcErrorState v-else-if="bundle.trainees.isError.value" @retry="bundle.trainees.refetch()" />
    <template v-else>
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div><RouterLink to="/trainees" class="text-sm font-bold text-contextDark">← Trainees</RouterLink><h1 class="mt-2 font-display text-3xl font-bold">{{ bundle.trainee.value?.name ?? 'Trainee' }}</h1><p class="text-textMuted">{{ bundle.trainee.value?.email ?? traineeId }}</p></div>
        <div class="flex gap-2"><LcBadge tone="success">{{ bundle.trainee.value?.relationshipStatus ?? 'ACTIVE' }}</LcBadge><LcButton variant="danger" @click="confirmOpen = true">Unlink</LcButton></div>
      </div>
      <nav class="flex gap-2 overflow-x-auto"><button v-for="tab in tabs" :key="tab.id" class="rounded-full px-4 py-2 text-sm font-bold" :class="activeTab === tab.id ? 'bg-contextDark text-white' : 'bg-surface text-textMuted'" @click="activeTab = tab.id">{{ tab.label }}</button></nav>
      <div v-if="activeTab === 'summary'" class="grid gap-4 md:grid-cols-3"><LcMetric label="Current rating" :value="bundle.trainee.value?.elo ?? '—'" hint="Latest LiftContext score" /><LcMetric label="Finalized workouts" :value="finalized.length" hint="Completed training sessions" /><LcMetric label="Measurements" :value="bundle.measurements.data.value?.length ?? '—'" hint="Body measurement history" /></div>
      <div v-if="activeTab === 'strength'" class="grid gap-4"><LcTrend title="Rating history" :points="bundle.eloChart.data.value ?? []" summary="Track how performance changes across completed workouts." /><LcMetric label="Current LiftContext Rating" :value="eloValue" hint="Latest strength profile score" /></div>
      <div v-if="activeTab === 'workouts'" class="grid gap-3"><LcEmptyState v-if="finalized.length === 0" title="No finalized workouts" description="Completed workouts will appear here after the trainee finishes a session." /><LcCard v-for="workout in finalized" :key="workout.id"><div class="flex justify-between gap-4"><div><h2 class="font-display text-lg font-bold">{{ workout.title }}</h2><p class="text-sm text-textMuted">{{ workout.date }} · {{ workout.gymName ?? 'Training location' }}</p></div><LcBadge tone="success">Completed</LcBadge></div><p class="mt-2 text-sm">{{ workout.summary }}</p></LcCard></div>
      <div v-if="activeTab === 'measurements'" class="grid gap-4"><LcTrend title="Measurement trend" :points="measurementPoints" summary="The trend describes value changes without suggesting a causal training effect." /><LcCard v-for="m in bundle.measurements.data.value ?? []" :key="m.id"><strong>{{ m.bodyPart }}</strong> — {{ m.value }} {{ m.unit }} <span class="text-textMuted">{{ m.takenAt }}</span></LcCard></div>
      <div v-if="activeTab === 'plans'" class="grid gap-4">
        <LcSkeleton v-if="activePlan.isLoading.value" />
        <LcErrorState v-else-if="activePlan.isError.value" @retry="activePlan.refetch()" />
        <LcCard v-else-if="activePlan.data.value">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p class="font-display text-xs font-bold uppercase tracking-[0.22em] text-contextDark">Active plan</p>
              <h2 class="mt-2 font-display text-2xl font-bold text-ink">{{ activePlan.data.value.name }}</h2>
              <p class="mt-1 text-sm text-textMuted">{{ activePlan.data.value.weeksCount }} week(s) · {{ activePlan.data.value.days.length }} day(s)</p>
            </div>
            <LcBadge tone="success">Assigned</LcBadge>
          </div>
          <div v-if="activePlan.data.value.days.length" class="mt-4 grid gap-2">
            <div v-for="day in activePlan.data.value.days" :key="day.id" class="rounded-xl bg-surfaceMuted p-3 text-sm text-textMuted">
              <strong class="text-ink">{{ day.name }}</strong> · Week {{ day.weekNumber }} · {{ day.exercises.length }} exercise(s)
            </div>
          </div>
        </LcCard>
        <LcEmptyState v-else title="No active plan" description="Assign a training plan when this trainee is ready for the next block." />
        <form class="flex max-w-xl gap-2" @submit.prevent="assignPlan"><LcSelect v-model="planId" label="Plan" :options="(plans.data.value ?? []).map((p) => ({ label: p.name, value: p.id }))" /><LcButton type="submit" :loading="assign.isPending.value">Assign</LcButton></form>
        <p class="text-sm text-textMuted">Assigning a plan makes it active for the trainee immediately.</p>
      </div>
      <div v-if="activeTab === 'reports'" class="grid gap-3"><LcEmptyState v-if="(bundle.reports.data.value ?? []).length === 0" title="No submitted reports" /><LcCard v-for="report in bundle.reports.data.value ?? []" :key="report.id"><h2 class="font-display font-bold">{{ report.templateName ?? 'Report submission' }}</h2><p class="text-sm text-textMuted">{{ report.submittedAt ?? 'Recently submitted' }}</p></LcCard></div>
    </template>
    <LcDialog :open="confirmOpen" title="Unlink this trainee?" @close="confirmOpen = false"><p class="text-textMuted">This removes the active coaching relationship. You can invite the trainee again later if needed.</p><div class="mt-4 flex gap-2"><LcButton variant="danger" :loading="unlink.isPending.value" @click="unlink.mutateAsync(traineeId); confirmOpen = false">Confirm unlink</LcButton><LcButton variant="secondary" @click="confirmOpen = false">Cancel</LcButton></div></LcDialog>
  </section>
</template>
