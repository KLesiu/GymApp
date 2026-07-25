import { describe, expect, it } from 'vitest'
import { queryKeys } from '@/api/queries/queryKeys'

describe('query keys', () => {
  it('includes trainee id in protected trainee data keys', () => {
    expect(queryKeys.traineeElo('trainee-1')).toContain('trainee-1')
    expect(queryKeys.traineeMeasurements('trainee-1')).toContain('trainee-1')
    expect(queryKeys.traineeWorkouts('trainee-1')).toContain('trainee-1')
    expect(queryKeys.traineeReports('trainee-1')).toContain('trainee-1')
  })
})
