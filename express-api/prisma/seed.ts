import { PrismaClient } from "@prisma/client"
import type { BodyPart, ExerciseEloFormula, MuscleRegion } from "@prisma/client"
import argon2 from "argon2"

const prisma = new PrismaClient()
const systemOwnerPasswordHash =
  "$argon2id$v=19$m=65536,t=3,p=4$hvtKSWgQ966Br7n1M5ddkQ$jW6eI5at4J8bDExqmKY237d/LSVcUAv/QKGq2k0rKq0"

type StarterExercise = {
  readonly name: string
  readonly bodyPart: BodyPart
  readonly region: MuscleRegion
  readonly formula?: ExerciseEloFormula
}

export const starterExercises: readonly StarterExercise[] = [
  { name: "Barbell Bench Press", bodyPart: "CHEST", region: "CHEST", formula: "STRENGTH" },
  { name: "Incline Dumbbell Press", bodyPart: "CHEST", region: "CHEST", formula: "STRENGTH" },
  { name: "Dumbbell Fly", bodyPart: "CHEST", region: "CHEST", formula: "VOLUME" },
  { name: "Cable Chest Press", bodyPart: "CHEST", region: "CHEST", formula: "VOLUME" },
  { name: "Push Up", bodyPart: "CHEST", region: "CHEST", formula: "VOLUME" },
  { name: "Pull Up", bodyPart: "BACK", region: "BACK", formula: "PULLUP_INVERSE" },
  { name: "Lat Pulldown", bodyPart: "BACK", region: "BACK", formula: "STRENGTH" },
  { name: "Barbell Row", bodyPart: "BACK", region: "BACK", formula: "STRENGTH" },
  { name: "Seated Cable Row", bodyPart: "BACK", region: "BACK", formula: "VOLUME" },
  { name: "Single Arm Dumbbell Row", bodyPart: "BACK", region: "BACK", formula: "STRENGTH" },
  { name: "Overhead Press", bodyPart: "SHOULDERS", region: "SHOULDERS", formula: "STRENGTH" },
  {
    name: "Dumbbell Shoulder Press",
    bodyPart: "SHOULDERS",
    region: "SHOULDERS",
    formula: "STRENGTH",
  },
  { name: "Lateral Raise", bodyPart: "SHOULDERS", region: "SHOULDERS", formula: "VOLUME" },
  { name: "Rear Delt Fly", bodyPart: "SHOULDERS", region: "SHOULDERS", formula: "VOLUME" },
  { name: "Face Pull", bodyPart: "SHOULDERS", region: "SHOULDERS", formula: "VOLUME" },
  { name: "Barbell Curl", bodyPart: "BICEPS", region: "BICEPS", formula: "STRENGTH" },
  { name: "Dumbbell Curl", bodyPart: "BICEPS", region: "BICEPS", formula: "STRENGTH" },
  { name: "Hammer Curl", bodyPart: "BICEPS", region: "BICEPS", formula: "VOLUME" },
  { name: "Cable Curl", bodyPart: "BICEPS", region: "BICEPS", formula: "VOLUME" },
  { name: "Preacher Curl", bodyPart: "BICEPS", region: "BICEPS", formula: "VOLUME" },
  { name: "Close Grip Bench Press", bodyPart: "TRICEPS", region: "TRICEPS", formula: "STRENGTH" },
  { name: "Triceps Pushdown", bodyPart: "TRICEPS", region: "TRICEPS", formula: "VOLUME" },
  { name: "Overhead Triceps Extension", bodyPart: "TRICEPS", region: "TRICEPS", formula: "VOLUME" },
  { name: "Skull Crusher", bodyPart: "TRICEPS", region: "TRICEPS", formula: "STRENGTH" },
  { name: "Assisted Dip", bodyPart: "TRICEPS", region: "TRICEPS", formula: "VOLUME" },
  { name: "Back Squat", bodyPart: "QUADS", region: "QUADS", formula: "STRENGTH" },
  { name: "Front Squat", bodyPart: "QUADS", region: "QUADS", formula: "STRENGTH" },
  { name: "Leg Press", bodyPart: "QUADS", region: "QUADS", formula: "STRENGTH" },
  { name: "Walking Lunge", bodyPart: "QUADS", region: "QUADS", formula: "VOLUME" },
  { name: "Leg Extension", bodyPart: "QUADS", region: "QUADS", formula: "VOLUME" },
  { name: "Romanian Deadlift", bodyPart: "HAMSTRINGS", region: "HAMSTRINGS", formula: "STRENGTH" },
  { name: "Lying Leg Curl", bodyPart: "HAMSTRINGS", region: "HAMSTRINGS", formula: "VOLUME" },
  { name: "Seated Leg Curl", bodyPart: "HAMSTRINGS", region: "HAMSTRINGS", formula: "VOLUME" },
  { name: "Good Morning", bodyPart: "HAMSTRINGS", region: "HAMSTRINGS", formula: "STRENGTH" },
  { name: "Nordic Curl", bodyPart: "HAMSTRINGS", region: "HAMSTRINGS", formula: "VOLUME" },
  { name: "Hip Thrust", bodyPart: "GLUTES", region: "GLUTES", formula: "STRENGTH" },
  { name: "Glute Bridge", bodyPart: "GLUTES", region: "GLUTES", formula: "VOLUME" },
  { name: "Cable Kickback", bodyPart: "GLUTES", region: "GLUTES", formula: "VOLUME" },
  { name: "Bulgarian Split Squat", bodyPart: "GLUTES", region: "GLUTES", formula: "STRENGTH" },
  { name: "Step Up", bodyPart: "GLUTES", region: "GLUTES", formula: "VOLUME" },
  { name: "Cable Crunch", bodyPart: "CORE", region: "CORE", formula: "VOLUME" },
  { name: "Weighted Plank", bodyPart: "CORE", region: "CORE", formula: "VOLUME" },
  { name: "Hanging Leg Raise", bodyPart: "CORE", region: "CORE", formula: "VOLUME" },
  { name: "Pallof Press", bodyPart: "CORE", region: "CORE", formula: "VOLUME" },
  { name: "Russian Twist", bodyPart: "CORE", region: "CORE", formula: "VOLUME" },
  { name: "Standing Calf Raise", bodyPart: "CALVES", region: "CALVES", formula: "STRENGTH" },
  { name: "Seated Calf Raise", bodyPart: "CALVES", region: "CALVES", formula: "STRENGTH" },
  { name: "Donkey Calf Raise", bodyPart: "CALVES", region: "CALVES", formula: "VOLUME" },
  { name: "Single Leg Calf Raise", bodyPart: "CALVES", region: "CALVES", formula: "VOLUME" },
  { name: "Tibialis Raise", bodyPart: "CALVES", region: "CALVES", formula: "VOLUME" },
]

