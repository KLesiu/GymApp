import type { BodyPart, MeasurementUnit, PrismaClient } from "@prisma/client"

export class MeasurementRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async createMany(
    userId: string,
    input: readonly {
      readonly bodyPart: BodyPart
      readonly unit: MeasurementUnit
      readonly value: number
      readonly takenAt: string
    }[],
  ) {
    await this.prisma.bodyMeasurement.createMany({
      data: input.map((item) => ({
        userId,
        bodyPart: item.bodyPart,
        unit: item.unit,
        value: item.value,
        takenAt: new Date(item.takenAt),
      })),
    })
  }

  async getHistory(userId: string) {
    return this.prisma.bodyMeasurement.findMany({
      where: { userId },
      orderBy: [{ bodyPart: "asc" }, { takenAt: "asc" }],
    })
  }

  async getFilteredHistory(userId: string, bodyPart?: BodyPart, unit?: MeasurementUnit) {
    return this.prisma.bodyMeasurement.findMany({
      where: { userId, ...(bodyPart ? { bodyPart } : {}), ...(unit ? { unit } : {}) },
      orderBy: [{ takenAt: "asc" }],
    })
  }

  async findById(measurementId: string) {
    return this.prisma.bodyMeasurement.findUnique({ where: { id: measurementId } })
  }
}
