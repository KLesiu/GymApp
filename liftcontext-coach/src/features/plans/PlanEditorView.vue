<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { z } from 'zod'
import type { PlanSummary } from '@/api/adapters/viewModels'
import {
  useCreatePlan,
  useCreatePlanDay,
  useDeletePlanDay,
  useExercisesQuery,
  usePlanQuery,
  useUpdatePlanDay,
} from '@/api/queries/domainQueries'
import LcButton from '@/components/ui/LcButton.vue'
import LcCard from '@/components/ui/LcCard.vue'
import LcDialog from '@/components/ui/LcDialog.vue'
import LcErrorState from '@/components/ui/LcErrorState.vue'
import LcInput from '@/components/ui/LcInput.vue'
import LcSelect from '@/components/ui/LcSelect.vue'
import LcSkeleton from '@/components/ui/LcSkeleton.vue'
import LcTextarea from '@/components/ui/LcTextarea.vue'

type DraftExercise = { exerciseId: string; series: number; repsTarget: number }
type PlanDaySummary = PlanSummary['days'][number]

const schema = z.object({ name: z.string().min(2), description: z.string().optional(), weeksCount: z.coerce.number().int().min(1).max(12) })
const route = useRoute()
const router = useRouter()
const planId = computed(() => typeof route.params.planId === 'string' ? route.params.planId : undefined)
const isEditing = computed(() => Boolean(planId.value))
const plan = usePlanQuery(planId)
const exercises = useExercisesQuery()
const createPlan = useCreatePlan()
const createPlanDay = useCreatePlanDay()
const updatePlanDay = useUpdatePlanDay()
const deletePlanDay = useDeletePlanDay()
const form = reactive({ name: '', description: '', weeksCount: 1 })
const dayForm = reactive({ name: '', weekNumber: 1 })
const draftExercises = ref<DraftExercise[]>([])
const editingDayId = ref<string | null>(null)
const deletingDay = ref<PlanDaySummary | null>(null)
const error = ref('')
const dayError = ref('')
const days = computed(() => [...(plan.data.value?.days ?? [])].sort((left, right) => left.orderIndex - right.orderIndex))
const editingDay = computed(() => days.value.find((day) => day.id === editingDayId.value))
const nextOrderIndex = computed(() => days.value.length)
const activeOrderIndex = computed(() => editingDay.value?.orderIndex ?? nextOrderIndex.value)
const exerciseOptions = computed(() => (exercises.data.value ?? []).map((item) => ({ label: exerciseField(item, 'name'), value: exerciseField(item, 'id') })).filter((item) => item.value !== '—'))
const exerciseName = (exerciseId: string) => exerciseOptions.value.find((item) => item.value === exerciseId)?.label ?? exerciseId
const formModeLabel = computed(() => editingDay.value ? 'Edit day' : 'Add day')
const formTitle = computed(() => editingDay.value ? `Edit ${editingDay.value.name}` : 'New plan day')
const isSavingDay = computed(() => createPlanDay.isPending.value || updatePlanDay.isPending.value)

function exerciseField(item: unknown, key: string) {
  if (!item || typeof item !== 'object') return '—'
  const record = item as Record<string, unknown>
  return String(record[key] ?? (key === 'id' ? record._id : undefined) ?? '—')
}

watch(() => plan.data.value, (value) => {
  if (!value) return
  form.name = value.name
  form.description = value.description ?? ''
  form.weeksCount = value.weeksCount
  dayForm.weekNumber = Math.min(dayForm.weekNumber, value.weeksCount)
}, { immediate: true })

const submit = async () => {
  error.value = ''
  const parsed = schema.safeParse(form)
  if (!parsed.success) {
    error.value = 'Provide a plan name and 1-12 weeks.'
    return
  }
  const body = { name: parsed.data.name, description: parsed.data.description, weeksCount: parsed.data.weeksCount }
  await createPlan.mutateAsync(body)
  await router.push('/plans')
}

const resetDayForm = () => {
  dayForm.name = ''
  dayForm.weekNumber = 1
  draftExercises.value = []
  editingDayId.value = null
  dayError.value = ''
}

const startEditDay = (day: PlanDaySummary) => {
  editingDayId.value = day.id
  dayForm.name = day.name
  dayForm.weekNumber = day.weekNumber
  draftExercises.value = [...day.exercises]
    .sort((left, right) => left.orderIndex - right.orderIndex)
    .map((exercise) => ({ exerciseId: exercise.exerciseId, series: exercise.series, repsTarget: exercise.repsTarget }))
  dayError.value = ''
}

const addExerciseRow = () => {
  const firstAvailable = exerciseOptions.value.find((item) => !draftExercises.value.some((exercise) => exercise.exerciseId === item.value))
  if (!firstAvailable) {
    dayError.value = 'No more exercises available to add.'
    return
  }
  draftExercises.value = [...draftExercises.value, { exerciseId: firstAvailable.value, series: 3, repsTarget: 10 }]
}

