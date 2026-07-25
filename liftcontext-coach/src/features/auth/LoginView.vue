<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useSessionStore } from '@/stores/session'
import LcButton from '@/components/ui/LcButton.vue'
import LcInput from '@/components/ui/LcInput.vue'
import LcLogo from '@/components/ui/LcLogo.vue'

const form = reactive({ name: '', password: '' })
const error = ref('')
const loading = ref(false)
const session = useSessionStore()
const router = useRouter()
const route = useRoute()

const submit = async () => {
  error.value = ''
  loading.value = true
  try {
    await session.login(form)
    const redirect = typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/') ? route.query.redirect : '/'
    await router.push(redirect)
  } catch {
    error.value = 'Login failed or this account does not have the TRAINER role.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="grid min-h-screen place-items-center bg-canvas p-4">
    <section class="w-full max-w-md rounded-xl border border-border bg-surface p-8 shadow-card">
      <LcLogo />
      <p class="mt-6 text-textMuted">Sign in as a coach to work with your trainees.</p>
      <form class="mt-6 grid gap-4" @submit.prevent="submit">
        <LcInput v-model="form.name" label="Username" autocomplete="username" required />
        <LcInput v-model="form.password" label="Password" type="password" autocomplete="current-password" required />
        <p v-if="error" class="rounded-lg bg-danger/10 p-3 text-sm text-danger">{{ error }}</p>
        <LcButton type="submit" :loading="loading">Sign in</LcButton>
      </form>
      <RouterLink class="mt-4 inline-block text-sm font-bold text-contextDark" to="/register">Create a coach account</RouterLink>
    </section>
  </main>
</template>
