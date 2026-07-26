import type { BodyPart, ExerciseEloFormula, MuscleRegion, PrismaClient } from "@prisma/client"

const bodyPartToMuscleRegion: Record<BodyPart, MuscleRegion> = {
  WEIGHT: "CUSTOM",
  BODY_FAT: "CUSTOM",
  CHEST: "CHEST",
  BACK: "BACK",
  SHOULDERS: "SHOULDERS",
  BICEPS: "BICEPS",
  TRICEPS: "TRICEPS",
  QUADS: "QUADS",
  HAMSTRINGS: "HAMSTRINGS",
  GLUTES: "GLUTES",
  CORE: "CORE",
  CALVES: "CALVES",
  WAIST: "CORE",
  HIPS: "GLUTES",
  THIGH: "QUADS",
  ARM: "BICEPS",
}

export class ExerciseRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async createMuscleGroup(ownerId: string, name: string, region: MuscleRegion) {
    return this.prisma.muscleGroup.create({ data: { ownerId, name, region } })
  }

  async listMuscleGroups(ownerId: string) {
    return this.prisma.muscleGroup.findMany({
      where: { OR: [{ ownerId }, { isGlobal: true }] },
      orderBy: [{ isGlobal: "desc" }, { name: "asc" }],
    })
  }

  async createExercise(
    ownerId: string,
    muscleGroupId: string | undefined,
    name: string,
    bodyPart: BodyPart,
    formula: ExerciseEloFormula,
  ) {
    const resolvedMuscleGroupId =
      muscleGroupId ?? (await this.findOrCreateBodyPartMuscleGroup(ownerId, bodyPart)).id

    return this.prisma.exercise.create({
      data: { ownerId, muscleGroupId: resolvedMuscleGroupId, name, bodyPart, formula },
    })
  }

  async listExercises(ownerId: string) {
    return this.prisma.exercise.findMany({
      where: { OR: [{ ownerId }, { isGlobal: true }] },
      include: { muscleGroup: true },
      orderBy: [{ isGlobal: "desc" }, { name: "asc" }],
    })
  }

  async findExercise(ownerId: string, exerciseId: string) {
    return this.prisma.exercise.findFirst({
      where: { id: exerciseId, OR: [{ ownerId }, { isGlobal: true }] },
      include: { muscleGroup: true },
    })
  }

  async updateExercise(
    ownerId: string,
    exerciseId: string,
    input: {
      readonly name?: string
      readonly muscleGroupId?: string
      readonly bodyPart?: BodyPart
      readonly formula?: ExerciseEloFormula
    },
  ) {
    return this.prisma.exercise.updateMany({
      where: { id: exerciseId, ownerId },
      data: input,
    })
  }

  private async findOrCreateBodyPartMuscleGroup(ownerId: string, bodyPart: BodyPart) {
    const name = `${bodyPart} exercises`

    return this.prisma.muscleGroup.upsert({
      where: { ownerId_name: { ownerId, name } },
      update: {},
      create: { ownerId, name, region: bodyPartToMuscleRegion[bodyPart] },
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