const removeExerciseRow = (index: number) => {
  draftExercises.value = draftExercises.value.filter((_item, itemIndex) => itemIndex !== index)
}

const submitPlanDay = async () => {
  dayError.value = ''
  if (!planId.value || !plan.data.value) return
  const weekNumber = Number(dayForm.weekNumber)
  if (!Number.isInteger(weekNumber) || weekNumber < 1 || weekNumber > plan.data.value.weeksCount) {
    dayError.value = `Choose a week between 1 and ${plan.data.value.weeksCount}.`
    return
  }
  const name = dayForm.name.trim()
  if (!name) {
    dayError.value = 'Provide a plan day name.'
    return
  }
  if (draftExercises.value.length === 0) {
    dayError.value = 'Add at least one exercise to this day.'
    return
  }
  const planExercises = draftExercises.value.map((exercise, index) => ({ ...exercise, series: Number(exercise.series), repsTarget: Number(exercise.repsTarget), orderIndex: index }))
  if (planExercises.some((exercise) => !exercise.exerciseId || !Number.isInteger(exercise.series) || exercise.series < 1 || !Number.isInteger(exercise.repsTarget) || exercise.repsTarget < 1)) {
    dayError.value = 'Every exercise needs a valid exercise, series count, and reps target.'
    return
  }

  const body = { name, weekNumber, orderIndex: activeOrderIndex.value, exercises: planExercises }
  if (editingDayId.value) {
    await updatePlanDay.mutateAsync({ planId: planId.value, planDayId: editingDayId.value, body })
  } else {
    await createPlanDay.mutateAsync({ planId: planId.value, body })
  }
  resetDayForm()
}

const confirmDeleteDay = async () => {
  if (!planId.value || !deletingDay.value) return
  await deletePlanDay.mutateAsync({ planId: planId.value, planDayId: deletingDay.value.id })
  if (editingDayId.value === deletingDay.value.id) resetDayForm()
  deletingDay.value = null
}
</script>

