import type { PrismaClient } from "@prisma/client"
import { Router } from "express"
import { z } from "zod"

import { AccessService } from "../../core/access/access-service"
import { requireAuth } from "../../core/auth/middleware"
import { UnauthorizedError } from "../../core/errors/app-error"
import { validate } from "../../core/http/validate"
import { UserRepository } from "./user.repository"
import { UserService } from "./user.service"

const rankingQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
})

const userIdParamsSchema = z.object({ userId: z.string().uuid() })

export const buildUserRouter = (prisma: PrismaClient) => {
  const router = Router()
  const service = new UserService(new UserRepository(prisma))
  const accessService = new AccessService(prisma)

  router.get(
    "/ranking",
    requireAuth,
    validate({ query: rankingQuerySchema }),
    async (request, response) => {
      const query = rankingQuerySchema.parse(request.query)
      response.json(await service.getRanking(query.page, query.pageSize))
    },
  )

  router.get(
    "/users/:userId/elo",
    requireAuth,
    validate({ params: userIdParamsSchema }),
    async (request, response) => {
      const actor = request.authActor
      if (!actor) {
        throw new UnauthorizedError()
      }

      const params = userIdParamsSchema.parse(request.params)
      await accessService.assertSelfOrActiveTrainerRelationship(actor.user.id, params.userId)
      response.json(await service.getElo(params.userId))
    },
  )

  return router
}
