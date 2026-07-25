import { env } from '@/env'
import { tokenStorage } from './tokenStorage'
import { mapHttpError, AppError } from './appError'

const parseBody = async (response: Response): Promise<unknown> => {
  const text = await response.text()
  if (!text) return undefined
  try { return JSON.parse(text) } catch { return text }
}

export async function orvalMutator<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  headers.set('Accept', 'application/json')
  headers.set('Accept-Language', navigator.language || 'pl')
  if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  const token = tokenStorage.token()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  let response: Response
  try { response = await fetch(`${env.VITE_API_BASE_URL}${url}`, { ...options, headers }) } catch { throw new AppError(0, 'NETWORK_ERROR', 'network') }
  const body = await parseBody(response)
  if (!response.ok) {
    const error = mapHttpError(response.status, body)
    if (error.kind === 'unauthorized') tokenStorage.clear()
    throw error
  }
  return body as T
}
