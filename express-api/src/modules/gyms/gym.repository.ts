import type { PrismaClient } from "@prisma/client"

export class GymRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(ownerId: string, name: string, address: string) {
    return this.prisma.gym.create({ data: { ownerId, name, address } })
  }

  async list(ownerId: string) {
    return this.prisma.gym.findMany({
      where: { ownerId, deletedAt: null },
      orderBy: { createdAt: "asc" },
    })
  }

  async findOne(ownerId: string, gymId: string) {
    return this.prisma.gym.findFirst({ where: { id: gymId, ownerId } })
  }

  async update(gymId: string, name: string, address: string) {
    return this.prisma.gym.update({ where: { id: gymId }, data: { name, address } })
  }

  async softDelete(gymId: string) {
    return this.prisma.gym.update({ where: { id: gymId }, data: { deletedAt: new Date() } })
  }
}
