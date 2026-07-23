import { z } from "zod"

import { weightUnits } from "../../shared/constants"

export const workoutSetSchema = z.object({
  exerciseId: z.string().uuid(),
  series: z.number().int().positive(),
  reps: z.number().int().positive(),
  weight: z.number().nonnegative(),
  unit: z.enum(weightUnits),
})

export const createWorkoutSchema = z.object({
  gymId: z.string().uuid(),
  planId: z.string().uuid().optional(),
  planDayId: z.string().uuid().optional(),
  startedAt: z.string().datetime(),
  sets: z.array(workoutSetSchema).min(1),
})

export const updateWorkoutSetsSchema = z.object({
  sets: z
    .array(
      z.object({
        id: z.string().uuid().optional(),
        exerciseId: z.string().uuid(),
        series: z.number().int().positive(),
        reps: z.number().int().positive(),
        weight: z.number().nonnegative(),
        unit: z.enum(weightUnits),
      }),
    )
    .min(1),
})

export const finalizeWorkoutSchema = z
  .object({
    sets: updateWorkoutSetsSchema.shape.sets.optional(),
  })
  .optional()
  .default({})

export const workoutParamsSchema = z.object({ workoutId: z.string().uuid() })
