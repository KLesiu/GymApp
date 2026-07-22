import { z } from "zod"

export const planExerciseSchema = z.object({
  exerciseId: z.string().uuid(),
  series: z.number().int().positive(),
  repsTarget: z.number().int().positive(),
  orderIndex: z.number().int().nonnegative(),
})

export const planDaySchema = z.object({
  name: z.string().min(1),
  orderIndex: z.number().int().nonnegative(),
  exercises: z.array(planExerciseSchema),
})

export const createPlanSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  days: z.array(planDaySchema).min(1),
})

export const updatePlanSchema = createPlanSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  })

export const planParamsSchema = z.object({ planId: z.string().uuid() })

export const planDayParamsSchema = z.object({ planDayId: z.string().uuid() })

export const assignPlanSchema = z.object({ traineeId: z.string().uuid() })

export const setActivePlanSchema = z.object({ planId: z.string().uuid() })
