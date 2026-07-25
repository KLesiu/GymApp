const key = 'liftcontext.coach.session'

export type StoredSession = { token: string; user?: unknown }

export const tokenStorage = {
  read(): StoredSession | null {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    try { return JSON.parse(raw) as StoredSession } catch { return null }
  },
  write(session: StoredSession): void { localStorage.setItem(key, JSON.stringify(session)) },
  clear(): void { localStorage.removeItem(key) },
  token(): string | null { return tokenStorage.read()?.token ?? null },
}