const seed = async () => {
  const passwordHash = await argon2.hash("password123")

  const trainer = await prisma.user.upsert({
    where: { name: "seed-trainer" },
    update: {},
    create: {
      name: "seed-trainer",
      email: "trainer@example.com",
      connectionCode: "TRAINER001",
      passwordHash,
      roles: { create: [{ role: "TRAINER" }] },
    },
    include: { roles: true },
  })

  const trainee = await prisma.user.upsert({
    where: { name: "seed-trainee" },
    update: {},
    create: {
      name: "seed-trainee",
      email: "trainee@example.com",
      connectionCode: "TRAINEE001",
      passwordHash,
      roles: { create: [{ role: "TRAINEE" }] },
    },
    include: { roles: true },
  })

  const relationship = await prisma.trainerRelationship.upsert({
    where: { trainerId_traineeId: { trainerId: trainer.id, traineeId: trainee.id } },
    update: { status: "ACTIVE", activatedAt: new Date(), detachedAt: null },
    create: {
      trainerId: trainer.id,
      traineeId: trainee.id,
      status: "ACTIVE",
      activatedAt: new Date(),
    },
  })

  await prisma.gym.upsert({
    where: { id: "11111111-1111-1111-1111-111111111111" },
    update: {},
    create: {
      id: "11111111-1111-1111-1111-111111111111",
      ownerId: trainee.id,
      name: "Seed Gym",
      address: "Seed Address",
    },
  })

  await seedGlobalStarterExercises(prisma)

  process.stdout.write(
    `Seeded trainer ${trainer.id}, trainee ${trainee.id}, relationship ${relationship.id}, ${starterExercises.length} global exercises\n`,
  )
}

export const seedGlobalStarterExercises = async (client: PrismaClient) => {
  const admin = await client.user.upsert({
    where: { name: "liftcontext-admin" },
    update: { passwordHash: systemOwnerPasswordHash, isVisibleInRanking: false },
    create: {
      name: "liftcontext-admin",
      email: "admin@liftcontext.local",
      connectionCode: "ADMIN000001",
      passwordHash: systemOwnerPasswordHash,
      isVisibleInRanking: false,
      roles: { create: [{ role: "TRAINER" }] },
    },
  })

  const groups = new Map<MuscleRegion, string>()
  for (const exercise of starterExercises) {
    if (!groups.has(exercise.region)) {
      const group = await client.muscleGroup.upsert({
        where: { ownerId_name: { ownerId: admin.id, name: `Global ${exercise.region}` } },
        update: { isGlobal: true, region: exercise.region },
        create: {
          ownerId: admin.id,
          name: `Global ${exercise.region}`,
          region: exercise.region,
          isGlobal: true,
        },
      })
      groups.set(exercise.region, group.id)
    }

    const muscleGroupId = groups.get(exercise.region)
    if (!muscleGroupId) {
      throw new Error(`Missing global muscle group for ${exercise.region}`)
    }

    await client.exercise.upsert({
      where: { ownerId_name: { ownerId: admin.id, name: exercise.name } },
      update: {
        muscleGroupId,
        bodyPart: exercise.bodyPart,
        formula: exercise.formula ?? "STANDARD",
        isGlobal: true,
      },
      create: {
        ownerId: admin.id,
        muscleGroupId,
        name: exercise.name,
        bodyPart: exercise.bodyPart,
        formula: exercise.formula ?? "STANDARD",
        isGlobal: true,
      },
    })
  }
}

if (require.main === module) {
  seed()
    .finally(async () => {
      await prisma.$disconnect()
    })
    .catch(async (error: unknown) => {
      process.stderr.write(`${String(error)}\n`)
      await prisma.$disconnect()
      process.exit(1)
    })
}
