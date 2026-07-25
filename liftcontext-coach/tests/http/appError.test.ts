import { describe, expect, it } from 'vitest'
import { mapHttpError, TransientHttpError } from '@/api/http/appError'

describe('mapHttpError', () => {
  it('maps validation envelopes with details', () => {
    const error = mapHttpError(400, { error: { code: 'VALIDATION_ERROR', details: ['name: required'] } })
    expect(error.kind).toBe('validation')
    expect(error.details).toEqual(['name: required'])
  })

  it('marks rate limits and server failures as transient for safe reads', () => {
    expect(mapHttpError(429, { error: { code: 'RATE_LIMIT' } })).toBeInstanceOf(TransientHttpError)
    expect(mapHttpError(503, { error: { code: 'UNAVAILABLE' } })).toBeInstanceOf(TransientHttpError)
  })
})
