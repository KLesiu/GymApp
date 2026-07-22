import type { PrismaClient } from "@prisma/client"
import type { Request } from "express"
import { Router } from "express"

import { AccessService } from "../../core/access/access-service"
import { requireAuth } from "../../core/auth/middleware"
import { UnauthorizedError } from "../../core/errors/app-error"
import { validate } from "../../core/http/validate"
import { MeasurementRepository } from "./measurement.repository"
import {
  bulkMeasurementSchema,
  measurementParamsSchema,
  measurementSchema,
  trendQuerySchema,
} from "./measurement.schemas"
import { MeasurementService } from "./measurement.service"

const getActorId = (request: Request) => {
  const actor = request.authActor
  if (!actor) {
    throw new UnauthorizedError()
  }
  return actor.user.id
}

export const buildMeasurementRouter = (prisma: PrismaClient) => {
  const router = Router()
  const service = new MeasurementService(
    new MeasurementRepository(prisma),
    new AccessService(prisma),
  )

  router.post(
    "/measurements",
    requireAuth,
    validate({ body: measurementSchema }),
    async (request, response) => {
      const actorId = getActorId(request)
      response.status(201).json(await service.create(actorId, actorId, [request.body]))
    },
  )

  router.post(
    "/measurements/bulk",
    requireAuth,
    validate({ body: bulkMeasurementSchema }),
    async (request, response) => {
      const actorId = getActorId(request)
      response.status(201).json(await service.create(actorId, actorId, request.body))
    },
  )

  router.get(
    "/measurements",
    requireAuth,
    validate({ query: trendQuerySchema }),
    async (request, response) => {
      const actorId = getActorId(request)
      const query = trendQuerySchema.parse(request.query)
      response.json(
        await service.list(actorId, query.userId ?? actorId, query.bodyPart, query.unit),
      )
    },
  )

  router.get(
    "/measurements/history",
    requireAuth,
    validate({ query: trendQuerySchema }),
    async (request, response) => {
      const actorId = getActorId(request)
      const query = trendQuerySchema.parse(request.query)
      response.json({
        measurements: await service.list(
          actorId,
          query.userId ?? actorId,
          query.bodyPart,
          query.unit,
        ),
      })
    },
  )

  router.get(
    "/measurements/trends",
    requireAuth,
    validate({ query: trendQuerySchema }),
    async (request, response) => {
      const actorId = getActorId(request)
      const query = trendQuerySchema.parse(request.query)
      response.json(
        await service.trends(actorId, query.userId ?? actorId, query.bodyPart, query.unit),
      )
    },
  )

  router.get(
    "/measurements/:measurementId",
    requireAuth,
    validate({ params: measurementParamsSchema }),
    async (request, response) => {
      const params = measurementParamsSchema.parse(request.params)
      response.json(await service.detail(getActorId(request), params.measurementId))
    },
  )

  return router
}
