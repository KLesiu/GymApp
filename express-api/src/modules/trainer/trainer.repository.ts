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

  async findRelationshipById(relationshipId: string) {
    return this.prisma.trainerRelationship.findUnique({ where: { id: relationshipId } })
  }

  async activateRelationship(relationshipId: string) {
    return this.prisma.trainerRelationship.update({
      where: { id: relationshipId },
      data: { status: "ACTIVE", activatedAt: new Date(), detachedAt: null },
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
