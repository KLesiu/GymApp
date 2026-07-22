import type { ExerciseEloFormula, MuscleRegion } from "@prisma/client"

import { NotFoundError } from "../../core/errors/app-error"
import type { ExerciseRepository } from "./exercise.repository"

export class ExerciseService {
  constructor(private readonly repository: ExerciseRepository) {}

  async createMuscleGroup(userId: string, name: string, region: MuscleRegion) {
    const muscleGroup = await this.repository.createMuscleGroup(userId, name, region)
    return { _id: muscleGroup.id, name: muscleGroup.name, region: muscleGroup.region }
  }

  async listMuscleGroups(userId: string) {
    const items = await this.repository.listMuscleGroups(userId)
    return items.map((item) => ({ _id: item.id, name: item.name, region: item.region }))
  }

  async createExercise(
    userId: string,
    muscleGroupId: string,
    name: string,
    formula: ExerciseEloFormula,
  ) {
    const exercise = await this.repository.createExercise(userId, muscleGroupId, name, formula)
    return {
      _id: exercise.id,
      name: exercise.name,
      muscleGroupId: exercise.muscleGroupId,
      formula: exercise.formula,
    }
  }

  async listExercises(userId: string) {
    const items = await this.repository.listExercises(userId)
    return items.map((item) => ({
      _id: item.id,
      name: item.name,
      formula: item.formula,
      muscleGroup: {
        _id: item.muscleGroup.id,
        name: item.muscleGroup.name,
        region: item.muscleGroup.region,
      },
    }))
  }

  async getExercise(userId: string, exerciseId: string) {
    const exercise = await this.repository.findExercise(userId, exerciseId)
    if (!exercise) {
      throw new NotFoundError("EXERCISE_NOT_FOUND")
    }

    return {
      _id: exercise.id,
      name: exercise.name,
      formula: exercise.formula,
      muscleGroup: {
        _id: exercise.muscleGroup.id,
        name: exercise.muscleGroup.name,
        region: exercise.muscleGroup.region,
      },
    }
  }

  async updateExercise(
    userId: string,
    exerciseId: string,
    input: {
      readonly name?: string
      readonly muscleGroupId?: string
      readonly formula?: ExerciseEloFormula
    },
  ) {
    const result = await this.repository.updateExercise(userId, exerciseId, input)
    if (result.count === 0) {
      throw new NotFoundError("EXERCISE_NOT_FOUND")
    }
    return this.getExercise(userId, exerciseId)
  }

  async deleteExercise(userId: string, exerciseId: string) {
    const result = await this.repository.deleteExercise(userId, exerciseId)
    if (result.count === 0) {
      throw new NotFoundError("EXERCISE_NOT_FOUND")
    }
    return { msg: "DELETED" }
  }

  async getLastExerciseScores(userId: string, exerciseId: string, series: number, gymId?: string) {
    const exercise = await this.repository.findExercise(userId, exerciseId)

    if (!exercise) {
      throw new NotFoundError("EXERCISE_NOT_FOUND")
    }

    return {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      seriesScores: await this.repository.getLastScores(userId, exerciseId, series, gymId),
    }
  }
}
