import type { NextFunction, Request, Response } from "express"
import { ZodError } from "zod"

import { AppError } from "./app-error"

type ErrorPayload = {
  readonly error: {
    readonly code: string
    readonly message: string
    readonly details?: readonly string[]
  }
}

const buildErrorPayload = (code: string, details?: readonly string[]): ErrorPayload => ({
  error: {
    code,
    message: code,
    ...(details && details.length > 0 ? { details } : {}),
  },
})

export const errorMiddleware = (
  error: unknown,
  _request: Request,
  response: Response,
  _next: NextFunction,
): void => {
  if (error instanceof ZodError) {
    response.status(400).json(
      buildErrorPayload(
        "VALIDATION_ERROR",
        error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`),
      ),
    )
    return
  }

  if (error instanceof AppError) {
    response.status(error.statusCode).json(buildErrorPayload(error.code, error.details))
    return
  }

  response.status(500).json(buildErrorPayload("INTERNAL_SERVER_ERROR"))
}
