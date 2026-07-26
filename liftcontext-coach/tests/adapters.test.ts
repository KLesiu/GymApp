import { describe, expect, it } from 'vitest'
import { toChartPoints, toSessionUser, toTrainee, toWorkout, unwrapList } from '@/api/adapters/viewModels'

describe('view model adapters', () => {
  it('unwraps collection envelopes without leaking DTO shape to UI', () => {
    expect(unwrapList({ trainees: [{ id: '1' }] }, ['trainees'])).toEqual([{ id: '1' }])
  })

  it('maps trainee summaries', () => {
    expect(toTrainee({ trainee: { id: 'u1', name: 'Alex', elo: 1200 }, status: 'ACTIVE' })).toMatchObject({ id: 'u1', name: 'Alex', relationshipStatus: 'ACTIVE', elo: 1200 })
  })

  it('maps trainer sessions from backend roles array', () => {
    expect(toSessionUser({ _id: 'u1', name: 'Coach', roles: ['TRAINER'] })).toMatchObject({ id: 'u1', role: 'TRAINER' })
  })

  it('maps trainer sessions from permission claims', () => {
    expect(toSessionUser({ _id: 'u1', name: 'Coach', permissionClaims: ['role:TRAINER'] }).role).toBe('TRAINER')
  })

  it('keeps workout status explicit so drafts can be filtered out', () => {
    expect(toWorkout({ id: 'w1', status: 'DRAFT', sets: [] }).status).toBe('DRAFT')
  })

  it('maps finalized workout history returned by the backend list endpoint', () => {
    expect(
      toWorkout({
        _id: 'w1',
        status: 'FINALIZED',
        completedAt: '2026-07-26T20:33:35.112Z',
        gym: 'Seed Gym',
        planDay: { name: 'Push day' },
        exercises: [{ _id: 's1' }, { _id: 's2' }],
      }),
    ).toMatchObject({
      id: 'w1',
      status: 'FINALIZED',
      gymName: 'Seed Gym',
      title: 'Push day',
      summary: '2 sets',
    })
  })

  it('formats chart point labels for readable tooltips', () => {
    const [point] = toChartPoints([{ date: '2026-07-26T20:33:35.112Z', value: 1024 }])

    expect(point?.label).not.toBe('2026-07-26T20:33:35.112Z')
    expect(point?.label).toContain('2026')
  })
})
