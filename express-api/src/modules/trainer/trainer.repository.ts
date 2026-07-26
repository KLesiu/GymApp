import type { PrismaClient } from "@prisma/client"

export class TrainerRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async createRelationship(trainerId: string, traineeId: string) {
    return this.prisma.trainerRelationship.upsert({
      where: { trainerId_traineeId: { trainerId, traineeId } },
      update: { status: "PENDING", detachedAt: null, activatedAt: null },
      create: { trainerId, traineeId, status: "PENDING" },
    })
  }

  async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: { roles: true },
    })
  }

  async findRelationshipById(relationshipId: string) {
    return this.prisma.trainerRelationship.findUnique({ where: { id: relationshipId } })
  }

  async activateRelationship(relationshipId: string) {
    return this.prisma.$transaction(async (transaction) => {
      const relationship = await transaction.trainerRelationship.findUnique({
        where: { id: relationshipId },
      })
      if (!relationship) {
        return null
      }

      if (relationship.status !== "PENDING") {
        return "RELATIONSHIP_NOT_PENDING" as const
      }

      const activeCount = await transaction.trainerRelationship.count({
        where: { traineeId: relationship.traineeId, status: "ACTIVE", id: { not: relationshipId } },
      })
      if (activeCount > 0) {
        return "ACTIVE_TRAINER_CONFLICT" as const
      }

      return transaction.trainerRelationship.update({
        where: { id: relationshipId, status: "PENDING" },
        data: { status: "ACTIVE", activatedAt: new Date(), detachedAt: null },
      })
    })
  }

  async listPendingForTrainee(traineeId: string) {
    return this.prisma.trainerRelationship.findMany({
      where: { traineeId, status: "PENDING" },
      include: { trainer: true },
      orderBy: { createdAt: "asc" },
    })
  }

  async listForTrainer(trainerId: string) {
    return this.prisma.trainerRelationship.findMany({
      where: { trainerId },
      include: { trainee: true },
      orderBy: { createdAt: "desc" },
    })
  }

  async rejectRelationship(relationshipId: string) {
    return this.prisma.trainerRelationship.update({
      where: { id: relationshipId },
      data: { status: "REJECTED" },
    })
  }

  async listActiveTrainees(trainerId: string) {
    return this.prisma.trainerRelationship.findMany({
      where: { trainerId, status: "ACTIVE" },
      include: { trainee: true },
      orderBy: { createdAt: "asc" },
    })
  }

  async findActiveTrainerForTrainee(traineeId: string) {
    return this.prisma.trainerRelationship.findFirst({
      where: { traineeId, status: "ACTIVE" },
      include: { trainer: true },
      orderBy: { activatedAt: "desc" },
    })
  }

  async detachByTrainee(traineeId: string) {
    return this.prisma.trainerRelationship.updateMany({
      where: { traineeId, status: "ACTIVE" },
      data: { status: "DETACHED", detachedAt: new Date() },
    })
  }

  async detachByTrainer(trainerId: string, traineeId: string) {
    return this.prisma.trainerRelationship.updateMany({
      where: { trainerId, traineeId, status: "ACTIVE" },
      data: { status: "DETACHED", detachedAt: new Date() },
    })
  }
}
