import { z } from "zod"

export const relationshipSchema = z.object({
  traineeEmail: z
    .string()
    .trim()
    .email()
    .transform((value) => value.toLowerCase()),
})

export const relationshipParamsSchema = z.object({ relationshipId: z.string().uuid() })

export const traineeParamsSchema = z.object({ traineeId: z.string().uuid() })
