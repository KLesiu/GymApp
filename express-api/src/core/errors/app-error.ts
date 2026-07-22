export class AppError extends Error {
  readonly name: string = "AppError"

  constructor(
    readonly code: string,
    readonly statusCode: number,
    readonly details?: readonly string[],
  ) {
    super(code)
  }
}

export class ForbiddenError extends AppError {
  readonly name = "ForbiddenError"

  constructor(message = "FORBIDDEN") {
    super(message, 403)
  }
}

export class NotFoundError extends AppError {
  readonly name = "NotFoundError"

  constructor(message = "NOT_FOUND") {
    super(message, 404)
  }
}

export class UnauthorizedError extends AppError {
  readonly name = "UnauthorizedError"

  constructor(message = "UNAUTHORIZED") {
    super(message, 401)
  }
}

export class ValidationAppError extends AppError {
  readonly name = "ValidationAppError"

  constructor(message = "VALIDATION_ERROR", details?: readonly string[]) {
    super(message, 400, details)
  }
}
