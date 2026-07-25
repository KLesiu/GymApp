export type AppErrorKind = 'validation' | 'unauthorized' | 'forbidden' | 'not-found' | 'conflict' | 'rate-limit' | 'server' | 'network' | 'unknown'

export class AppError extends Error {
  constructor(public readonly status: number, public readonly code: string, public readonly kind: AppErrorKind, public readonly details: readonly string[] = []) {
    super(code)
    this.name = 'AppError'
  }
}

export class TransientHttpError extends AppError { constructor(status: number, code: string) { super(status, code, 'server'); this.name = 'TransientHttpError' } }

type ErrorEnvelope = { error?: { code?: string; message?: string; details?: readonly string[] } }

const kindForStatus = (status: number): AppErrorKind => {
  if (status === 400 || status === 422) return 'validation'
  if (status === 401) return 'unauthorized'
  if (status === 403) return 'forbidden'
  if (status === 404) return 'not-found'
  if (status === 409) return 'conflict'
  if (status === 429) return 'rate-limit'
  if (status >= 500) return 'server'
  return 'unknown'
}

export const mapHttpError = (status: number, body: unknown): AppError => {
  const envelope = body as ErrorEnvelope
  const code = envelope.error?.code ?? `HTTP_${status}`
  const details = envelope.error?.details ?? []
  if (status === 429 || status >= 500) return new TransientHttpError(status, code)
  return new AppError(status, code, kindForStatus(status), details)
}
