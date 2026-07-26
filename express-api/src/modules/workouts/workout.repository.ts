import type { Prisma, PrismaClient } from "@prisma/client"

import {
  AppError,
  ForbiddenError,
  NotFoundError,
  ValidationAppError,
} from "../../core/errors/app-error"
import { getCurrentRank, getNextRank } from "../../shared/rank-service"
import { calculateEloGain, calculateFormulaScore } from "./elo"

export class WorkoutRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async createDraft(
    userId: string,
    input: {
      readonly gymId: string
      readonly planId?: string
      readonly planDayId?: string
      readonly startedAt: string
      readonly sets: readonly {
        readonly exerciseId: string
        readonly series: number
        readonly reps?: number | null
        readonly weight?: number | null
        readonly unit: "KILOGRAMS" | "POUNDS"
      }[]
    },
  ) {
    return this.prisma.workoutSession.create({
      data: {
        userId,
        gymId: input.gymId,
        planId: input.planId ?? null,
        planDayId: input.planDayId ?? null,
        startedAt: new Date(input.startedAt),
        sets: {
          create: input.sets.map((set) => ({
            exerciseId: set.exerciseId,
            series: set.series,
            reps: set.reps ?? null,
            weight: set.weight ?? null,
            unit: set.unit,
          })),
        },
      },
      include: {
        gym: true,
        planDay: true,
        sets: { include: { exercise: true }, orderBy: [{ exerciseId: "asc" }, { series: "asc" }] },
      },
    })
  }

  async findWorkout(userId: string, workoutId: string) {
    return this.prisma.workoutSession.findFirst({
      where: { id: workoutId, userId },
      include: {
        gym: true,
        planDay: true,
        sets: { include: { exercise: true }, orderBy: [{ exerciseId: "asc" }, { series: "asc" }] },
      },
    })
  }

  async listFinalized(userId: string) {
    return this.prisma.workoutSession.findMany({
      where: { userId, status: "FINALIZED" },
      include: {
        gym: true,
        planDay: true,
        sets: { include: { exercise: true }, orderBy: [{ exerciseId: "asc" }, { series: "asc" }] },
      },
      orderBy: { completedAt: "desc" },
    })
  }

  async findFinalized(userId: string, workoutId: string) {
    return this.prisma.workoutSession.findFirst({
      where: { id: workoutId, userId, status: "FINALIZED" },
      include: {
        gym: true,
        planDay: true,
        sets: { include: { exercise: true }, orderBy: [{ exerciseId: "asc" }, { series: "asc" }] },
      },
    })
  }

  async updateSets(
    userId: string,
    workoutId: string,
    input: {
      readonly sets: readonly {
        readonly id?: string
        readonly exerciseId: string
        readonly series: number
        readonly reps: number
        readonly weight: number
        readonly unit: "KILOGRAMS" | "POUNDS"
      }[]
    },
  ) {
    return this.prisma.$transaction(async (transaction) => {
      await this.lockWorkout(transaction, workoutId)

      const workout = await transaction.workoutSession.findFirst({
        where: { id: workoutId, userId },
        include: { sets: true },
      })

      if (!workout) {
        throw new NotFoundError("WORKOUT_NOT_FOUND")
      }

      if (workout.status === "FINALIZED") {
        throw new ValidationAppError("WORKOUT_ALREADY_FINALIZED")
      }

      await this.replaceSets(transaction, userId, workoutId, workout.sets, input.sets)

      return transaction.workoutSession.findUnique({
        where: { id: workoutId },
        include: {
          gym: true,
          planDay: true,
          sets: {
            include: { exercise: true },
            orderBy: [{ exerciseId: "asc" }, { series: "asc" }],
          },
        },
      })
    })
  }

  async getEloChart(userId: string) {
    return this.prisma.eloHistory.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    })
  }

  async findIdempotency(userId: string, key: string) {
    return this.prisma.idempotencyKey.findUnique({
      where: { userId_scope_key: { userId, scope: "workout.finalize", key } },
    })
  }

  async findBenchmarkSet(userId: string, exerciseId: string, gymId: string, beforeDate: Date) {
    return this.prisma.workoutSet.findFirst({
      where: {
        exerciseId,
        workoutSession: {
          userId,
          gymId,
          status: "FINALIZED",
          completedAt: { lt: beforeDate },
        },
      },
      include: { exercise: true, workoutSession: true },
      orderBy: [{ weight: "desc" }, { reps: "desc" }, { createdAt: "desc" }],
    })
  }

  async finalizeWorkout(
    userId: string,
    workoutId: string,
    idempotencyKey: string,
    requestHash: string,
    input?: {
      readonly sets?: readonly {
        readonly id?: string
        readonly exerciseId: string
        readonly series: number
        readonly reps: number
        readonly weight: number
        readonly unit: "KILOGRAMS" | "POUNDS"
      }[]
    },
  ) {
    return this.prisma.$transaction(async (transaction) => {
      const existingIdempotency = await transaction.idempotencyKey.findUnique({
        where: { userId_scope_key: { userId, scope: "workout.finalize", key: idempotencyKey } },
      })

      if (existingIdempotency) {
        this.assertSameIdempotencyRequest(existingIdempotency, workoutId, requestHash)
        return { kind: "idempotent" as const, payload: existingIdempotency }
      }

      await this.lockWorkout(transaction, workoutId)

      const idempotencyAfterLock = await transaction.idempotencyKey.findUnique({
        where: { userId_scope_key: { userId, scope: "workout.finalize", key: idempotencyKey } },
      })

      if (idempotencyAfterLock) {
        this.assertSameIdempotencyRequest(idempotencyAfterLock, workoutId, requestHash)
        return { kind: "idempotent" as const, payload: idempotencyAfterLock }
      }

      const workout = await transaction.workoutSession.findUnique({
        where: { id: workoutId },
        include: {
          gym: true,
          sets: { include: { exercise: true }, orderBy: [{ createdAt: "asc" }] },
          user: true,
        },
      })

      if (!workout) {
        throw new NotFoundError("WORKOUT_NOT_FOUND")
      }

      if (workout.userId !== userId) {
        throw new ForbiddenError("WORKOUT_ACCESS_DENIED")
      }

      if (workout.status === "FINALIZED") {
        throw new ValidationAppError("WORKOUT_ALREADY_FINALIZED")
      }

      if (input?.sets) {
        await this.replaceSets(transaction, userId, workoutId, workout.sets, input.sets)
      }

      const finalizedWorkout = input?.sets
        ? await transaction.workoutSession.findUnique({
            where: { id: workoutId },
            include: {
              gym: true,
              sets: { include: { exercise: true }, orderBy: [{ createdAt: "asc" }] },
              user: true,
            },
          })
        : workout

      if (!finalizedWorkout) {
        throw new NotFoundError("WORKOUT_NOT_FOUND")
      }

      const completedAt = new Date()
      const comparison = [] as {
        exerciseId: string
        exerciseName: string
        seriesComparisons: {
          series: number
          currentResult: { reps: number; weight: number; unit: string }
          previousResult: { reps: number; weight: number; unit: string } | null
        }[]
      }[]
      let totalGain = 0
      let currentElo = finalizedWorkout.user.elo
      const completedSets = finalizedWorkout.sets.map((set) => {
        if (set.reps === null || set.weight === null) {
          throw new ValidationAppError("WORKOUT_SET_INCOMPLETE")
        }
        return { ...set, reps: set.reps, weight: set.weight }
      })
      const grouped = new Map<string, typeof completedSets>()

      for (const set of completedSets) {
        const collection = grouped.get(set.exerciseId)
        if (collection) {
          collection.push(set)
        } else {
          grouped.set(set.exerciseId, [set])
        }
      }

      for (const [exerciseId, sets] of grouped.entries()) {
        const firstSet = sets[0]
        if (!firstSet) {
          continue
        }

        const previous = await transaction.workoutSet.findFirst({
          where: {
            exerciseId,
            reps: { not: null },
            weight: { not: null },
            workoutSession: {
              userId,
              gymId: finalizedWorkout.gymId,
              status: "FINALIZED",
              completedAt: { lt: completedAt },
            },
          },
          include: { workoutSession: true },
          orderBy: [{ weight: "desc" }, { reps: "desc" }, { createdAt: "desc" }],
        })

        const bestCurrent = sets.reduce((best, candidate) => {
          if (Number(candidate.weight) > Number(best.weight)) {
            return candidate
          }
          if (Number(candidate.weight) === Number(best.weight) && candidate.reps > best.reps) {
            return candidate
          }
          return best
        }, firstSet)

        let gain = 0
        let completePrevious: { reps: number; weight: Prisma.Decimal; unit: string } | null = null

        if (previous) {
          if (previous.reps === null || previous.weight === null) {
            throw new ValidationAppError("WORKOUT_SET_INCOMPLETE")
          }
          completePrevious = { reps: previous.reps, weight: previous.weight, unit: previous.unit }
          gain = calculateEloGain(bestCurrent.exercise.formula, {
            previousWeight: Number(completePrevious.weight),
            previousReps: completePrevious.reps,
            currentWeight: Number(bestCurrent.weight),
            currentReps: bestCurrent.reps,
          })

          await transaction.eloHistory.create({
            data: {
              userId,
              workoutSessionId: workout.id,
              exerciseId,
              previousElo: currentElo,
              gain,
              newElo: currentElo + gain,
              formula: bestCurrent.exercise.formula,
              score: calculateFormulaScore(
                bestCurrent.exercise.formula,
                Number(bestCurrent.weight),
                bestCurrent.reps,
              ),
              previousScore: calculateFormulaScore(
                bestCurrent.exercise.formula,
                Number(completePrevious.weight),
                completePrevious.reps,
              ),
            },
          })
        }

        currentElo += gain
        totalGain += gain
        comparison.push({
          exerciseId,
          exerciseName: firstSet.exercise.name,
          seriesComparisons: sets.map((set) => ({
            series: set.series,
            currentResult: { reps: set.reps, weight: Number(set.weight), unit: set.unit },
            previousResult: completePrevious
              ? {
                  reps: completePrevious.reps,
                  weight: Number(completePrevious.weight),
                  unit: completePrevious.unit,
                }
              : null,
          })),
        })
      }

      const rank = getCurrentRank(currentElo)
      const nextRank = getNextRank(currentElo)

      const createdKey = await transaction.idempotencyKey.create({
        data: {
          userId,
          scope: "workout.finalize",
          key: idempotencyKey,
          resourceId: workoutId,
          requestHash,
          statusCode: 200,
          responseJson: {
            comparison,
            gainElo: totalGain,
            userOldElo: finalizedWorkout.user.elo,
            profileRank: rank,
            nextRank,
            msg: "CREATED",
          },
        },
      })

      await transaction.workoutSession.update({
        where: { id: workoutId },
        data: {
          status: "FINALIZED",
          completedAt,
          finalizedIdempotencyKeyId: createdKey.id,
        },
      })

      await transaction.user.update({ where: { id: userId }, data: { elo: currentElo } })

      return { kind: "created" as const, payload: createdKey }
    })
  }

  private async replaceSets(
    transaction: Prisma.TransactionClient,
    userId: string,
    workoutId: string,
    currentSets: readonly { readonly id: string; readonly exerciseId: string }[],
    sets: readonly {
      readonly id?: string
      readonly exerciseId: string
      readonly series: number
      readonly reps: number
      readonly weight: number
      readonly unit: "KILOGRAMS" | "POUNDS"
    }[],
  ) {
    const ownedSetIds = new Set(currentSets.map((set) => set.id))
    const inputSetIds = sets.flatMap((set) => (set.id ? [set.id] : []))
    if (inputSetIds.some((id) => !ownedSetIds.has(id))) {
      throw new ValidationAppError("WORKOUT_SET_NOT_FOUND")
    }

    const exerciseIds = Array.from(new Set(sets.map((set) => set.exerciseId)))
    const draftExerciseIds = new Set(currentSets.map((set) => set.exerciseId))
    const allowedExercises = await transaction.exercise.findMany({
      where: {
        id: { in: exerciseIds },
        OR: [{ ownerId: userId }, { id: { in: Array.from(draftExerciseIds) } }],
      },
      select: { id: true },
    })
    if (allowedExercises.length !== exerciseIds.length) {
      throw new ValidationAppError("EXERCISE_NOT_FOUND")
    }

    await transaction.workoutSet.deleteMany({
      where: { workoutSessionId: workoutId, id: { notIn: inputSetIds } },
    })

    await Promise.all(
      sets.map((set) => {
        const data = {
          exerciseId: set.exerciseId,
          series: set.series,
          reps: set.reps ?? null,
          weight: set.weight ?? null,
          unit: set.unit,
        }

        return set.id
          ? transaction.workoutSet.update({ where: { id: set.id }, data })
          : transaction.workoutSet.create({ data: { ...data, workoutSessionId: workoutId } })
      }),
    )
  }

  private async lockWorkout(transaction: Prisma.TransactionClient, workoutId: string) {
    await transaction.$queryRaw`SELECT id FROM "WorkoutSession" WHERE id = ${workoutId}::uuid FOR UPDATE`
  }

  private assertSameIdempotencyRequest(
    existing: { readonly resourceId: string | null; readonly requestHash: string },
    workoutId: string,
    requestHash: string,
  ) {
    if (existing.resourceId !== workoutId || existing.requestHash !== requestHash) {
      throw new AppError("IDEMPOTENCY_KEY_REUSED", 409)
    }
  }
}
