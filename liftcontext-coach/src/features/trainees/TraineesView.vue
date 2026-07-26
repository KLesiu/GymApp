<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useInviteRelationship, useTrainerInvitationsQuery, useTraineesQuery } from '@/api/queries/domainQueries'
import LcBadge from '@/components/ui/LcBadge.vue'
import LcButton from '@/components/ui/LcButton.vue'
import LcCard from '@/components/ui/LcCard.vue'
import LcEmptyState from '@/components/ui/LcEmptyState.vue'
import LcErrorState from '@/components/ui/LcErrorState.vue'
import LcInput from '@/components/ui/LcInput.vue'
import LcSkeleton from '@/components/ui/LcSkeleton.vue'

const search = ref('')
const traineeEmail = ref('')
const statusFilter = ref('ALL')
const message = ref<string | null>(null)
const query = useTraineesQuery()
const invitations = useTrainerInvitationsQuery()
const invite = useInviteRelationship()

const statuses = ['ALL', 'PENDING', 'ACTIVE', 'REJECTED', 'DETACHED'] as const
const filteredTrainees = computed(() => (query.data.value ?? []).filter((trainee) => trainee.name.toLowerCase().includes(search.value.toLowerCase()) || trainee.email?.toLowerCase().includes(search.value.toLowerCase())))
const filteredInvitations = computed(() => (invitations.data.value ?? []).filter((item) => {
  const matchesStatus = statusFilter.value === 'ALL' || item.status === statusFilter.value
  const term = search.value.toLowerCase()
  const matchesSearch = item.traineeEmail.toLowerCase().includes(term) || item.traineeName.toLowerCase().includes(term)
  return matchesStatus && matchesSearch
}))
const activeCount = computed(() => (query.data.value ?? []).length)
const pendingCount = computed(() => (invitations.data.value ?? []).filter((item) => item.status === 'PENDING').length)

const submitInvite = async () => {
  message.value = null
  const email = traineeEmail.value.trim().toLowerCase()
  if (!email) {
    message.value = 'Provide trainee email.'
    return
  }
  await invite.mutateAsync(email)
  traineeEmail.value = ''
  message.value = `Invitation created for ${email}.`
}

const statusTone = (status: string) => status === 'ACTIVE' ? 'success' : status === 'PENDING' ? 'warning' : status === 'REJECTED' ? 'danger' : 'neutral'
const formatDate = (value?: string | null) => value ? new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—'
</script>

