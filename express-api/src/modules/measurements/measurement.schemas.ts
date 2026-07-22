import { z } from "zod"

import { bodyParts, measurementUnits } from "../../shared/constants"

export const measurementSchema = z.object({
  bodyPart: z.enum(bodyParts),
  unit: z.enum(measurementUnits),
  value: z.number().positive(),
  takenAt: z.string().datetime(),
})

export const bulkMeasurementSchema = z.array(measurementSchema).min(1)

export const trendQuerySchema = z.object({
  userId: z.string().uuid().optional(),
  bodyPart: z.enum(bodyParts).optional(),
  unit: z.enum(measurementUnits).optional(),
})

export const measurementParamsSchema = z.object({ measurementId: z.string().uuid() })
