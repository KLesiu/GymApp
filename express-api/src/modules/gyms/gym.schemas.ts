import { z } from "zod"

export const gymSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
})

export const gymParamsSchema = z.object({
  gymId: z.string().uuid(),
})
