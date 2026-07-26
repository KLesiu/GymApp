ALTER TABLE "MuscleGroup" ADD COLUMN "isGlobal" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Exercise" ADD COLUMN "isGlobal" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "MuscleGroup_isGlobal_idx" ON "MuscleGroup"("isGlobal");
CREATE INDEX "Exercise_isGlobal_bodyPart_idx" ON "Exercise"("isGlobal", "bodyPart");
