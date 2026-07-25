import { ForbiddenError, NotFoundError } from "../../core/errors/app-error"
import type { TrainerRepository } from "./trainer.repository"

export class TrainerService {
  constructor(private readonly repository: TrainerRepository) {}

  async invite(trainerId: string, traineeId: string) {
    return this.repository.createRelationship(trainerId, traineeId)
  }

  async accept(traineeId: string, relationshipId: string) {
    const relationship = await this.repository.findRelationshipById(relationshipId)

    if (!relationship) {
      throw new NotFoundError("RELATIONSHIP_NOT_FOUND")
    }

    if (relationship.traineeId !== traineeId) {
      throw new ForbiddenError("RELATIONSHIP_ACCESS_DENIED")
    }

    return this.repository.activateRelationship(relationshipId)
  }

  async reject(traineeId: string, relationshipId: string) {
    const relationship = await this.repository.findRelationshipById(relationshipId)

    if (!relationship) {
      throw new NotFoundError("RELATIONSHIP_NOT_FOUND")
    }

    if (relationship.traineeId !== traineeId) {
      throw new ForbiddenError("RELATIONSHIP_ACCESS_DENIED")
    }

    return this.repository.rejectRelationship(relationshipId)
  }

  async listTrainees(trainerId: string) {
    const items = await this.repository.listActiveTrainees(trainerId)
    return items.map((item) => ({
      _id: item.id,
      trainee: {
        _id: item.trainee.id,
        name: item.trainee.name,
        email: item.trainee.email,
        elo: item.trainee.elo,
      },
      status: item.status,
    }))
  }

  async getCurrentTrainer(traineeId: string) {
    const relationship = await this.repository.findActiveTrainerForTrainee(traineeId)
    if (!relationship) {
      return null
    }

    return {
      _id: relationship.id,
      status: relationship.status,
      activatedAt: relationship.activatedAt,
      trainer: {
        _id: relationship.trainer.id,
        name: relationship.trainer.name,
        email: relationship.trainer.email,
      },
    }
  }

  async detachTrainee(traineeId: string) {
    const result = await this.repository.detachByTrainee(traineeId)
    if (result.count === 0) {
      throw new NotFoundError("RELATIONSHIP_NOT_FOUND")
    }
    return { msg: "DETACHED" }
  }

  async unlinkTrainerTrainee(trainerId: string, traineeId: string) {
    const result = await this.repository.detachByTrainer(trainerId, traineeId)
    if (result.count === 0) {
      throw new NotFoundError("RELATIONSHIP_NOT_FOUND")
    }
    return { msg: "DETACHED" }
  }
}
