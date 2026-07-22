import { z } from "zod"

export const relationshipSchema = z.object({ traineeId: z.string().uuid() })

export const relationshipParamsSchema = z.object({ relationshipId: z.string().uuid() })

export const traineeParamsSchema = z.object({ traineeId: z.string().uuid() })
