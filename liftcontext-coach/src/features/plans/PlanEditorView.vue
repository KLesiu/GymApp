<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { z } from 'zod'
import { useCreatePlan } from '@/api/queries/domainQueries'
import LcButton from '@/components/ui/LcButton.vue'
import LcInput from '@/components/ui/LcInput.vue'
import LcTextarea from '@/components/ui/LcTextarea.vue'
import LcCard from '@/components/ui/LcCard.vue'
const schema = z.object({ name: z.string().min(2), description: z.string().optional(), weeksCount: z.coerce.number().int().min(1).max(12) })
const form = reactive({ name: '', description: '', weeksCount: 1 })
const error = ref('')
const createPlan = useCreatePlan()
const router = useRouter()
const submit = async () => { const parsed = schema.safeParse(form); if (!parsed.success) { error.value = 'Provide a plan name and 1-12 weeks.'; return } const body = { name: parsed.data.name, description: parsed.data.description, weeksCount: parsed.data.weeksCount, days: [{ name: 'Week 1 · Day 1', weekNumber: 1, orderIndex: 0, exercises: [] }] }; await createPlan.mutateAsync(body); await router.push('/plans') }
</script>
<template><section class="grid gap-6"><div class="overflow-hidden rounded-2xl border border-border bg-surface shadow-card"><div class="border-b border-border bg-gradient-to-br from-surface via-canvas to-surfaceMuted p-6"><p class="font-display text-xs font-bold uppercase tracking-[0.28em] text-contextDark">Training plans</p><h1 class="mt-3 font-display text-3xl font-bold text-ink">Plan editor</h1><p class="mt-2 max-w-3xl text-sm leading-6 text-textMuted">Create a clean training block that can be refined and assigned to trainees.</p></div></div><LcCard><form class="grid gap-4 lg:max-w-3xl" @submit.prevent="submit"><LcInput v-model="form.name" label="Plan name" required/><LcTextarea v-model="form.description" label="Description"/><LcInput v-model.number="form.weeksCount" label="Weeks count" type="number" min="1" max="12"/><p class="text-sm text-textMuted">Start with the core plan details. You can expand the training structure as the plan evolves.</p><p v-if="error" class="text-sm text-danger">{{ error }}</p><LcButton type="submit" :loading="createPlan.isPending.value">Save plan</LcButton></form></LcCard></section></template>
