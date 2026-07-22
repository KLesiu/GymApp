import type { PrismaClient } from "@prisma/client"
import { Router } from "express"

import { requireAuth } from "../../core/auth/middleware"
import { UnauthorizedError } from "../../core/errors/app-error"
import { validate } from "../../core/http/validate"
import { UserRepository } from "../users/user.repository"
import { loginSchema, registerSchema } from "./auth.schemas"
import { AuthService } from "./auth.service"

export const buildAuthRouter = (prisma: PrismaClient) => {
  const router = Router()
  const service = new AuthService(prisma, new UserRepository(prisma))

  router.post("/register", validate({ body: registerSchema }), async (request, response) => {
    response.status(201).json(await service.register(request.body))
  })

  router.post(
    "/trainer/register",
    validate({ body: registerSchema }),
    async (request, response) => {
      response.status(201).json(await service.registerTrainer(request.body))
    },
  )

  router.post("/login", validate({ body: loginSchema }), async (request, response) => {
    response.json(await service.login(request.body.name, request.body.password))
  })

  router.get("/me", requireAuth, async (request, response) => {
    const actor = request.authActor
    if (!actor) {
      throw new UnauthorizedError()
    }
    response.json(await service.me(actor.user.id))
  })

  return router
}
