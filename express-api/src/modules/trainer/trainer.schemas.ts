import { z } from "zod"

export const relationshipSchema = z.object({
  traineeCode: z
    .string()
    .trim()
    .min(8)
    .max(12)
    .transform((value) => value.toUpperCase()),
})

export const relationshipParamsSchema = z.object({ relationshipId: z.string().uuid() })

export const traineeParamsSchema = z.object({ traineeId: z.string().uuid() })
