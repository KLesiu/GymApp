import type { PrismaClient } from "@prisma/client"
import type { Request } from "express"
import { Router } from "express"

import { requireAuth } from "../../core/auth/middleware"
import { UnauthorizedError } from "../../core/errors/app-error"
import { validate } from "../../core/http/validate"
import { ExerciseRepository } from "./exercise.repository"
import {
  exerciseParamsSchema,
  exerciseSchema,
  lastScoresSchema,
  muscleGroupSchema,
  updateExerciseSchema,
} from "./exercise.schemas"
import { ExerciseService } from "./exercise.service"

export const buildExerciseRouter = (prisma: PrismaClient) => {
  const router = Router()
  const service = new ExerciseService(new ExerciseRepository(prisma))

  const getActorId = (request: Request) => {
    const actor = request.authActor
    if (!actor) {
      throw new UnauthorizedError()
    }
    return actor.user.id
  }

  router.post(
    "/muscle-groups",
    requireAuth,
    validate({ body: muscleGroupSchema }),
    async (request, response) => {
      response
        .status(201)
        .json(
          await service.createMuscleGroup(
            getActorId(request),
            request.body.name,
            request.body.region,
          ),
        )
    },
  )

  router.get("/muscle-groups", requireAuth, async (request, response) => {
    response.json(await service.listMuscleGroups(getActorId(request)))
  })

  router.post(
    "/exercises",
    requireAuth,
    validate({ body: exerciseSchema }),
    async (request, response) => {
      response
        .status(201)
        .json(
          await service.createExercise(
            getActorId(request),
            request.body.muscleGroupId,
            request.body.name,
            request.body.formula,
          ),
        )
    },
  )

  router.get("/exercises", requireAuth, async (request, response) => {
    response.json(await service.listExercises(getActorId(request)))
  })

  router.post(
    "/exercises/last-scores",
    requireAuth,
    validate({ body: lastScoresSchema }),
    async (request, response) => {
      const body = lastScoresSchema.parse(request.body)
      response.json(
        await service.getLastExerciseScores(
          getActorId(request),
          body.exerciseId,
          body.series,
          body.gymId,
        ),
      )
    },
  )

  router.get(
    "/exercises/:exerciseId",
    requireAuth,
    validate({ params: exerciseParamsSchema }),
    async (request, response) => {
      const params = exerciseParamsSchema.parse(request.params)
      response.json(await service.getExercise(getActorId(request), params.exerciseId))
    },
  )

  router.patch(
    "/exercises/:exerciseId",
    requireAuth,
    validate({ params: exerciseParamsSchema, body: updateExerciseSchema }),
    async (request, response) => {
      const params = exerciseParamsSchema.parse(request.params)
      response.json(
        await service.updateExercise(getActorId(request), params.exerciseId, request.body),
      )
    },
  )

  router.delete(
    "/exercises/:exerciseId",
    requireAuth,
    validate({ params: exerciseParamsSchema }),
    async (request, response) => {
      const params = exerciseParamsSchema.parse(request.params)
      response.json(await service.deleteExercise(getActorId(request), params.exerciseId))
    },
  )

  return router
}
