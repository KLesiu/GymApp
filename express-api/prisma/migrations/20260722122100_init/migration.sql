CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE "Role" AS ENUM ('TRAINEE', 'TRAINER');
CREATE TYPE "WorkoutStatus" AS ENUM ('DRAFT', 'FINALIZED');
CREATE TYPE "WeightUnit" AS ENUM ('KILOGRAMS', 'POUNDS');
CREATE TYPE "MuscleRegion" AS ENUM ('CHEST', 'BACK', 'SHOULDERS', 'BICEPS', 'TRICEPS', 'QUADS', 'HAMSTRINGS', 'GLUTES', 'CORE', 'CALVES', 'CUSTOM');
CREATE TYPE "ExerciseEloFormula" AS ENUM ('STANDARD', 'STRENGTH', 'VOLUME', 'PULLUP_INVERSE');
CREATE TYPE "TrainerRelationshipStatus" AS ENUM ('PENDING', 'ACTIVE', 'REJECTED', 'DETACHED');
CREATE TYPE "ReportFieldType" AS ENUM ('TEXT', 'NUMBER', 'SCALE');
CREATE TYPE "ReportAssignmentStatus" AS ENUM ('PENDING', 'SUBMITTED', 'REVIEWED');
CREATE TYPE "RecurrenceUnit" AS ENUM ('DAY', 'WEEK', 'MONTH');
CREATE TYPE "MeasurementUnit" AS ENUM ('KG', 'CM', 'PERCENT');
CREATE TYPE "BodyPart" AS ENUM ('WEIGHT', 'BODY_FAT', 'CHEST', 'WAIST', 'HIPS', 'THIGH', 'ARM');

CREATE TABLE "User" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL UNIQUE,
  "email" TEXT NOT NULL UNIQUE,
  "passwordHash" TEXT NOT NULL,
  "preferredTimeZone" TEXT NOT NULL DEFAULT 'UTC',
  "isVisibleInRanking" BOOLEAN NOT NULL DEFAULT TRUE,
  "elo" INTEGER NOT NULL DEFAULT 1000,
  "deletedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "UserRole" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "role" "Role" NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE ("userId", "role")
);

CREATE TABLE "Gym" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "ownerId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "deletedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "MuscleGroup" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "ownerId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "region" "MuscleRegion" NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE ("ownerId", "name")
);

CREATE TABLE "Exercise" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "ownerId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "muscleGroupId" UUID NOT NULL REFERENCES "MuscleGroup"("id") ON DELETE RESTRICT,
  "name" TEXT NOT NULL,
  "formula" "ExerciseEloFormula" NOT NULL DEFAULT 'STANDARD',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE ("ownerId", "name")
);

CREATE TABLE "Plan" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "ownerId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "PlanDay" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "planId" UUID NOT NULL REFERENCES "Plan"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "orderIndex" INTEGER NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE ("planId", "orderIndex")
);

CREATE TABLE "PlanExercise" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "planDayId" UUID NOT NULL REFERENCES "PlanDay"("id") ON DELETE CASCADE,
  "exerciseId" UUID NOT NULL REFERENCES "Exercise"("id") ON DELETE RESTRICT,
  "series" INTEGER NOT NULL,
  "repsTarget" INTEGER NOT NULL,
  "orderIndex" INTEGER NOT NULL
);

CREATE TABLE "PlanAssignment" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "planId" UUID NOT NULL REFERENCES "Plan"("id") ON DELETE CASCADE,
  "trainerId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "traineeId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "assignedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "IdempotencyKey" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "scope" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "statusCode" INTEGER NOT NULL,
  "responseJson" JSONB NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE ("userId", "scope", "key")
);

CREATE TABLE "WorkoutSession" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "gymId" UUID NOT NULL REFERENCES "Gym"("id") ON DELETE RESTRICT,
  "planId" UUID REFERENCES "Plan"("id") ON DELETE SET NULL,
  "planDayId" UUID REFERENCES "PlanDay"("id") ON DELETE SET NULL,
  "status" "WorkoutStatus" NOT NULL DEFAULT 'DRAFT',
  "startedAt" TIMESTAMPTZ NOT NULL,
  "completedAt" TIMESTAMPTZ,
  "finalizedIdempotencyKeyId" UUID UNIQUE REFERENCES "IdempotencyKey"("id") ON DELETE SET NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "WorkoutSet" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "workoutSessionId" UUID NOT NULL REFERENCES "WorkoutSession"("id") ON DELETE CASCADE,
  "exerciseId" UUID NOT NULL REFERENCES "Exercise"("id") ON DELETE RESTRICT,
  "series" INTEGER NOT NULL,
  "reps" INTEGER NOT NULL,
  "weight" DECIMAL(10, 2) NOT NULL,
  "unit" "WeightUnit" NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "BodyMeasurement" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "bodyPart" "BodyPart" NOT NULL,
  "unit" "MeasurementUnit" NOT NULL,
  "value" DECIMAL(10, 2) NOT NULL,
  "takenAt" TIMESTAMPTZ NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "TrainerRelationship" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "trainerId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "traineeId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "status" "TrainerRelationshipStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "activatedAt" TIMESTAMPTZ,
  "detachedAt" TIMESTAMPTZ,
  UNIQUE ("trainerId", "traineeId")
);

