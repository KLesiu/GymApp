import type { PrismaClient, Role, User } from "@prisma/client"
import passport from "passport"
import { ExtractJwt, Strategy as JwtStrategy } from "passport-jwt"

import { env } from "../../config/env"

type JwtPayload = {
  readonly sub: string
}

export type AuthActor = {
  readonly user: User
  readonly roles: readonly Role[]
}

export const configurePassport = (prisma: PrismaClient): void => {
  passport.use(
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: env.JWT_SECRET,
      },
      async (payload: JwtPayload, done) => {
        const user = await prisma.user.findUnique({
          where: { id: payload.sub },
          include: { roles: true },
        })

        if (!user || user.deletedAt) {
          done(null, false)
          return
        }

        done(null, {
          user: {
            ...user,
            deletedAt: user.deletedAt,
            passwordHash: user.passwordHash,
          },
          roles: user.roles.map((role) => role.role),
        } satisfies AuthActor)
      },
    ),
  )
}

export const passportInstance = passport
