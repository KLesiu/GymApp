<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useAssignReport, useReportTemplatesQuery, useTraineesQuery } from '@/api/queries/domainQueries'
import LcButton from '@/components/ui/LcButton.vue'
import LcCard from '@/components/ui/LcCard.vue'
import LcInput from '@/components/ui/LcInput.vue'
import LcSelect from '@/components/ui/LcSelect.vue'

const form = reactive({ traineeId: '', templateId: '', dueAt: '', note: '' })
const trainees = useTraineesQuery()
const templates = useReportTemplatesQuery()
const assign = useAssignReport()
const traineeOptions = computed(() => (trainees.data.value ?? []).map((trainee) => ({ label: trainee.name, value: trainee.id })))
const templateOptions = computed(() => (templates.data.value ?? []).map((template) => ({ label: template.name, value: template.id })))
const submit = () => assign.mutate({ traineeId: form.traineeId, templateId: form.templateId, dueAt: form.dueAt ? new Date(form.dueAt).toISOString() : undefined, note: form.note || undefined })
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
        <RouterLink to="/reports/assignments" class="rounded-full bg-contextDark px-5 py-2 text-sm font-bold text-white shadow-sm">Assign</RouterLink>
        <RouterLink to="/reports/submissions" class="rounded-full px-5 py-2 text-sm font-bold text-textMuted transition hover:text-contextDark">Submissions</RouterLink>
        <RouterLink to="/reports/recurring-rules" class="rounded-full px-5 py-2 text-sm font-bold text-textMuted transition hover:text-contextDark">Recurring</RouterLink>
      </div>
    </div>

    <div class="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
      <div class="grid gap-6 border-b border-border bg-gradient-to-br from-surface via-canvas to-surfaceMuted p-6 lg:grid-cols-[1fr_auto] lg:items-start">
        <div>
          <p class="font-display text-xs font-bold uppercase tracking-[0.28em] text-contextDark">Assignment</p>
          <h1 class="mt-3 font-display text-3xl font-bold text-ink">Assign a report</h1>
          <p class="mt-2 max-w-3xl text-sm leading-6 text-textMuted">Send a structured check-in to a trainee with an optional due date and coaching note.</p>
        </div>
        <div class="grid grid-cols-2 gap-3 rounded-xl border border-border bg-surface/80 p-4 text-sm">
          <div><p class="text-textMuted">Trainees</p><p class="font-display text-2xl font-bold text-contextDark">{{ traineeOptions.length }}</p></div>
          <div><p class="text-textMuted">Templates</p><p class="font-display text-2xl font-bold text-reference">{{ templateOptions.length }}</p></div>
        </div>
      </div>
    </div>

    <LcCard>
      <form class="grid gap-4 lg:grid-cols-2" @submit.prevent="submit">
        <LcSelect v-model="form.traineeId" label="Trainee" :options="traineeOptions" />
        <LcSelect v-model="form.templateId" label="Template" :options="templateOptions" />
        <LcInput v-model="form.dueAt" label="Due date" type="datetime-local" />
        <LcInput v-model="form.note" label="Coach note" />
        <div class="lg:col-span-2"><LcButton type="submit" :loading="assign.isPending.value">Assign report</LcButton></div>
      </form>
    </LcCard>
  </section>
</template>
