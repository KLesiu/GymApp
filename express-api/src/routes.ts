import type { PrismaClient } from "@prisma/client"
import { Router } from "express"

import { buildAuthRouter } from "./modules/auth/auth.routes"
import { buildExerciseRouter } from "./modules/exercises/exercise.routes"
import { buildGymRouter } from "./modules/gyms/gym.routes"
import { buildMeasurementRouter } from "./modules/measurements/measurement.routes"
import { buildPlanRouter } from "./modules/plans/plan.routes"
import { buildReportRouter } from "./modules/reports/report.routes"
import { buildTrainerRouter } from "./modules/trainer/trainer.routes"
import { buildUserRouter } from "./modules/users/user.routes"
import { buildWorkoutRouter } from "./modules/workouts/workout.routes"

export const buildApiRouter = (prisma: PrismaClient) => {
  const router = Router()

  router.use("/api/v1/auth", buildAuthRouter(prisma))
  router.use("/api/v1", buildUserRouter(prisma))
  router.use("/api/v1/gyms", buildGymRouter(prisma))
  router.use("/api/v1", buildExerciseRouter(prisma))
  router.use("/api/v1", buildPlanRouter(prisma))
  router.use("/api/v1", buildMeasurementRouter(prisma))
  router.use("/api/v1", buildTrainerRouter(prisma))
  router.use("/api/v1", buildReportRouter(prisma))
  router.use("/api/v1", buildWorkoutRouter(prisma))

  return router
}
