import type { PrismaClient } from "@prisma/client"
import type { Request } from "express"
import { Router } from "express"

import { requireAuth } from "../../core/auth/middleware"
import { UnauthorizedError } from "../../core/errors/app-error"
import { validate } from "../../core/http/validate"
import { GymRepository } from "./gym.repository"
import { gymParamsSchema, gymSchema } from "./gym.schemas"
import { GymService } from "./gym.service"

export const buildGymRouter = (prisma: PrismaClient) => {
  const router = Router()
  const service = new GymService(new GymRepository(prisma))

  const getActorId = (request: Request) => {
    const actor = request.authActor
    if (!actor) {
      throw new UnauthorizedError()
    }
    return actor.user.id
  }

  router.post("/", requireAuth, validate({ body: gymSchema }), async (request, response) => {
    response
      .status(201)
      .json(await service.create(getActorId(request), request.body.name, request.body.address))
  })

  router.get("/", requireAuth, async (request, response) => {
    response.json(await service.list(getActorId(request)))
  })

  router.get(
    "/:gymId",
    requireAuth,
    validate({ params: gymParamsSchema }),
    async (request, response) => {
      const params = gymParamsSchema.parse(request.params)
      response.json(await service.get(getActorId(request), params.gymId))
    },
  )

  router.patch(
    "/:gymId",
    requireAuth,
    validate({ params: gymParamsSchema, body: gymSchema }),
    async (request, response) => {
      const params = gymParamsSchema.parse(request.params)
      response.json(
        await service.update(
          getActorId(request),
          params.gymId,
          request.body.name,
          request.body.address,
        ),
      )
    },
  )

  router.delete(
    "/:gymId",
    requireAuth,
    validate({ params: gymParamsSchema }),
    async (request, response) => {
      const params = gymParamsSchema.parse(request.params)
      response.json(await service.remove(getActorId(request), params.gymId))
    },
  )

  return router
}
