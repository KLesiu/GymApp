import type { PrismaClient } from "@prisma/client"

import { ForbiddenError, NotFoundError } from "../../core/errors/app-error"
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
        readonly reps: number
        readonly weight: number
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
            reps: set.reps,
            weight: set.weight,
            unit: set.unit,
          })),
        },
      },
      include: { sets: true },
    })
  }

  async findWorkout(workoutId: string) {
    return this.prisma.workoutSession.findUnique({
      where: { id: workoutId },
      include: {
        gym: true,
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

  async finalizeWorkout(userId: string, workoutId: string, idempotencyKey: string) {
    return this.prisma.$transaction(async (transaction) => {
      const existingIdempotency = await transaction.idempotencyKey.findUnique({
        where: { userId_scope_key: { userId, scope: "workout.finalize", key: idempotencyKey } },
      })

      if (existingIdempotency) {
        return { kind: "idempotent" as const, payload: existingIdempotency }
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

      if (workout.status === "FINALIZED" && workout.finalizedIdempotencyKeyId) {
        const previous = await transaction.idempotencyKey.findUnique({
          where: { id: workout.finalizedIdempotencyKeyId },
        })
        if (previous) {
          return { kind: "idempotent" as const, payload: previous }
        }
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
      let currentElo = workout.user.elo
      const grouped = new Map<string, typeof workout.sets>()

      for (const set of workout.sets) {
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
            workoutSession: {
              userId,
              gymId: workout.gymId,
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
        if (previous) {
          gain = calculateEloGain(bestCurrent.exercise.formula, {
            previousWeight: Number(previous.weight),
            previousReps: previous.reps,
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
                Number(previous.weight),
                previous.reps,
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
            previousResult: previous
              ? { reps: previous.reps, weight: Number(previous.weight), unit: previous.unit }
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
          statusCode: 200,
          responseJson: {
            comparison,
            gainElo: totalGain,
            userOldElo: workout.user.elo,
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
}
