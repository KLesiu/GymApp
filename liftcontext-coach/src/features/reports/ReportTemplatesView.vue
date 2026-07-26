<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useReportTemplatesQuery } from '@/api/queries/domainQueries'
import LcButton from '@/components/ui/LcButton.vue'
import LcCard from '@/components/ui/LcCard.vue'
import LcEmptyState from '@/components/ui/LcEmptyState.vue'
import LcErrorState from '@/components/ui/LcErrorState.vue'
import LcSkeleton from '@/components/ui/LcSkeleton.vue'

const templates = useReportTemplatesQuery()
const totalFields = computed(() => (templates.data.value ?? []).reduce((sum, template) => sum + template.fields.length, 0))
</script>

<template>
  <section class="grid gap-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p class="font-display text-xs font-bold uppercase tracking-[0.28em] text-contextDark">Coach reports</p>
        <h1 class="mt-2 font-display text-3xl font-bold text-ink">Reports</h1>
      </div>
      <div class="flex rounded-full border border-border bg-surface p-1 shadow-sm">
        <RouterLink to="/reports/templates" class="rounded-full bg-contextDark px-5 py-2 text-sm font-bold text-white shadow-sm">Templates</RouterLink>
        <RouterLink to="/reports/assignments" class="rounded-full px-5 py-2 text-sm font-bold text-textMuted transition hover:text-contextDark">Assign</RouterLink>
        <RouterLink to="/reports/submissions" class="rounded-full px-5 py-2 text-sm font-bold text-textMuted transition hover:text-contextDark">Submissions</RouterLink>
        <RouterLink to="/reports/recurring-rules" class="rounded-full px-5 py-2 text-sm font-bold text-textMuted transition hover:text-contextDark">Recurring</RouterLink>
      </div>
    </div>

    <div class="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
      <div class="grid gap-6 border-b border-border bg-gradient-to-br from-surface via-canvas to-surfaceMuted p-6 lg:grid-cols-[1fr_auto] lg:items-start">
        <div>
          <p class="font-display text-xs font-bold uppercase tracking-[0.28em] text-contextDark">Templates</p>
          <h1 class="mt-3 font-display text-3xl font-bold text-ink">Report templates</h1>
          <p class="mt-2 max-w-3xl text-sm leading-6 text-textMuted">Create reusable check-ins that keep trainee feedback consistent across assignments and reviews.</p>
        </div>
        <div class="grid grid-cols-2 gap-3 rounded-xl border border-border bg-surface/80 p-4 text-sm">
          <div><p class="text-textMuted">Templates</p><p class="font-display text-2xl font-bold text-contextDark">{{ templates.data.value?.length ?? 0 }}</p></div>
          <div><p class="text-textMuted">Fields</p><p class="font-display text-2xl font-bold text-reference">{{ totalFields }}</p></div>
        </div>
      </div>
      <div class="flex flex-wrap items-center justify-between gap-4 p-6">
        <p class="text-sm text-textMuted">Use templates to collect the same signals from every trainee.</p>
        <RouterLink to="/reports/templates/new"><LcButton>New template</LcButton></RouterLink>
      </div>
    </div>

    <LcSkeleton v-if="templates.isLoading.value" />
    <LcErrorState v-else-if="templates.isError.value" @retry="templates.refetch()" />
    <LcEmptyState v-else-if="(templates.data.value ?? []).length === 0" title="No templates yet" description="Create a template before assigning check-ins to trainees." />
    <div v-else class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      <LcCard v-for="template in templates.data.value" :key="template.id">
        <h2 class="font-display text-xl font-bold text-ink">{{ template.name }}</h2>
        <p class="mt-2 text-sm text-textMuted">{{ template.description ?? 'Ready to assign as a trainee check-in.' }}</p>
        <div class="mt-4 rounded-lg bg-surfaceMuted px-3 py-2 text-sm font-semibold text-textMuted">{{ template.fields.length }} field(s)</div>
      </LcCard>
    </div>
  </section>
</template>
