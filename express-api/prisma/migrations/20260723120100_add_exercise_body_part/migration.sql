ALTER TABLE "Exercise" ADD COLUMN "bodyPart" "BodyPart" NOT NULL DEFAULT 'CHEST';

UPDATE "Exercise"
SET "bodyPart" = CASE "MuscleGroup"."region"
  WHEN 'BACK' THEN 'BACK'::"BodyPart"
  WHEN 'SHOULDERS' THEN 'SHOULDERS'::"BodyPart"
  WHEN 'BICEPS' THEN 'BICEPS'::"BodyPart"
  WHEN 'TRICEPS' THEN 'TRICEPS'::"BodyPart"
  WHEN 'QUADS' THEN 'QUADS'::"BodyPart"
  WHEN 'HAMSTRINGS' THEN 'HAMSTRINGS'::"BodyPart"
  WHEN 'GLUTES' THEN 'GLUTES'::"BodyPart"
  WHEN 'CORE' THEN 'CORE'::"BodyPart"
  WHEN 'CALVES' THEN 'CALVES'::"BodyPart"
  ELSE 'CHEST'::"BodyPart"
END
FROM "MuscleGroup"
WHERE "Exercise"."muscleGroupId" = "MuscleGroup"."id";

ALTER TABLE "Exercise" ALTER COLUMN "bodyPart" DROP DEFAULT;
