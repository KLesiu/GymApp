import type { Role } from "@prisma/client"
import type { NextFunction, Request, RequestHandler, Response } from "express"

import { ForbiddenError, UnauthorizedError } from "../errors/app-error"
import type { AuthActor } from "./passport"
import { passportInstance } from "./passport"

export const requireAuth: RequestHandler = (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const handler = passportInstance.authenticate(
    "jwt",
    { session: false },
    (error: Error | null, user?: AuthActor | false) => {
      if (error) {
        next(error)
        return
      }

      if (!user) {
        next(new UnauthorizedError())
        return
      }

      request.authActor = user
      request.user = user
      next()
    },
  )

  handler(request, response, next)
}

export const requireRole = (role: Role): RequestHandler => {
  return (request, _response, next) => {
    if (!request.authActor) {
      next(new UnauthorizedError())
      return
    }

    if (!request.authActor.roles.includes(role)) {
      next(new ForbiddenError())
      return
    }

    next()
  }
}
