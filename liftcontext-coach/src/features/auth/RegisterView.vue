<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useSessionStore } from '@/stores/session'
import LcButton from '@/components/ui/LcButton.vue'
import LcInput from '@/components/ui/LcInput.vue'

const form = reactive({ name: '', email: '', password: '', cpassword: '' })
const status = ref('')
const loading = ref(false)
const router = useRouter()
const session = useSessionStore()

const submit = async () => {
  loading.value = true
  status.value = ''
  try {
    await session.registerTrainer(form)
    status.value = 'Coach account created. You can sign in now.'
    await router.push('/login')
  } catch {
    status.value = 'Registration failed.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="grid min-h-screen place-items-center p-4">
    <section class="w-full max-w-md rounded-xl border border-border bg-surface p-8">
      <h1 class="font-display text-2xl font-bold">Coach registration</h1>
      <form class="mt-6 grid gap-4" @submit.prevent="submit">
        <LcInput v-model="form.name" label="Name" required />
        <LcInput v-model="form.email" label="Email" type="email" required />
        <LcInput v-model="form.password" label="Password" type="password" required />
        <LcInput v-model="form.cpassword" label="Repeat password" type="password" required />
        <p v-if="status" class="text-sm text-textMuted">{{ status }}</p>
        <LcButton type="submit" :loading="loading">Create account</LcButton>
      </form>
      <RouterLink to="/login" class="mt-4 inline-block text-sm font-bold text-contextDark">Back to sign in</RouterLink>
    </section>
  </main>
</template>
