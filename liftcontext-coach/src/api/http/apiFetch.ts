import { orvalMutator } from './orvalMutator'

export type JsonRecord = Record<string, unknown>

const queryString = (query?: Record<string, string | number | boolean | undefined>) => {
  const params = new URLSearchParams()
  Object.entries(query ?? {}).forEach(([key, value]) => { if (value !== undefined) params.set(key, String(value)) })
  const text = params.toString()
  return text ? `?${text}` : ''
}

export const apiFetch = {
  get: <T>(path: string, query?: Record<string, string | number | boolean | undefined>, signal?: AbortSignal) => orvalMutator<T>(`${path}${queryString(query)}`, { method: 'GET', signal }),
  post: <T>(path: string, body?: unknown, signal?: AbortSignal) => orvalMutator<T>(path, { method: 'POST', body: body === undefined ? undefined : JSON.stringify(body), signal }),
  patch: <T>(path: string, body?: unknown, signal?: AbortSignal) => orvalMutator<T>(path, { method: 'PATCH', body: body === undefined ? undefined : JSON.stringify(body), signal }),
  delete: <T>(path: string, signal?: AbortSignal) => orvalMutator<T>(path, { method: 'DELETE', signal }),
}
