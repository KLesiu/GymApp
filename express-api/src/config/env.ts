import { config } from "dotenv"
import { z } from "zod"

config()

const envSchema = z
  .object({
    DATABASE_URL: z.string().min(1),
    JWT_SECRET: z.string().min(16),
    PORT: z.coerce.number().int().positive().default(3000),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    CORS_ORIGINS: z.string().default("*"),
  })
  .superRefine((value, context) => {
    if (value.NODE_ENV === "production" && value.CORS_ORIGINS.trim() === "*") {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["CORS_ORIGINS"],
        message: "CORS_ORIGINS must be explicit in production",
      })
    }
  })

export const env = envSchema.parse(process.env)
