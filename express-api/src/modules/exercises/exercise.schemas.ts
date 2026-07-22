import { z } from "zod"

import { exerciseFormulas, muscleRegions } from "../../shared/constants"

export const muscleGroupSchema = z.object({
  name: z.string().min(1),
  region: z.enum(muscleRegions),
})

export const exerciseSchema = z.object({
  name: z.string().min(1),
  muscleGroupId: z.string().uuid(),
  formula: z.enum(exerciseFormulas).default("STANDARD"),
})

export const updateExerciseSchema = exerciseSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  })

export const exerciseParamsSchema = z.object({ exerciseId: z.string().uuid() })

export const lastScoresSchema = z.object({
  exerciseId: z.string().uuid(),
  exerciseName: z.string().min(1).optional(),
  series: z.number().int().positive().max(30),
  gymId: z.string().uuid().optional(),
})
