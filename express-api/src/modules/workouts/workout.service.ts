import { createHash } from "node:crypto"
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
    return this.mapWorkout(await this.repository.createDraft(userId, input))
  }

  async updateSets(
    userId: string,
    workoutId: string,
    input: Parameters<WorkoutRepository["updateSets"]>[2],
  ) {
    const workout = await this.repository.updateSets(userId, workoutId, input)
    if (!workout) {
      throw new NotFoundError("WORKOUT_NOT_FOUND")
    }
    return this.mapWorkout(workout)
  }

  async finalize(
    userId: string,
    workoutId: string,
    idempotencyKey: string,
    input?: Parameters<WorkoutRepository["finalizeWorkout"]>[4],
  ) {
    if (!idempotencyKey) {
      throw new ForbiddenError("IDEMPOTENCY_KEY_REQUIRED")
    }

    const requestHash = hashFinalizeRequest(paramsToStableJson(input ?? {}))
    const finalized = await this.repository.finalizeWorkout(
      userId,
      workoutId,
      idempotencyKey,
      requestHash,
      input,
    )
    return finalized.payload.responseJson
  }

  async listHistory(actorUserId: string, targetUserId = actorUserId) {
    await this.accessService.assertSelfOrActiveTrainerRelationship(actorUserId, targetUserId)
    return (await this.repository.listFinalized(targetUserId)).map((workout) => ({
      _id: workout.id,
      id: workout.id,
      status: workout.status,
      createdAt: workout.startedAt,
      completedAt: workout.completedAt,
      gymId: workout.gymId,
      gym: workout.gym.name,
      planDay: workout.planDay ? { _id: workout.planDay.id, name: workout.planDay.name } : null,
      exercises: workout.sets.map((set) => ({
        _id: set.id,
        exerciseId: set.exerciseId,
        exerciseName: set.exercise.name,
        series: set.series,
        reps: set.reps,
        weight: set.weight === null ? null : Number(set.weight),
        unit: set.unit,
      })),
    }))
  }

  async getHistoryDetail(userId: string, workoutId: string) {
    const workout = await this.repository.findWorkout(userId, workoutId)
    if (!workout) {
      throw new NotFoundError("WORKOUT_NOT_FOUND")
    }

    return this.mapWorkout(workout)
  }

  private mapWorkout(workout: NonNullable<Awaited<ReturnType<WorkoutRepository["findWorkout"]>>>) {
    return {
      _id: workout.id,
      id: workout.id,
      status: workout.status,
      createdAt: workout.startedAt,
      completedAt: workout.completedAt,
      gymId: workout.gymId,
      gym: workout.gym.name,
      planDay: workout.planDay ? { _id: workout.planDay.id, name: workout.planDay.name } : null,
      exercises: workout.sets.map((set) => ({
        _id: set.id,
        id: set.id,
        exerciseId: set.exerciseId,
        exerciseName: set.exercise.name,
        series: set.series,
        reps: set.reps,
        weight: set.weight === null ? null : Number(set.weight),
        unit: set.unit,
      })),
    }
  }

  async getTrainingDates(actorUserId: string, targetUserId = actorUserId) {
    await this.accessService.assertSelfOrActiveTrainerRelationship(actorUserId, targetUserId)
    return (await this.repository.listFinalized(targetUserId)).map((workout) => workout.startedAt)
  }

  async getEloChart(actorUserId: string, targetUserId = actorUserId) {
    await this.accessService.assertSelfOrActiveTrainerRelationship(actorUserId, targetUserId)
    return (await this.repository.getEloChart(targetUserId)).map((entry) => ({
      _id: entry.id,
      value: entry.newElo,
      date: entry.createdAt.toISOString(),
    }))
  }
}

const paramsToStableJson = (value: unknown): string => {
  if (Array.isArray(value)) {
    return `[${value.map(paramsToStableJson).join(",")}]`
  }
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>
    return `{${Object.keys(record)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${paramsToStableJson(record[key])}`)
      .join(",")}}`
  }
  return JSON.stringify(value)
}

const hashFinalizeRequest = (body: string) => createHash("sha256").update(body).digest("hex")
