import type { PrismaClient } from "@prisma/client"
import type { Request } from "express"
import { Router } from "express"

import { requireAuth } from "../../core/auth/middleware"
import { UnauthorizedError, ValidationAppError } from "../../core/errors/app-error"
import { validate } from "../../core/http/validate"
import { createWorkoutSchema, workoutParamsSchema } from "./workout.schemas"
import { WorkoutService } from "./workout.service"

const getActorId = (request: Request) => {
  const actor = request.authActor
  if (!actor) {
    throw new UnauthorizedError()
  }
  return actor.user.id
}

export const buildWorkoutRouter = (prisma: PrismaClient) => {
  const router = Router()
  const service = new WorkoutService(prisma)

  router.post(
    "/workouts",
    requireAuth,
    validate({ body: createWorkoutSchema }),
    async (request, response) => {
      response.status(201).json(await service.createDraft(getActorId(request), request.body))
    },
  )

  router.post(
    "/workouts/:workoutId/finalize",
    requireAuth,
    validate({ params: workoutParamsSchema }),
    async (request, response) => {
      const params = workoutParamsSchema.parse(request.params)
      const idempotencyKey = request.header("Idempotency-Key")
      if (!idempotencyKey) {
        throw new ValidationAppError("IDEMPOTENCY_KEY_REQUIRED")
      }

      response.json(await service.finalize(getActorId(request), params.workoutId, idempotencyKey))
    },
  )

  router.get("/workouts", requireAuth, async (request, response) => {
    response.json(await service.listHistory(getActorId(request)))
  })

  router.get("/workouts/dates", requireAuth, async (request, response) => {
    response.json(await service.getTrainingDates(getActorId(request)))
  })

  router.get(
    "/workouts/:workoutId",
    requireAuth,
    validate({ params: workoutParamsSchema }),
    async (request, response) => {
      const params = workoutParamsSchema.parse(request.params)
      response.json(await service.getHistoryDetail(getActorId(request), params.workoutId))
    },
  )

  router.get("/elo/chart", requireAuth, async (request, response) => {
    response.json(await service.getEloChart(getActorId(request)))
  })

  return router
}
