import { describe, expect, it } from 'vitest'
import { toTrainee, toWorkout, unwrapList } from '@/api/adapters/viewModels'

describe('view model adapters', () => {
  it('unwraps collection envelopes without leaking DTO shape to UI', () => {
    expect(unwrapList({ trainees: [{ id: '1' }] }, ['trainees'])).toEqual([{ id: '1' }])
  })

  it('maps trainee summaries', () => {
    expect(toTrainee({ trainee: { id: 'u1', name: 'Alex', elo: 1200 }, status: 'ACTIVE' })).toMatchObject({ id: 'u1', name: 'Alex', relationshipStatus: 'ACTIVE', elo: 1200 })
  })

  it('keeps workout status explicit so drafts can be filtered out', () => {
    expect(toWorkout({ id: 'w1', status: 'DRAFT', sets: [] }).status).toBe('DRAFT')
  })
})
