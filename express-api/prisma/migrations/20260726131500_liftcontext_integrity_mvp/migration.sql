ALTER TABLE "User" ADD COLUMN "connectionCode" TEXT;

UPDATE "User"
SET "connectionCode" = upper(substr(replace("id"::text, '-', ''), 1, 10))
WHERE "connectionCode" IS NULL;

ALTER TABLE "User" ALTER COLUMN "connectionCode" SET NOT NULL;
CREATE UNIQUE INDEX "User_connectionCode_key" ON "User"("connectionCode");

ALTER TABLE "Plan" ADD COLUMN "weeksCount" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "PlanDay" ADD COLUMN "weekNumber" INTEGER NOT NULL DEFAULT 1;

ALTER TABLE "PlanDay" DROP CONSTRAINT IF EXISTS "PlanDay_planId_orderIndex_key";
CREATE UNIQUE INDEX "PlanDay_planId_weekNumber_orderIndex_key" ON "PlanDay"("planId", "weekNumber", "orderIndex");

ALTER TABLE "IdempotencyKey" ADD COLUMN "resourceId" TEXT;
ALTER TABLE "IdempotencyKey" ADD COLUMN "requestHash" TEXT NOT NULL DEFAULT '';

CREATE UNIQUE INDEX "TrainerRelationship_one_active_trainer_per_trainee" ON "TrainerRelationship"("traineeId") WHERE "status" = 'ACTIVE';
