import type { AuthActor } from "../core/auth/passport"

declare global {
  namespace Express {
    interface Request {
      authActor?: AuthActor
      user?: AuthActor
    }
  }
}
