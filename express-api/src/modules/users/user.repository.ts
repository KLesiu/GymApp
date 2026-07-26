import type { PrismaClient, Role } from "@prisma/client"

type CreateUserInput = {
  readonly name: string
  readonly email: string
  readonly connectionCode: string
  readonly passwordHash: string
  readonly isVisibleInRanking: boolean
  readonly roles: readonly Role[]
}

export class UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(input: CreateUserInput) {
    return this.prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        connectionCode: input.connectionCode,
        passwordHash: input.passwordHash,
        isVisibleInRanking: input.isVisibleInRanking,
        roles: {
          createMany: {
            data: input.roles.map((role) => ({ role })),
          },
        },
      },
      include: { roles: true },
    })
  }

  async findByName(name: string) {
    return this.prisma.user.findUnique({
      where: { name },
      include: { roles: true },
    })
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: { roles: true },
    })
  }

  async findByConnectionCode(connectionCode: string) {
    return this.prisma.user.findUnique({
      where: { connectionCode },
      include: { roles: true },
    })
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { roles: true },
    })
  }

  async getRanking(page: number, pageSize: number) {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where: { isVisibleInRanking: true, deletedAt: null },
        include: { roles: true },
        orderBy: [{ elo: "desc" }, { createdAt: "asc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.user.count({ where: { isVisibleInRanking: true, deletedAt: null } }),
    ])

    return { items, total }
  }
}
