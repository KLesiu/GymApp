import { randomBytes } from "node:crypto"
import type { PrismaClient, Role } from "@prisma/client"
import argon2 from "argon2"
import jwt from "jsonwebtoken"

import { env } from "../../config/env"
import { AppError, UnauthorizedError } from "../../core/errors/app-error"
import type { UserRepository } from "../users/user.repository"
import { UserService, mapUserInfo } from "../users/user.service"

type RegisterInput = {
  readonly name: string
  readonly email: string
  readonly password: string
  readonly isVisibleInRanking: boolean
}

export class AuthService {
  private readonly users: UserRepository
  private readonly userService: UserService

  constructor(_prisma: PrismaClient, users: UserRepository) {
    this.users = users
    this.userService = new UserService(users)
  }

  async register(input: RegisterInput) {
    return this.registerWithRoles(input, ["TRAINEE"])
  }

  async registerTrainer(input: RegisterInput) {
    return this.registerWithRoles(input, ["TRAINER"])
  }

  private async registerWithRoles(input: RegisterInput, roles: readonly Role[]) {
    const existing = await this.users.findByName(input.name)

    if (existing) {
      throw new AppError("USER_NAME_TAKEN", 409)
    }

    const existingEmail = await this.users.findByEmail(input.email)
    if (existingEmail) {
      throw new AppError("USER_EMAIL_TAKEN", 409)
    }

    const passwordHash = await argon2.hash(input.password)
    const connectionCode = await this.generateConnectionCode()
    const user = await this.users.create({
      name: input.name,
      email: input.email,
      connectionCode,
      passwordHash,
      isVisibleInRanking: input.isVisibleInRanking,
      roles,
    })

    return this.buildLoginResponse(user)
  }

  async login(name: string, password: string) {
    const user = await this.users.findByName(name)

    if (!user) {
      throw new UnauthorizedError("INVALID_CREDENTIALS")
    }

    const isValid = await argon2.verify(user.passwordHash, password)

    if (!isValid) {
      throw new UnauthorizedError("INVALID_CREDENTIALS")
    }

    return this.buildLoginResponse(user)
  }

  async me(userId: string) {
    return this.userService.getMe(userId)
  }

  private buildLoginResponse(user: Awaited<ReturnType<UserRepository["findByName"]>>) {
    if (!user) {
      throw new UnauthorizedError("INVALID_CREDENTIALS")
    }

    const token = jwt.sign({ sub: user.id }, env.JWT_SECRET, { expiresIn: "7d" })
    const req = mapUserInfo(user)

    return {
      token,
      req,
      permissionClaims: req.permissionClaims,
    }
  }

  private async generateConnectionCode() {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      const code = randomBytes(6).toString("hex").toUpperCase()
      if (!(await this.users.findByConnectionCode(code))) {
        return code
      }
    }

    throw new AppError("CONNECTION_CODE_GENERATION_FAILED", 500)
  }
}
