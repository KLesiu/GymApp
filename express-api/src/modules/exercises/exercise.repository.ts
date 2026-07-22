import type { ExerciseEloFormula, MuscleRegion, PrismaClient } from "@prisma/client"

export class ExerciseRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async createMuscleGroup(ownerId: string, name: string, region: MuscleRegion) {
    return this.prisma.muscleGroup.create({ data: { ownerId, name, region } })
  }

  async listMuscleGroups(ownerId: string) {
    return this.prisma.muscleGroup.findMany({ where: { ownerId }, orderBy: { name: "asc" } })
  }

  async createExercise(
    ownerId: string,
    muscleGroupId: string,
    name: string,
    formula: ExerciseEloFormula,
  ) {
    return this.prisma.exercise.create({
      data: { ownerId, muscleGroupId, name, formula },
    })
  }

  async listExercises(ownerId: string) {
    return this.prisma.exercise.findMany({
      where: { ownerId },
      include: { muscleGroup: true },
      orderBy: { name: "asc" },
    })
  }

  async findExercise(ownerId: string, exerciseId: string) {
    return this.prisma.exercise.findFirst({
      where: { id: exerciseId, ownerId },
      include: { muscleGroup: true },
    })
  }

  async updateExercise(
    ownerId: string,
    exerciseId: string,
    input: {
      readonly name?: string
      readonly muscleGroupId?: string
      readonly formula?: ExerciseEloFormula
    },
  ) {
    return this.prisma.exercise.updateMany({
      where: { id: exerciseId, ownerId },
      data: input,
    })
  }

  async deleteExercise(ownerId: string, exerciseId: string) {
    return this.prisma.exercise.deleteMany({ where: { id: exerciseId, ownerId } })
  }

  async getLastScores(userId: string, exerciseId: string, series: number, gymId?: string) {
    const sessions = await this.prisma.workoutSession.findMany({
      where: {
        userId,
        status: "FINALIZED",
        completedAt: { not: null },
        ...(gymId ? { gymId } : {}),
      },
      include: {
        gym: true,
        sets: {
          where: { exerciseId },
          orderBy: [{ series: "asc" }, { createdAt: "desc" }],
        },
      },
      orderBy: { completedAt: "desc" },
    })

    const scoreBySeries = new Map<
      number,
      { readonly score: (typeof sessions)[number]["sets"][number]; readonly gymName: string }
    >()

    for (const session of sessions) {
      for (const set of session.sets) {
        if (!scoreBySeries.has(set.series)) {
          scoreBySeries.set(set.series, { score: set, gymName: session.gym.name })
        }
      }
    }

    return Array.from({ length: series }, (_unused, index) => {
      const seriesIndex = index + 1
      const match = scoreBySeries.get(seriesIndex)

      return {
        series: seriesIndex,
        score: match
          ? {
              _id: match.score.id,
              reps: match.score.reps,
              weight: Number(match.score.weight),
              gymName: match.gymName,
            }
          : null,
      }
    })
  }
}
