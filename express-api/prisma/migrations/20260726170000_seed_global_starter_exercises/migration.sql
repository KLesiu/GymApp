WITH admin_user AS (
  INSERT INTO "User" (
    "id",
    "name",
    "email",
    "connectionCode",
    "passwordHash",
    "preferredTimeZone",
    "isVisibleInRanking",
    "elo",
    "createdAt",
    "updatedAt"
  )
  VALUES (
    '00000000-0000-0000-0000-000000000001',
    'liftcontext-admin',
    'admin@liftcontext.local',
    'ADMIN000001',
    '$argon2id$v=19$m=65536,t=3,p=4$hvtKSWgQ966Br7n1M5ddkQ$jW6eI5at4J8bDExqmKY237d/LSVcUAv/QKGq2k0rKq0',
    'UTC',
    false,
    1000,
    NOW(),
    NOW()
  )
  ON CONFLICT ("id") DO UPDATE SET
    "email" = EXCLUDED."email",
    "connectionCode" = EXCLUDED."connectionCode",
    "passwordHash" = EXCLUDED."passwordHash",
    "isVisibleInRanking" = false,
    "updatedAt" = NOW()
  RETURNING "id"
), admin_id AS (
  SELECT "id" FROM admin_user
  UNION ALL
  SELECT "id" FROM "User" WHERE "id" = '00000000-0000-0000-0000-000000000001'
  LIMIT 1
), trainer_role AS (
  INSERT INTO "UserRole" ("userId", "role")
  SELECT "id", 'TRAINER'::"Role" FROM admin_id
  ON CONFLICT ("userId", "role") DO NOTHING
), starter_exercises ("name", "bodyPart", "region", "formula") AS (
  VALUES
    ('Barbell Bench Press', 'CHEST', 'CHEST', 'STRENGTH'),
    ('Incline Dumbbell Press', 'CHEST', 'CHEST', 'STRENGTH'),
    ('Dumbbell Fly', 'CHEST', 'CHEST', 'VOLUME'),
    ('Cable Chest Press', 'CHEST', 'CHEST', 'VOLUME'),
    ('Push Up', 'CHEST', 'CHEST', 'VOLUME'),
    ('Pull Up', 'BACK', 'BACK', 'PULLUP_INVERSE'),
    ('Lat Pulldown', 'BACK', 'BACK', 'STRENGTH'),
    ('Barbell Row', 'BACK', 'BACK', 'STRENGTH'),
    ('Seated Cable Row', 'BACK', 'BACK', 'VOLUME'),
    ('Single Arm Dumbbell Row', 'BACK', 'BACK', 'STRENGTH'),
    ('Overhead Press', 'SHOULDERS', 'SHOULDERS', 'STRENGTH'),
    ('Dumbbell Shoulder Press', 'SHOULDERS', 'SHOULDERS', 'STRENGTH'),
    ('Lateral Raise', 'SHOULDERS', 'SHOULDERS', 'VOLUME'),
    ('Rear Delt Fly', 'SHOULDERS', 'SHOULDERS', 'VOLUME'),
    ('Face Pull', 'SHOULDERS', 'SHOULDERS', 'VOLUME'),
    ('Barbell Curl', 'BICEPS', 'BICEPS', 'STRENGTH'),
    ('Dumbbell Curl', 'BICEPS', 'BICEPS', 'STRENGTH'),
    ('Hammer Curl', 'BICEPS', 'BICEPS', 'VOLUME'),
    ('Cable Curl', 'BICEPS', 'BICEPS', 'VOLUME'),
    ('Preacher Curl', 'BICEPS', 'BICEPS', 'VOLUME'),
    ('Close Grip Bench Press', 'TRICEPS', 'TRICEPS', 'STRENGTH'),
    ('Triceps Pushdown', 'TRICEPS', 'TRICEPS', 'VOLUME'),
    ('Overhead Triceps Extension', 'TRICEPS', 'TRICEPS', 'VOLUME'),
    ('Skull Crusher', 'TRICEPS', 'TRICEPS', 'STRENGTH'),
    ('Assisted Dip', 'TRICEPS', 'TRICEPS', 'VOLUME'),
    ('Back Squat', 'QUADS', 'QUADS', 'STRENGTH'),
    ('Front Squat', 'QUADS', 'QUADS', 'STRENGTH'),
    ('Leg Press', 'QUADS', 'QUADS', 'STRENGTH'),
    ('Walking Lunge', 'QUADS', 'QUADS', 'VOLUME'),
    ('Leg Extension', 'QUADS', 'QUADS', 'VOLUME'),
    ('Romanian Deadlift', 'HAMSTRINGS', 'HAMSTRINGS', 'STRENGTH'),
    ('Lying Leg Curl', 'HAMSTRINGS', 'HAMSTRINGS', 'VOLUME'),
    ('Seated Leg Curl', 'HAMSTRINGS', 'HAMSTRINGS', 'VOLUME'),
    ('Good Morning', 'HAMSTRINGS', 'HAMSTRINGS', 'STRENGTH'),
    ('Nordic Curl', 'HAMSTRINGS', 'HAMSTRINGS', 'VOLUME'),
    ('Hip Thrust', 'GLUTES', 'GLUTES', 'STRENGTH'),
    ('Glute Bridge', 'GLUTES', 'GLUTES', 'VOLUME'),
    ('Cable Kickback', 'GLUTES', 'GLUTES', 'VOLUME'),
    ('Bulgarian Split Squat', 'GLUTES', 'GLUTES', 'STRENGTH'),
    ('Step Up', 'GLUTES', 'GLUTES', 'VOLUME'),
    ('Cable Crunch', 'CORE', 'CORE', 'VOLUME'),
    ('Weighted Plank', 'CORE', 'CORE', 'VOLUME'),
    ('Hanging Leg Raise', 'CORE', 'CORE', 'VOLUME'),
    ('Pallof Press', 'CORE', 'CORE', 'VOLUME'),
    ('Russian Twist', 'CORE', 'CORE', 'VOLUME'),
    ('Standing Calf Raise', 'CALVES', 'CALVES', 'STRENGTH'),
    ('Seated Calf Raise', 'CALVES', 'CALVES', 'STRENGTH'),
    ('Donkey Calf Raise', 'CALVES', 'CALVES', 'VOLUME'),
    ('Single Leg Calf Raise', 'CALVES', 'CALVES', 'VOLUME'),
    ('Tibialis Raise', 'CALVES', 'CALVES', 'VOLUME')
), global_groups AS (
  INSERT INTO "MuscleGroup" ("ownerId", "name", "region", "isGlobal")
  SELECT admin_id."id", 'Global ' || starter_exercises."region", starter_exercises."region"::"MuscleRegion", true
  FROM admin_id
  CROSS JOIN (SELECT DISTINCT "region" FROM starter_exercises) starter_exercises
  ON CONFLICT ("ownerId", "name") DO UPDATE SET
    "region" = EXCLUDED."region",
    "isGlobal" = true
  RETURNING "id", "region"
)
INSERT INTO "Exercise" ("ownerId", "muscleGroupId", "name", "bodyPart", "formula", "isGlobal")
SELECT
  admin_id."id",
  global_groups."id",
  starter_exercises."name",
  starter_exercises."bodyPart"::"BodyPart",
  starter_exercises."formula"::"ExerciseEloFormula",
  true
FROM starter_exercises
CROSS JOIN admin_id
JOIN global_groups ON global_groups."region" = starter_exercises."region"::"MuscleRegion"
ON CONFLICT ("ownerId", "name") DO UPDATE SET
  "muscleGroupId" = EXCLUDED."muscleGroupId",
  "bodyPart" = EXCLUDED."bodyPart",
  "formula" = EXCLUDED."formula",
  "isGlobal" = true;
