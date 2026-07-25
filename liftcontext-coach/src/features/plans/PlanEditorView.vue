<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { z } from 'zod'
import { useCreatePlan } from '@/api/queries/domainQueries'
import LcButton from '@/components/ui/LcButton.vue'
import LcInput from '@/components/ui/LcInput.vue'
import LcTextarea from '@/components/ui/LcTextarea.vue'
import LcCard from '@/components/ui/LcCard.vue'
const schema = z.object({ name: z.string().min(2), description: z.string().optional() })
const form = reactive({ name: '', description: '' })
const error = ref('')
const createPlan = useCreatePlan()
const router = useRouter()
const submit = async () => { const parsed = schema.safeParse(form); if (!parsed.success) { error.value = 'Provide at least a plan name.'; return } const body = { name: parsed.data.name, description: parsed.data.description, days: [{ name: 'Day 1', orderIndex: 0, exercises: [] }] }; await createPlan.mutateAsync(body); await router.push('/plans') }
</script>
<template><section class="grid gap-6"><h1 class="font-display text-3xl font-bold">Plan editor</h1><LcCard><form class="grid gap-4" @submit.prevent="submit"><LcInput v-model="form.name" label="Plan name" required/><LcTextarea v-model="form.description" label="Description"/><p class="text-sm text-textMuted">Plan days and exercises follow the OpenAPI DTO. This minimal editor creates a starter day; detailed day editing is marked as limited until reorder/update endpoints are available.</p><p v-if="error" class="text-sm text-danger">{{ error }}</p><LcButton type="submit" :loading="createPlan.isPending.value">Save plan</LcButton></form></LcCard></section></template>
