<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useTraineeBundle, useUnlinkTrainee, usePlansQuery, useAssignPlan } from '@/api/queries/domainQueries'
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
      <div v-if="activeTab === 'summary'" class="grid gap-4 md:grid-cols-3"><LcMetric label="Current Elo" :value="bundle.trainee.value?.elo ?? '—'" hint="Value returned by the API" /><LcMetric label="Finalized workouts" :value="finalized.length" hint="Only FINALIZED sessions are shown" /><LcMetric label="Measurements" :value="bundle.measurements.data.value?.length ?? '—'" hint="Body measurement history" /></div>
      <div v-if="activeTab === 'strength'" class="grid gap-4"><LcTrend title="Elo history" :points="bundle.eloChart.data.value ?? []" summary="The chart includes a text summary; Elo is not calculated in the browser." /><LcMetric label="Current LiftContext Rating" :value="eloValue" hint="Ranking inspired by Elo; server-calculated." /></div>
      <div v-if="activeTab === 'workouts'" class="grid gap-3"><LcEmptyState v-if="finalized.length === 0" title="No finalized workouts" description="Drafts are never presented as results." /><LcCard v-for="workout in finalized" :key="workout.id"><div class="flex justify-between gap-4"><div><h2 class="font-display text-lg font-bold">{{ workout.title }}</h2><p class="text-sm text-textMuted">{{ workout.date }} · {{ workout.gymName ?? 'Gym context unavailable' }}</p></div><LcBadge tone="success">FINALIZED</LcBadge></div><p class="mt-2 text-sm">{{ workout.summary }}</p></LcCard></div>
      <div v-if="activeTab === 'measurements'" class="grid gap-4"><LcTrend title="Measurement trend" :points="measurementPoints" summary="The trend describes value changes without suggesting a causal training effect." /><LcCard v-for="m in bundle.measurements.data.value ?? []" :key="m.id"><strong>{{ m.bodyPart }}</strong> — {{ m.value }} {{ m.unit }} <span class="text-textMuted">{{ m.takenAt }}</span></LcCard></div>
      <div v-if="activeTab === 'plans'" class="grid gap-4"><form class="flex max-w-xl gap-2" @submit.prevent="assignPlan"><LcSelect v-model="planId" label="Plan" :options="(plans.data.value ?? []).map((p) => ({ label: p.name, value: p.id }))" /><LcButton type="submit" :loading="assign.isPending.value">Assign</LcButton></form><p class="text-sm text-textMuted">The API supports plan assignment but does not return a dedicated list of current assignments for a trainee.</p></div>
      <div v-if="activeTab === 'reports'" class="grid gap-3"><LcEmptyState v-if="(bundle.reports.data.value ?? []).length === 0" title="No submitted reports" /><LcCard v-for="report in bundle.reports.data.value ?? []" :key="report.id"><h2 class="font-display font-bold">{{ report.templateName ?? report.id }}</h2><p class="text-sm text-textMuted">{{ report.submittedAt ?? 'Date unavailable' }}</p></LcCard></div>
    </template>
    <LcDialog :open="confirmOpen" title="Unlink this trainee?" @close="confirmOpen = false"><p class="text-textMuted">This destructive operation requires confirmation and removes this trainee data from the panel cache.</p><div class="mt-4 flex gap-2"><LcButton variant="danger" :loading="unlink.isPending.value" @click="unlink.mutateAsync(traineeId); confirmOpen = false">Confirm unlink</LcButton><LcButton variant="secondary" @click="confirmOpen = false">Cancel</LcButton></div></LcDialog>
  </section>
</template>