<template>
  <section class="grid gap-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p class="font-display text-xs font-bold uppercase tracking-[0.28em] text-contextDark">Training plans</p>
        <h1 class="mt-2 font-display text-3xl font-bold text-ink">{{ isEditing ? 'Edit plan' : 'Plan editor' }}</h1>
      </div>
      <RouterLink to="/plans" class="rounded-full border border-contextDark px-5 py-2 text-sm font-bold text-contextDark transition hover:bg-contextDark hover:text-white">Back to plans</RouterLink>
    </div>

    <div class="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
      <div class="border-b border-border bg-gradient-to-br from-surface via-canvas to-surfaceMuted p-6">
        <p class="font-display text-xs font-bold uppercase tracking-[0.28em] text-contextDark">{{ isEditing ? 'Plan structure' : 'New plan' }}</p>
        <h2 class="mt-3 font-display text-3xl font-bold text-ink">{{ isEditing ? (plan.data.value?.name ?? 'Loading plan') : 'Create a training block' }}</h2>
        <p class="mt-2 max-w-3xl text-sm leading-6 text-textMuted">{{ isEditing ? 'Build plan days from a clear name plus exercises, series, and reps before assigning the plan to a trainee.' : 'Create a clean training block that can be refined and assigned to trainees.' }}</p>
      </div>
    </div>

    <template v-if="isEditing">
      <LcSkeleton v-if="plan.isLoading.value" />
      <LcErrorState v-else-if="plan.isError.value" @retry="plan.refetch()" />
      <div v-else class="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_460px]">
        <LcCard>
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p class="font-display text-xs font-bold uppercase tracking-[0.22em] text-contextDark">Existing days</p>
              <h2 class="mt-2 font-display text-2xl font-bold text-ink">Plan days</h2>
            </div>
            <span class="rounded-full bg-surfaceMuted px-3 py-1 text-xs font-bold text-textMuted">{{ days.length }} day(s)</span>
          </div>
          <div v-if="days.length" class="mt-5 grid gap-3">
            <div v-for="day in days" :key="day.id" class="rounded-xl border border-border bg-surfaceMuted p-4">
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 class="font-display text-lg font-bold text-ink">{{ day.name }}</h3>
                  <p class="mt-1 text-sm text-textMuted">Week {{ day.weekNumber }} · {{ day.exercises.length }} exercise(s)</p>
                </div>
                <div class="flex flex-wrap gap-2">
                  <LcButton type="button" variant="secondary" @click="startEditDay(day)">Edit</LcButton>
                  <LcButton type="button" variant="danger" :loading="deletePlanDay.isPending.value && deletingDay?.id === day.id" @click="deletingDay = day">Delete</LcButton>
                </div>
              </div>
              <div v-if="day.exercises.length" class="mt-3 grid gap-2">
                <div v-for="exercise in [...day.exercises].sort((left, right) => left.orderIndex - right.orderIndex)" :key="exercise.id" class="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-surface px-3 py-2 text-sm text-textMuted">
                  <span class="font-bold text-ink">{{ exerciseName(exercise.exerciseId) }}</span>
                  <span>{{ exercise.series }} series · {{ exercise.repsTarget }} reps</span>
                </div>
              </div>
            </div>
          </div>
          <p v-else class="mt-5 rounded-xl bg-surfaceMuted p-5 text-sm text-textMuted">No plan days yet. Add a day with exercises from the form on the right.</p>
        </LcCard>

        <LcCard>
          <form class="grid gap-5" @submit.prevent="submitPlanDay">
            <div class="rounded-2xl border border-border bg-gradient-to-br from-surface via-canvas to-surfaceMuted p-5">
              <p class="font-display text-xs font-bold uppercase tracking-[0.22em] text-contextDark">{{ formModeLabel }}</p>
              <h2 class="mt-2 font-display text-2xl font-bold text-ink">{{ formTitle }}</h2>
              <p class="mt-2 text-sm leading-6 text-textMuted">Set the day name, week, and ordered exercise targets. Editing replaces the day exercises with the rows below.</p>
            </div>

            <div class="grid gap-4">
              <LcInput v-model="dayForm.name" label="Day name" hint="Example: Upper body strength" />
              <LcInput v-model.number="dayForm.weekNumber" label="Week number" type="number" min="1" :max="plan.data.value?.weeksCount ?? 1" />
            </div>

            <div class="grid gap-4 rounded-2xl border border-border bg-surfaceMuted p-4">
              <div class="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p class="text-sm font-bold text-ink">Exercises</p>
                  <p class="mt-1 text-xs font-medium text-textMuted">Add each exercise with series and reps.</p>
                </div>
                <LcButton type="button" variant="secondary" @click="addExerciseRow">Add exercise</LcButton>
              </div>
              <p v-if="exercises.isLoading.value" class="text-sm text-textMuted">Loading exercises...</p>
              <LcErrorState v-else-if="exercises.isError.value" @retry="exercises.refetch()" />
              <p v-else-if="draftExercises.length === 0" class="rounded-xl bg-surface p-4 text-sm text-textMuted">Add at least one exercise with series and reps.</p>
              <div v-for="(exercise, index) in draftExercises" v-else :key="index" class="grid gap-3 rounded-xl border border-border bg-surface p-4">
                <div class="flex items-center justify-between gap-3">
                  <p class="text-xs font-bold uppercase tracking-[0.18em] text-textMuted">Exercise {{ index + 1 }}</p>
                  <button type="button" class="text-sm font-bold text-danger" @click="removeExerciseRow(index)">Remove</button>
                </div>
                <LcSelect v-model="exercise.exerciseId" label="Exercise" :options="exerciseOptions" />
                <div class="grid grid-cols-2 gap-3">
                  <LcInput v-model.number="exercise.series" label="Series" type="number" min="1" />
                  <LcInput v-model.number="exercise.repsTarget" label="Reps" type="number" min="1" />
                </div>
              </div>
            </div>
            <p v-if="dayError" class="rounded-xl bg-danger/10 px-4 py-3 text-sm font-semibold text-danger">{{ dayError }}</p>
            <div class="flex flex-col gap-3 sm:flex-row">
              <LcButton class="flex-1" type="submit" :loading="isSavingDay">{{ editingDay ? 'Save changes' : 'Add plan day' }}</LcButton>
              <LcButton v-if="editingDay" class="flex-1" type="button" variant="secondary" @click="resetDayForm">Cancel editing</LcButton>
            </div>
          </form>
        </LcCard>
      </div>
    </template>

    <LcCard v-else>
      <form class="grid gap-4 lg:max-w-3xl" @submit.prevent="submit">
        <LcInput v-model="form.name" label="Plan name" required />
        <LcTextarea v-model="form.description" label="Description" />
        <LcInput v-model.number="form.weeksCount" label="Weeks count" type="number" min="1" max="12" />
        <p class="text-sm text-textMuted">Start with the core plan details. You can add more days after saving the plan.</p>
        <p v-if="error" class="text-sm text-danger">{{ error }}</p>
        <LcButton type="submit" :loading="createPlan.isPending.value">Save plan</LcButton>
      </form>
    </LcCard>

    <LcDialog :open="Boolean(deletingDay)" title="Delete plan day" @close="deletingDay = null">
      <div class="grid gap-5">
        <p class="text-sm leading-6 text-textMuted">Delete <span class="font-bold text-ink">{{ deletingDay?.name }}</span> from this plan template? This removes the day and all exercise targets inside it.</p>
        <div class="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <LcButton type="button" variant="secondary" @click="deletingDay = null">Cancel</LcButton>
          <LcButton type="button" variant="danger" :loading="deletePlanDay.isPending.value" @click="confirmDeleteDay">Delete day</LcButton>
        </div>
      </div>
    </LcDialog>
  </section>
</template>
