import type { PrismaClient } from "@prisma/client"

import { AccessService } from "../../core/access/access-service"
import { ForbiddenError, NotFoundError } from "../../core/errors/app-error"
import { WorkoutRepository } from "./workout.repository"

export class WorkoutService {
  private readonly repository: WorkoutRepository
  private readonly accessService: AccessService

  constructor(prisma: PrismaClient) {
    this.repository = new WorkoutRepository(prisma)
    this.accessService = new AccessService(prisma)
  }

  async createDraft(userId: string, input: Parameters<WorkoutRepository["createDraft"]>[1]) {
    await this.accessService.assertGymOwner(userId, input.gymId)
    return this.repository.createDraft(userId, input)
  }

  async finalize(userId: string, workoutId: string, idempotencyKey: string) {
    if (!idempotencyKey) {
      throw new ForbiddenError("IDEMPOTENCY_KEY_REQUIRED")
    }

    const finalized = await this.repository.finalizeWorkout(userId, workoutId, idempotencyKey)
    return finalized.payload.responseJson
  }

  async listHistory(userId: string) {
    return (await this.repository.listFinalized(userId)).map((workout) => ({
      _id: workout.id,
      id: workout.id,
      createdAt: workout.startedAt,
      completedAt: workout.completedAt,
      gym: workout.gym.name,
      planDay: workout.planDay ? { _id: workout.planDay.id, name: workout.planDay.name } : null,
      exercises: workout.sets.map((set) => ({
        _id: set.id,
        exerciseId: set.exerciseId,
        exerciseName: set.exercise.name,
        series: set.series,
        reps: set.reps,
        weight: Number(set.weight),
        unit: set.unit,
      })),
    }))
  }

  async getHistoryDetail(userId: string, workoutId: string) {
    const workout = await this.repository.findFinalized(userId, workoutId)
    if (!workout) {
      throw new NotFoundError("WORKOUT_NOT_FOUND")
    }

    return {
      _id: workout.id,
      id: workout.id,
      createdAt: workout.startedAt,
      completedAt: workout.completedAt,
      gym: workout.gym.name,
      planDay: workout.planDay ? { _id: workout.planDay.id, name: workout.planDay.name } : null,
      exercises: workout.sets.map((set) => ({
        _id: set.id,
        exerciseId: set.exerciseId,
        exerciseName: set.exercise.name,
        series: set.series,
        reps: set.reps,
        weight: Number(set.weight),
        unit: set.unit,
      })),
    }
  }

  async getTrainingDates(userId: string) {
    return (await this.repository.listFinalized(userId)).map((workout) => workout.startedAt)
  }

  async getEloChart(userId: string) {
    return (await this.repository.getEloChart(userId)).map((entry) => ({
      _id: entry.id,
      value: entry.newElo,
      date: entry.createdAt.toISOString(),
    }))
  }
}