<template>
  <section class="grid gap-6">
    <div class="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
      <div class="grid gap-6 border-b border-border bg-gradient-to-br from-surface via-canvas to-surfaceMuted p-6 lg:grid-cols-[1fr_auto] lg:items-start">
        <div>
          <p class="font-display text-xs font-bold uppercase tracking-[0.28em] text-contextDark">New invitation</p>
          <h1 class="mt-3 font-display text-3xl font-bold text-ink">Invite a trainee by email</h1>
          <p class="mt-2 max-w-2xl text-sm leading-6 text-textMuted">Send a coaching invitation to an existing LiftContext trainee account. The trainee will see it in the mobile app and can accept or reject the relationship.</p>
        </div>
        <div class="grid grid-cols-2 gap-3 rounded-xl border border-border bg-surface/80 p-4 text-sm">
          <div><p class="text-textMuted">Active trainees</p><p class="font-display text-2xl font-bold text-contextDark">{{ activeCount }}</p></div>
          <div><p class="text-textMuted">Pending invites</p><p class="font-display text-2xl font-bold text-reference">{{ pendingCount }}</p></div>
        </div>
      </div>
      <form class="grid gap-4 p-6 lg:grid-cols-[minmax(260px,1fr)_220px_220px_auto] lg:items-end" @submit.prevent="submitInvite">
        <LcInput v-model="traineeEmail" label="Trainee email" type="email" autocomplete="email" required hint="Example: trainee@example.com" />
        <label class="grid gap-1 text-sm font-semibold text-ink"><span>Preferred language</span><select class="min-h-12 rounded-lg border border-border bg-surface px-3 py-2 font-normal outline-none transition focus:border-contextDark"><option>English</option></select></label>
        <label class="grid gap-1 text-sm font-semibold text-ink"><span>Preferred time zone</span><select class="min-h-12 rounded-lg border border-border bg-surface px-3 py-2 font-normal outline-none transition focus:border-contextDark"><option>Europe/Warsaw</option></select></label>
        <LcButton type="submit" :loading="invite.isPending.value">Send invitation</LcButton>
      </form>
      <p v-if="message" class="px-6 pb-5 text-sm font-semibold" :class="message.includes('created') ? 'text-success' : 'text-danger'">{{ message }}</p>
    </div>

    <LcCard>
      <div class="grid gap-4">
        <div>
          <p class="font-display text-xs font-bold uppercase tracking-[0.28em] text-contextDark">Invitation history</p>
          <h2 class="mt-2 font-display text-2xl font-bold">Recent invitations</h2>
          <p class="mt-2 text-sm text-textMuted">Search by email or trainee name, filter by relationship status, and keep the active roster one click away.</p>
        </div>
        <div class="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
          <LcInput v-model="search" label="Search by email or name" />
          <div class="flex flex-wrap gap-2">
            <button v-for="status in statuses" :key="status" type="button" class="rounded-full border px-4 py-2 text-sm font-bold transition" :class="statusFilter === status ? 'border-contextDark bg-contextDark text-white' : 'border-border bg-surface text-textMuted hover:border-contextDark hover:text-contextDark'" @click="statusFilter = status">{{ status === 'ALL' ? 'All' : status.toLowerCase() }}</button>
          </div>
        </div>

        <LcSkeleton v-if="query.isLoading.value || invitations.isLoading.value" />
        <LcErrorState v-else-if="query.isError.value || invitations.isError.value" @retry="() => { query.refetch(); invitations.refetch() }" />
        <div v-else class="overflow-hidden rounded-xl border border-border">
          <table class="w-full min-w-[760px] text-left text-sm">
            <thead class="bg-surfaceMuted text-xs uppercase tracking-[0.22em] text-textMuted"><tr><th class="px-4 py-3">Invitee email</th><th class="px-4 py-3">Trainee</th><th class="px-4 py-3">Status</th><th class="px-4 py-3">Sent date</th><th class="px-4 py-3">Actions</th></tr></thead>
            <tbody class="divide-y divide-border bg-surface">
              <tr v-for="item in filteredInvitations" :key="item.id" class="transition hover:bg-surfaceMuted/60"><td class="px-4 py-4 font-bold text-ink">{{ item.traineeEmail }}<p class="font-mono text-xs font-normal text-textMuted">{{ item.id.slice(0, 12).toUpperCase() }}</p></td><td class="px-4 py-4"><p class="font-bold">{{ item.traineeName }}</p><p class="text-textMuted">{{ item.traineeEmail }}</p></td><td class="px-4 py-4"><LcBadge :tone="statusTone(item.status)">{{ item.status.toLowerCase() }}</LcBadge></td><td class="px-4 py-4"><p class="font-semibold">{{ formatDate(item.createdAt) }}</p><p v-if="item.activatedAt" class="text-xs text-textMuted">Accepted: {{ formatDate(item.activatedAt) }}</p><p v-if="item.detachedAt" class="text-xs text-textMuted">Detached: {{ formatDate(item.detachedAt) }}</p></td><td class="px-4 py-4"><RouterLink v-if="item.status === 'ACTIVE'" :to="`/trainees/${item.traineeId}`" class="rounded-full border border-contextDark px-4 py-2 text-xs font-bold text-contextDark hover:bg-contextDark hover:text-white">Open</RouterLink><span v-else class="text-xs font-bold uppercase tracking-[0.18em] text-textMuted">Waiting</span></td></tr>
              <tr v-if="filteredInvitations.length === 0"><td colspan="5" class="px-4 py-10"><LcEmptyState title="No invitations found" description="Send the first invitation by trainee email or adjust your filters." /></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </LcCard>

    <div v-if="filteredTrainees.length" class="grid gap-3 md:grid-cols-2">
      <RouterLink v-for="trainee in filteredTrainees" :key="trainee.id" :to="`/trainees/${trainee.id}`">
        <LcCard><div class="flex flex-wrap items-center justify-between gap-3"><div><h2 class="font-display text-xl font-bold">{{ trainee.name }}</h2><p class="text-sm text-textMuted">{{ trainee.email ?? trainee.id }}</p></div><div class="flex items-center gap-2"><LcBadge tone="success">{{ trainee.relationshipStatus }}</LcBadge><span class="font-display font-bold">Elo {{ trainee.elo ?? '—' }}</span></div></div></LcCard>
      </RouterLink>
    </div>
  </section>
</template>
