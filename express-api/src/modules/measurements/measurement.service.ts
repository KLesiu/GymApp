import type { BodyPart, MeasurementUnit } from "@prisma/client"

import type { AccessService } from "../../core/access/access-service"
import { NotFoundError } from "../../core/errors/app-error"
import type { MeasurementRepository } from "./measurement.repository"

export class MeasurementService {
  constructor(
    private readonly repository: MeasurementRepository,
    private readonly accessService: AccessService,
  ) {}

  async create(
    userId: string,
    targetUserId: string,
    input: readonly {
      readonly bodyPart: BodyPart
      readonly unit: MeasurementUnit
      readonly value: number
      readonly takenAt: string
    }[],
  ) {
    await this.accessService.assertSelfOrActiveTrainerRelationship(userId, targetUserId)
    await this.repository.createMany(targetUserId, input)
    return { msg: "CREATED" }
  }

  async list(userId: string, targetUserId: string, bodyPart?: BodyPart, unit?: MeasurementUnit) {
    await this.accessService.assertSelfOrActiveTrainerRelationship(userId, targetUserId)
    return (await this.repository.getFilteredHistory(targetUserId, bodyPart, unit)).map((item) =>
      this.mapMeasurement(item),
    )
  }

  async detail(userId: string, measurementId: string) {
    const measurement = await this.repository.findById(measurementId)
    if (!measurement) {
      throw new NotFoundError("MEASUREMENT_NOT_FOUND")
    }
    await this.accessService.assertSelfOrActiveTrainerRelationship(userId, measurement.userId)
    return this.mapMeasurement(measurement)
  }

  async trends(userId: string, targetUserId: string, bodyPart?: BodyPart, unit?: MeasurementUnit) {
    await this.accessService.assertSelfOrActiveTrainerRelationship(userId, targetUserId)
    const history = await this.repository.getFilteredHistory(targetUserId, bodyPart, unit)
    const grouped = new Map<
      string,
      { readonly bodyPart: string; readonly entries: typeof history }
    >()

    for (const item of history) {
      const match = grouped.get(item.bodyPart)
      if (match) {
        match.entries.push(item)
      } else {
        grouped.set(item.bodyPart, { bodyPart: item.bodyPart, entries: [item] })
      }
    }

    return Array.from(grouped.values()).map((group) => {
      const latest = group.entries[group.entries.length - 1]
      if (!latest) {
        return {
          bodyPart: group.bodyPart,
          latestValue: null,
          latestUnit: null,
          latestTakenAt: null,
          delta: null,
        }
      }
      const previous = group.entries.length > 1 ? group.entries[group.entries.length - 2] : null
      return {
        bodyPart: group.bodyPart,
        latestValue: Number(latest.value),
        latestUnit: latest.unit,
        latestTakenAt: latest.takenAt,
        delta: previous ? Number(latest.value) - Number(previous.value) : null,
      }
    })
  }

  private mapMeasurement(item: {
    readonly id: string
    readonly userId: string
    readonly bodyPart: BodyPart
    readonly unit: MeasurementUnit
    readonly value: { toString(): string }
    readonly takenAt: Date
    readonly createdAt: Date
  }) {
    return {
      _id: item.id,
      user: item.userId,
      bodyPart: item.bodyPart,
      unit: item.unit,
      value: Number(item.value),
      takenAt: item.takenAt,
      createdAt: item.createdAt,
    }
  }
}
