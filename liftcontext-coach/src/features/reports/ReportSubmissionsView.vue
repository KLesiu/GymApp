<script setup lang="ts">
import { ref } from 'vue'
import { useFeedback, useSubmissionsQuery } from '@/api/queries/domainQueries'
import LcButton from '@/components/ui/LcButton.vue'
import LcCard from '@/components/ui/LcCard.vue'
import LcEmptyState from '@/components/ui/LcEmptyState.vue'
import LcErrorState from '@/components/ui/LcErrorState.vue'
import LcSkeleton from '@/components/ui/LcSkeleton.vue'
import LcTextarea from '@/components/ui/LcTextarea.vue'

const submissions = useSubmissionsQuery()
const feedback = useFeedback()
const comments = ref<Record<string, string>>({})
const valueFor = (answers: Record<string, unknown> | undefined, key: string) => String((answers ?? {})[key] ?? '—')
const answerRows = (answers?: Record<string, unknown>) => Object.entries(answers ?? {}).map(([key, value]) => ({ key, value: String(value) }))
const getComment = (id: string) => comments.value[id] ?? ''
const setComment = (id: string, value: string) => { comments.value[id] = value }
const existingComment = (feedback: unknown) => feedback && typeof feedback === 'object' ? String((feedback as Record<string, unknown>).trainerOverallComment ?? '') : ''
const commentValue = (id: string, feedback: unknown) => getComment(id) || existingComment(feedback)
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
        <RouterLink to="/reports/submissions" class="rounded-full bg-contextDark px-5 py-2 text-sm font-bold text-white shadow-sm">Submissions</RouterLink>
        <RouterLink to="/reports/recurring-rules" class="rounded-full px-5 py-2 text-sm font-bold text-textMuted transition hover:text-contextDark">Recurring</RouterLink>
      </div>
    </div>

    <div class="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
      <div class="grid gap-6 border-b border-border bg-gradient-to-br from-surface via-canvas to-surfaceMuted p-6 lg:grid-cols-[1fr_auto] lg:items-start">
        <div>
          <p class="font-display text-xs font-bold uppercase tracking-[0.28em] text-contextDark">Review queue</p>
          <h1 class="mt-3 font-display text-3xl font-bold text-ink">Report submissions</h1>
          <p class="mt-2 max-w-3xl text-sm leading-6 text-textMuted">Review trainee check-ins, inspect answers, and leave clear coaching feedback.</p>
        </div>
        <div class="rounded-xl border border-border bg-surface/80 p-4 text-sm"><p class="text-textMuted">Submissions</p><p class="font-display text-2xl font-bold text-contextDark">{{ submissions.data.value?.length ?? 0 }}</p></div>
      </div>
    </div>

    <LcSkeleton v-if="submissions.isLoading.value" />
    <LcErrorState v-else-if="submissions.isError.value" @retry="submissions.refetch()" />
    <LcEmptyState v-else-if="(submissions.data.value ?? []).length === 0" title="No submissions yet" description="Completed trainee reports will appear here for review." />
    <div v-else class="grid gap-4">
      <LcCard v-for="submission in submissions.data.value ?? []" :key="submission.id">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p class="font-display text-xs font-bold uppercase tracking-[0.22em] text-contextDark">{{ submission.traineeName ?? 'Trainee' }}</p>
            <h2 class="mt-2 font-display text-xl font-bold text-ink">{{ submission.templateName ?? 'Report submission' }}</h2>
          </div>
          <p class="text-sm font-semibold text-textMuted">{{ submission.submittedAt ?? 'Recently submitted' }}</p>
        </div>
        <div class="mt-4 rounded-xl bg-surfaceMuted p-4">
          <p v-if="submission.frozenFields.length === 0 && answerRows(submission.answers).length === 0" class="text-sm text-textMuted">This submission does not include answers.</p>
          <dl v-else-if="submission.frozenFields.length" class="grid gap-3 text-sm">
            <div v-for="field in submission.frozenFields" :key="field.key" class="grid gap-1 rounded-lg bg-surface p-3 md:grid-cols-3">
              <dt class="font-bold text-ink">{{ field.label }}</dt>
              <dd class="text-textMuted md:col-span-2">{{ valueFor(submission.answers, field.key) }}</dd>
            </div>
          </dl>
          <dl v-else class="grid gap-3 text-sm">
            <div v-for="answer in answerRows(submission.answers)" :key="answer.key" class="grid gap-1 rounded-lg bg-surface p-3 md:grid-cols-3">
              <dt class="font-bold text-ink">{{ answer.key }}</dt>
              <dd class="text-textMuted md:col-span-2">{{ answer.value }}</dd>
            </div>
          </dl>
        </div>
        <form class="mt-4 grid gap-3" @submit.prevent="feedback.mutate({ submissionId: submission.id, trainerOverallComment: commentValue(submission.id, submission.feedback) })">
          <LcTextarea :model-value="commentValue(submission.id, submission.feedback)" label="Overall feedback" @update:model-value="setComment(submission.id, $event)" />
          <LcButton type="submit" :loading="feedback.isPending.value">Save feedback</LcButton>
        </form>
      </LcCard>
    </div>
  </section>
</template>
