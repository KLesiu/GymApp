import type { User } from "@prisma/client"

import { NotFoundError } from "../../core/errors/app-error"
import { getCurrentRank, getNextRank } from "../../shared/rank-service"
import type { UserRepository } from "./user.repository"

type UserWithRoles = User & {
  readonly roles: readonly { readonly role: string }[]
}

export const mapUserInfo = (user: UserWithRoles) => {
  const currentRank = getCurrentRank(user.elo)
  const nextRank = getNextRank(user.elo)

  return {
    id: user.id,
    name: user.name,
    _id: user.id,
    email: user.email,
    connectionCode: user.connectionCode,
    avatar: null,
    profileRank: currentRank.name,
    preferredTimeZone: user.preferredTimeZone,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    elo: user.elo,
    nextRank,
    isDeleted: user.deletedAt !== null,
    isVisibleInRanking: user.isVisibleInRanking,
    roles: user.roles.map((role) => role.role),
    permissionClaims: user.roles.map((role) => `role:${role.role}`),
  }
}

export class UserService {
  constructor(private readonly repository: UserRepository) {}

  async getMe(userId: string) {
    const user = await this.repository.findById(userId)

    if (!user) {
      throw new NotFoundError("USER_NOT_FOUND")
    }

    return mapUserInfo(user)
  }

  async getElo(userId: string) {
    const user = await this.repository.findById(userId)

    if (!user) {
      throw new NotFoundError("USER_NOT_FOUND")
    }

    return { elo: user.elo }
  }

  async getRanking(page: number, pageSize: number) {
    const ranking = await this.repository.getRanking(page, pageSize)

    return {
      items: ranking.items.map((user) => ({
        id: user.id,
        _id: user.id,
        name: user.name,
        elo: user.elo,
        profileRank: getCurrentRank(user.elo).name,
      })),
      page,
      pageSize,
      total: ranking.total,
    }
  }
}
