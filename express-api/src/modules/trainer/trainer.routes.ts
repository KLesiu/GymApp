import type { PrismaClient } from "@prisma/client"
import type { Request } from "express"
import { Router } from "express"

import { requireAuth, requireRole } from "../../core/auth/middleware"
import { UnauthorizedError } from "../../core/errors/app-error"
import { validate } from "../../core/http/validate"
import { TrainerRepository } from "./trainer.repository"
import {
  relationshipParamsSchema,
  relationshipSchema,
  traineeParamsSchema,
} from "./trainer.schemas"
import { TrainerService } from "./trainer.service"

const getActorId = (request: Request) => {
  const actor = request.authActor
  if (!actor) {
    throw new UnauthorizedError()
  }
  return actor.user.id
}

export const buildTrainerRouter = (prisma: PrismaClient) => {
  const router = Router()
  const service = new TrainerService(new TrainerRepository(prisma))

  router.post(
    "/trainer/relationships",
    requireAuth,
    requireRole("TRAINER"),
    validate({ body: relationshipSchema }),
    async (request, response) => {
      const body = relationshipSchema.parse(request.body)
      response.status(201).json(await service.invite(getActorId(request), body.traineeEmail))
    },
  )

  router.get(
    "/trainer/relationships",
    requireAuth,
    requireRole("TRAINER"),
    async (request, response) => {
      response.json(await service.listInvitations(getActorId(request)))
    },
  )

  router.post(
    "/trainee/relationships/:relationshipId/accept",
    requireAuth,
    requireRole("TRAINEE"),
    validate({ params: relationshipParamsSchema }),
    async (request, response) => {
      const params = relationshipParamsSchema.parse(request.params)
      response.json(await service.accept(getActorId(request), params.relationshipId))
    },
  )

  router.post(
    "/trainee/relationships/:relationshipId/reject",
    requireAuth,
    requireRole("TRAINEE"),
    validate({ params: relationshipParamsSchema }),
    async (request, response) => {
      const params = relationshipParamsSchema.parse(request.params)
      response.json(await service.reject(getActorId(request), params.relationshipId))
    },
  )

  router.get(
    "/trainee/relationships",
    requireAuth,
    requireRole("TRAINEE"),
    async (request, response) => {
      response.json(await service.listPending(getActorId(request)))
    },
  )

  router.get(
    "/trainer/trainees",
    requireAuth,
    requireRole("TRAINER"),
    async (request, response) => {
      response.json(await service.listTrainees(getActorId(request)))
    },
  )

  router.post(
    "/trainee/trainer/detach",
    requireAuth,
    requireRole("TRAINEE"),
    async (request, response) => {
      response.json(await service.detachTrainee(getActorId(request)))
    },
  )

  router.get("/trainee/trainer", requireAuth, requireRole("TRAINEE"), async (request, response) => {
    response.json(await service.getCurrentTrainer(getActorId(request)))
  })

  router.post(
    "/trainer/trainees/:traineeId/unlink",
    requireAuth,
    requireRole("TRAINER"),
    validate({ params: traineeParamsSchema }),
    async (request, response) => {
      const params = traineeParamsSchema.parse(request.params)
      response.json(await service.unlinkTrainerTrainee(getActorId(request), params.traineeId))
    },
  )

  return router
}
