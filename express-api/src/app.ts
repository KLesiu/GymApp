import "express-async-errors"

import type { PrismaClient } from "@prisma/client"
import cors from "cors"
import express from "express"
import rateLimit from "express-rate-limit"
import helmet from "helmet"
import swaggerUi from "swagger-ui-express"

import { env } from "./config/env"
import { configurePassport, passportInstance } from "./core/auth/passport"
import { errorMiddleware } from "./core/errors/error-middleware"
import { openApiSpec } from "./core/openapi/spec"
import { buildApiRouter } from "./routes"

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
})

const buildCorsOptions = () => {
  if (env.CORS_ORIGINS === "*") {
    return { origin: true }
  }

  const allowedOrigins = new Set(env.CORS_ORIGINS.split(",").map((origin) => origin.trim()))
  return {
    origin: (
      origin: string | undefined,
      callback: (error: Error | null, allow?: boolean) => void,
    ) => {
      callback(null, origin === undefined || allowedOrigins.has(origin))
    },
  }
}

export const createApp = (prisma: PrismaClient) => {
  configurePassport(prisma)

  const app = express()
  app.use(helmet())
  app.use(cors(buildCorsOptions()))
  app.use(express.json({ limit: "1mb" }))
  app.use(passportInstance.initialize())
  app.use("/api/v1/auth", authLimiter)

  app.get("/health", (_request, response) => {
    response.json({ ok: true })
  })

  app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiSpec))
  app.get("/openapi.json", (_request, response) => {
    response.json(openApiSpec)
  })

  app.use(buildApiRouter(prisma))
  app.use(errorMiddleware)

  return app
}