CREATE TABLE "ReportTemplate" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "trainerId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "ReportTemplateVersion" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "templateId" UUID NOT NULL REFERENCES "ReportTemplate"("id") ON DELETE CASCADE,
  "version" INTEGER NOT NULL,
  "snapshotJson" JSONB NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE ("templateId", "version")
);

CREATE TABLE "RecurringReportRule" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "trainerId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "traineeId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "templateId" UUID NOT NULL REFERENCES "ReportTemplate"("id") ON DELETE CASCADE,
  "intervalUnit" "RecurrenceUnit" NOT NULL,
  "intervalValue" INTEGER NOT NULL,
  "startsAt" TIMESTAMPTZ NOT NULL,
  "endsAt" TIMESTAMPTZ,
  "nextRunAt" TIMESTAMPTZ NOT NULL,
  "pausedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "ReportAssignment" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "trainerId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "traineeId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "templateId" UUID NOT NULL REFERENCES "ReportTemplate"("id") ON DELETE CASCADE,
  "templateVersionId" UUID NOT NULL REFERENCES "ReportTemplateVersion"("id") ON DELETE RESTRICT,
  "recurringRuleId" UUID REFERENCES "RecurringReportRule"("id") ON DELETE SET NULL,
  "dueAt" TIMESTAMPTZ,
  "note" TEXT,
  "status" "ReportAssignmentStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "submittedAt" TIMESTAMPTZ
);

CREATE TABLE "ReportSubmission" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "assignmentId" UUID NOT NULL UNIQUE REFERENCES "ReportAssignment"("id") ON DELETE CASCADE,
  "traineeId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "payloadJson" JSONB NOT NULL,
  "submittedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "trainerOverallComment" TEXT,
  "trainerFieldCommentsJson" JSONB,
  "feedbackReadAt" TIMESTAMPTZ
);

CREATE TABLE "EloHistory" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "workoutSessionId" UUID NOT NULL REFERENCES "WorkoutSession"("id") ON DELETE CASCADE,
  "exerciseId" UUID NOT NULL REFERENCES "Exercise"("id") ON DELETE RESTRICT,
  "previousElo" INTEGER NOT NULL,
  "gain" INTEGER NOT NULL,
  "newElo" INTEGER NOT NULL,
  "formula" "ExerciseEloFormula" NOT NULL,
  "score" DECIMAL(12, 4) NOT NULL,
  "previousScore" DECIMAL(12, 4),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE ("workoutSessionId", "exerciseId")
);

CREATE INDEX "Gym_ownerId_deletedAt_idx" ON "Gym" ("ownerId", "deletedAt");
CREATE INDEX "Plan_ownerId_createdAt_idx" ON "Plan" ("ownerId", "createdAt");
CREATE INDEX "PlanAssignment_traineeId_isActive_idx" ON "PlanAssignment" ("traineeId", "isActive");
CREATE INDEX "WorkoutSession_userId_gymId_status_completedAt_idx" ON "WorkoutSession" ("userId", "gymId", "status", "completedAt");
CREATE INDEX "WorkoutSession_userId_completedAt_idx" ON "WorkoutSession" ("userId", "completedAt");
CREATE INDEX "WorkoutSet_exerciseId_series_idx" ON "WorkoutSet" ("exerciseId", "series");
CREATE INDEX "WorkoutSet_workoutSessionId_exerciseId_series_idx" ON "WorkoutSet" ("workoutSessionId", "exerciseId", "series");
CREATE INDEX "BodyMeasurement_userId_bodyPart_takenAt_idx" ON "BodyMeasurement" ("userId", "bodyPart", "takenAt");
CREATE INDEX "TrainerRelationship_traineeId_status_idx" ON "TrainerRelationship" ("traineeId", "status");
CREATE INDEX "ReportAssignment_traineeId_status_dueAt_idx" ON "ReportAssignment" ("traineeId", "status", "dueAt");
CREATE INDEX "EloHistory_userId_createdAt_idx" ON "EloHistory" ("userId", "createdAt");
