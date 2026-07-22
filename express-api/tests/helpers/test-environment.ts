import { execFile } from "node:child_process"
import { promisify } from "node:util"

import type { PrismaClient } from "@prisma/client"
import request from "supertest"

const execFileAsync = promisify(execFile)
const POSTGRES_IMAGE = "postgres:16"

type StartedModules = {
  readonly prisma: PrismaClient
  readonly app: ReturnType<typeof import("../../src/app")["createApp"]>
}

export class TestEnvironment {
  private databaseUrl = ""
  private prisma: PrismaClient | null = null
  private app: StartedModules["app"] | null = null
  private containerName = `lgym-api-test-${process.pid}`
  private postgresPort = 55432 + Number(process.env.VITEST_POOL_ID ?? "0")

  async start() {
    await this.startPostgresContainer()
    this.databaseUrl = `postgresql://postgres:postgres@localhost:${this.postgresPort}/lgym_test?schema=public`
    process.env.DATABASE_URL = this.databaseUrl
    process.env.JWT_SECRET = "test-secret-123456"
    process.env.PORT = "3001"
    process.env.NODE_ENV = "test"

    await this.runMigrations()

    const imported = await import("../../src/app")
    const prismaImported = await import("@prisma/client")
    const prisma = new prismaImported.PrismaClient({
      datasources: { db: { url: this.databaseUrl } },
    })
    this.prisma = prisma
    this.app = imported.createApp(prisma)
  }

  async stop() {
    if (this.prisma) {
      await this.prisma.$disconnect()
      this.prisma = null
    }

    await execFileAsync("docker", ["stop", this.containerName])
  }

  get client() {
    if (!this.app) {
      throw new Error("APP_NOT_STARTED")
    }

    return request(this.app)
  }

  get db() {
    if (!this.prisma) {
      throw new Error("PRISMA_NOT_STARTED")
    }

    return this.prisma
  }

  async reset() {
    if (!this.prisma) {
      throw new Error("PRISMA_NOT_STARTED")
    }

    await this.prisma.$executeRawUnsafe(`
      TRUNCATE TABLE
        "EloHistory",
        "ReportSubmission",
        "ReportAssignment",
        "RecurringReportRule",
        "ReportTemplateVersion",
        "ReportTemplate",
        "TrainerRelationship",
        "BodyMeasurement",
        "WorkoutSet",
        "WorkoutSession",
        "IdempotencyKey",
        "PlanAssignment",
        "PlanExercise",
        "PlanDay",
        "Plan",
        "Exercise",
        "MuscleGroup",
        "Gym",
        "UserRole",
        "User"
      RESTART IDENTITY CASCADE;
    `)
  }

  private async startPostgresContainer() {
    await execFileAsync("docker", ["rm", "-f", this.containerName]).catch((error: unknown) => {
      if (error instanceof Error) {
        return
      }
      throw error
    })

    await execFileAsync("docker", [
      "run",
      "--rm",
      "-d",
      "--name",
      this.containerName,
      "-e",
      "POSTGRES_DB=lgym_test",
      "-e",
      "POSTGRES_USER=postgres",
      "-e",
      "POSTGRES_PASSWORD=postgres",
      "-p",
      `${this.postgresPort}:5432`,
      POSTGRES_IMAGE,
    ])
  }

  private async runMigrations() {
    const npxCommand = process.platform === "win32" ? "npx.cmd" : "npx"
    for (const attempt of [1, 2, 3, 4, 5, 6] as const) {
      try {
        await execFileAsync(npxCommand, ["prisma", "migrate", "deploy"], {
          cwd: process.cwd(),
          env: { ...process.env, DATABASE_URL: this.databaseUrl },
        })
        return
      } catch (error) {
        if (attempt === 6) {
          throw error
        }
        await new Promise((resolve) => setTimeout(resolve, 1500))
      }
    }
  }
}
