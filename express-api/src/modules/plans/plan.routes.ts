import type { PrismaClient } from "@prisma/client"
import type { Request } from "express"
import { Router } from "express"

import { AccessService } from "../../core/access/access-service"
import { requireAuth, requireRole } from "../../core/auth/middleware"
import { UnauthorizedError } from "../../core/errors/app-error"
import { validate } from "../../core/http/validate"
import { PlanRepository } from "./plan.repository"
import {
  assignPlanSchema,
  createPlanSchema,
  planDayParamsSchema,
  planDaySchema,
  planParamsSchema,
  setActivePlanSchema,
  updatePlanSchema,
} from "./plan.schemas"
import { PlanService } from "./plan.service"

const getActorId = (request: Request) => {
  const actor = request.authActor
  if (!actor) {
    throw new UnauthorizedError()
  }
  return actor.user.id
}

export const buildPlanRouter = (prisma: PrismaClient) => {
  const router = Router()
  const service = new PlanService(new PlanRepository(prisma), new AccessService(prisma))

  router.post(
    "/plans",
    requireAuth,
    validate({ body: createPlanSchema }),
    async (request, response) => {
      response.status(201).json(await service.create(getActorId(request), request.body))
    },
  )

  router.get("/plans", requireAuth, async (request, response) => {
    response.json(await service.list(getActorId(request)))
  })

  router.get("/plans/active", requireAuth, async (request, response) => {
    response.json(await service.getActivePlan(getActorId(request)))
  })

  router.post(
    "/plans/active",
    requireAuth,
    validate({ body: setActivePlanSchema }),
    async (request, response) => {
      response.json(await service.setSelfActivePlan(getActorId(request), request.body.planId))
    },
  )

  router.get(
    "/plans/:planId",
    requireAuth,
    validate({ params: planParamsSchema }),
    async (request, response) => {
      const params = planParamsSchema.parse(request.params)
      response.json(await service.get(getActorId(request), params.planId))
    },
  )

  router.patch(
    "/plans/:planId",
    requireAuth,
    validate({ params: planParamsSchema, body: updatePlanSchema }),
    async (request, response) => {
      const params = planParamsSchema.parse(request.params)
      response.json(await service.update(getActorId(request), params.planId, request.body))
    },
  )

  router.delete(
    "/plans/:planId",
    requireAuth,
    validate({ params: planParamsSchema }),
    async (request, response) => {
      const params = planParamsSchema.parse(request.params)
      response.json(await service.delete(getActorId(request), params.planId))
    },
  )

  router.post(
    "/plans/:planId/copy",
    requireAuth,
    validate({ params: planParamsSchema }),
    async (request, response) => {
      const params = planParamsSchema.parse(request.params)
      response.status(201).json(await service.copy(getActorId(request), params.planId))
    },
  )

  router.post(
    "/plans/:planId/days",
    requireAuth,
    validate({ params: planParamsSchema, body: planDaySchema }),
    async (request, response) => {
      const params = planParamsSchema.parse(request.params)
      response
        .status(201)
        .json(await service.createPlanDay(getActorId(request), params.planId, request.body))
    },
  )

  router.get(
    "/plans/:planId/days",
    requireAuth,
    validate({ params: planParamsSchema }),
    async (request, response) => {
      const params = planParamsSchema.parse(request.params)
      response.json(await service.listPlanDays(getActorId(request), params.planId))
    },
  )

  router.get(
    "/plan-days/:planDayId",
    requireAuth,
    validate({ params: planDayParamsSchema }),
    async (request, response) => {
      const params = planDayParamsSchema.parse(request.params)
      response.json(await service.getPlanDay(getActorId(request), params.planDayId))
    },
  )

  router.delete(
    "/plan-days/:planDayId",
    requireAuth,
    validate({ params: planDayParamsSchema }),
    async (request, response) => {
      const params = planDayParamsSchema.parse(request.params)
      response.json(await service.deletePlanDay(getActorId(request), params.planDayId))
    },
  )

  router.post(
    "/plans/:planId/assignments",
    requireAuth,
    requireRole("TRAINER"),
    validate({ params: planParamsSchema, body: assignPlanSchema }),
    async (request, response) => {
      const params = planParamsSchema.parse(request.params)
      response
        .status(201)
        .json(await service.assignPlan(getActorId(request), params.planId, request.body.traineeId))
    },
  )

  return router
}
