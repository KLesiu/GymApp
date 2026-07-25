import { useQueryClient } from '@tanstack/vue-query'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { apiFetch } from '@/api/http/apiFetch'
import { tokenStorage } from '@/api/http/tokenStorage'
import { toSessionUser, toToken, type SessionUser } from '@/api/adapters/viewModels'

type Credentials = { name: string; password: string }
type RegisterPayload = Credentials & { email: string; cpassword: string }

export const useSessionStore = defineStore('session', () => {
  const user = ref<SessionUser | null>(null)
  const token = ref<string | null>(tokenStorage.token())
  const isRestoring = ref(false)
  const isAuthenticated = computed(() => Boolean(token.value && user.value?.role === 'TRAINER'))
  const queryClient = useQueryClient()

  const setSession = (nextToken: string, nextUser: SessionUser) => {
    token.value = nextToken
    user.value = nextUser
    tokenStorage.write({ token: nextToken, user: nextUser })
  }

  const restore = async () => {
    const stored = tokenStorage.read()
    if (!stored?.token) return
    isRestoring.value = true
    try {
      token.value = stored.token
      const me = await apiFetch.get<unknown>('/api/v1/auth/me')
      const nextUser = toSessionUser(me)
      if (nextUser.role !== 'TRAINER') throw new Error('TRAINER_ROLE_REQUIRED')
      setSession(stored.token, nextUser)
    } finally { isRestoring.value = false }
  }

  const login = async (credentials: Credentials) => {
    const response = await apiFetch.post<unknown>('/api/v1/auth/login', credentials)
    const nextToken = toToken(response)
    tokenStorage.write({ token: nextToken })
    token.value = nextToken
    const me = toSessionUser(await apiFetch.get<unknown>('/api/v1/auth/me'))
    if (me.role !== 'TRAINER') {
      logout()
      throw new Error('TRAINER_ROLE_REQUIRED')
    }
    setSession(nextToken, me)
  }

  const registerTrainer = async (payload: RegisterPayload) => { await apiFetch.post<unknown>('/api/v1/auth/trainer/register', payload) }

  const logout = () => {
    user.value = null
    token.value = null
    tokenStorage.clear()
    queryClient.clear()
  }

  return { user, token, isRestoring, isAuthenticated, restore, login, registerTrainer, logout }
})
