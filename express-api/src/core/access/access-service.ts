import type { PrismaClient } from "@prisma/client"

import { ForbiddenError } from "../errors/app-error"

export class AccessService {
  constructor(private readonly prisma: PrismaClient) {}

  async assertSelfOrActiveTrainerRelationship(
    actorUserId: string,
    targetUserId: string,
  ): Promise<void> {
    if (actorUserId === targetUserId) {
      return
    }

    const relationship = await this.prisma.trainerRelationship.findFirst({
      where: {
        trainerId: actorUserId,
        traineeId: targetUserId,
        status: "ACTIVE",
      },
    })

    if (!relationship) {
      throw new ForbiddenError("ACTIVE_TRAINER_RELATIONSHIP_REQUIRED")
    }
  }

  async assertGymOwner(userId: string, gymId: string): Promise<void> {
    const gym = await this.prisma.gym.findFirst({
      where: { id: gymId, ownerId: userId, deletedAt: null },
    })

    if (!gym) {
      throw new ForbiddenError("GYM_ACCESS_DENIED")
    }
  }

  async assertExerciseOwner(userId: string, exerciseId: string): Promise<void> {
    const exercise = await this.prisma.exercise.findFirst({
      where: { id: exerciseId, ownerId: userId },
    })

    if (!exercise) {
      throw new ForbiddenError("EXERCISE_ACCESS_DENIED")
    }
  }

  async assertPlanOwner(userId: string, planId: string): Promise<void> {
    const plan = await this.prisma.plan.findFirst({
      where: { id: planId, ownerId: userId },
    })

    if (!plan) {
      throw new ForbiddenError("PLAN_ACCESS_DENIED")
    }
  }
}
