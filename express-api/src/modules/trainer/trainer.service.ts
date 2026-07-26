import { AppError, ForbiddenError, NotFoundError } from "../../core/errors/app-error"
import type { TrainerRepository } from "./trainer.repository"

export class TrainerService {
  constructor(private readonly repository: TrainerRepository) {}

  async invite(trainerId: string, traineeCode: string) {
    const trainee = await this.repository.findUserByConnectionCode(traineeCode.toUpperCase())
    if (!trainee) {
      throw new NotFoundError("TRAINEE_NOT_FOUND")
    }

    if (trainee.id === trainerId) {
      throw new AppError("TRAINER_CANNOT_INVITE_SELF", 409)
    }

    if (!trainee.roles.some((role) => role.role === "TRAINEE")) {
      throw new AppError("TARGET_NOT_TRAINEE", 409)
    }

    const traineeId = trainee.id
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

    if (relationship.status !== "PENDING") {
      throw new AppError("RELATIONSHIP_NOT_PENDING", 409)
    }

    const result = await this.repository.activateRelationship(relationshipId)
    if (result === null) {
      throw new NotFoundError("RELATIONSHIP_NOT_FOUND")
    }
    if (result === "ACTIVE_TRAINER_CONFLICT") {
      throw new AppError("ACTIVE_TRAINER_CONFLICT", 409)
    }
    if (result === "RELATIONSHIP_NOT_PENDING") {
      throw new AppError("RELATIONSHIP_NOT_PENDING", 409)
    }
    return result
  }

  async listPending(traineeId: string) {
    const items = await this.repository.listPendingForTrainee(traineeId)
    return items.map((item) => ({
      id: item.id,
      _id: item.id,
      status: item.status,
      createdAt: item.createdAt,
      trainer: {
        id: item.trainer.id,
        _id: item.trainer.id,
        name: item.trainer.name,
      },
    }))
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
      id: item.id,
      trainee: {
        id: item.trainee.id,
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
      id: relationship.id,
      status: relationship.status,
      activatedAt: relationship.activatedAt,
      trainer: {
        id: relationship.trainer.id,
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
