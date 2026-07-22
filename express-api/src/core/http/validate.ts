import type { RequestHandler } from "express"
import type { ZodType } from "zod"

type RequestShape = {
  readonly body?: ZodType
  readonly params?: ZodType
  readonly query?: ZodType
}

export const validate = (shape: RequestShape): RequestHandler => {
  return (request, _response, next) => {
    if (shape.body) {
      request.body = shape.body.parse(request.body)
    }

    if (shape.params) {
      request.params = shape.params.parse(request.params)
    }

    if (shape.query) {
      request.query = shape.query.parse(request.query)
    }

    next()
  }
}
