<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useTraineesQuery, useInviteRelationship } from '@/api/queries/domainQueries'
import LcButton from '@/components/ui/LcButton.vue'
import LcInput from '@/components/ui/LcInput.vue'
import LcCard from '@/components/ui/LcCard.vue'
import LcBadge from '@/components/ui/LcBadge.vue'
import LcEmptyState from '@/components/ui/LcEmptyState.vue'
import LcErrorState from '@/components/ui/LcErrorState.vue'
import LcSkeleton from '@/components/ui/LcSkeleton.vue'

const search = ref('')
const traineeCode = ref('')
const query = useTraineesQuery()
const invite = useInviteRelationship()
const filtered = computed(() => (query.data.value ?? []).filter((t) => t.name.toLowerCase().includes(search.value.toLowerCase()) || t.email?.toLowerCase().includes(search.value.toLowerCase())))
const submitInvite = async () => { if (traineeCode.value) { await invite.mutateAsync(traineeCode.value); traineeCode.value = '' } }
</script>

<template>
  <section class="grid gap-6">
    <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div><h1 class="font-display text-3xl font-bold">Trainees</h1><p class="mt-2 text-textMuted">Active coaching relationships from `/api/v1/trainer/trainees`.</p></div>
      <form class="flex gap-2" @submit.prevent="submitInvite"><LcInput v-model="traineeCode" label="Trainee code" /><LcButton type="submit" :loading="invite.isPending.value">Invite</LcButton></form>
    </div>
    <LcInput v-model="search" label="Search" />
    <LcSkeleton v-if="query.isLoading.value" />
    <LcErrorState v-else-if="query.isError.value" @retry="query.refetch()" />
    <LcEmptyState v-else-if="filtered.length === 0" title="No trainees yet" description="Create a relationship with the trainee public connection code." />
    <div v-else class="grid gap-3">
      <RouterLink v-for="trainee in filtered" :key="trainee.id" :to="`/trainees/${trainee.id}`">
        <LcCard><div class="flex flex-wrap items-center justify-between gap-3"><div><h2 class="font-display text-xl font-bold">{{ trainee.name }}</h2><p class="text-sm text-textMuted">{{ trainee.email ?? trainee.id }}</p></div><div class="flex items-center gap-2"><LcBadge tone="success">{{ trainee.relationshipStatus }}</LcBadge><span class="font-display font-bold">Elo {{ trainee.elo ?? '—' }}</span></div></div></LcCard>
      </RouterLink>
    </div>
  </section>
</template>
