import { PrismaClient } from "@prisma/client"
import argon2 from "argon2"

const prisma = new PrismaClient()

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

  process.stdout.write(
    `Seeded trainer ${trainer.id}, trainee ${trainee.id}, relationship ${relationship.id}\n`,
  )
}

seed()
  .finally(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error: unknown) => {
    process.stderr.write(`${String(error)}\n`)
    await prisma.$disconnect()
    process.exit(1)
  })
