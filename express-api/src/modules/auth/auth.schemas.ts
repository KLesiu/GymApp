import { z } from "zod"

export const registerSchema = z
  .object({
    name: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(8),
    cpassword: z.string().min(8),
    isVisibleInRanking: z.boolean().default(true),
  })
  .refine((value) => value.password === value.cpassword, {
    path: ["cpassword"],
    message: "Passwords must match",
  })

export const loginSchema = z.object({
  name: z.string().min(1),
  password: z.string().min(1),
})
