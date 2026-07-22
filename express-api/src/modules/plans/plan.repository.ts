import type { PrismaClient } from "@prisma/client"

export class PlanRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(
    ownerId: string,
    input: {
      readonly name: string
      readonly description?: string
      readonly days: readonly {
        readonly name: string
        readonly orderIndex: number
        readonly exercises: readonly {
          readonly exerciseId: string
          readonly series: number
          readonly repsTarget: number
          readonly orderIndex: number
        }[]
      }[]
    },
  ) {
    return this.prisma.plan.create({
      data: {
        ownerId,
        name: input.name,
        description: input.description ?? null,
        days: {
          create: input.days.map((day) => ({
            name: day.name,
            orderIndex: day.orderIndex,
            exercises: {
              create: day.exercises.map((exercise) => ({
                exerciseId: exercise.exerciseId,
                series: exercise.series,
                repsTarget: exercise.repsTarget,
                orderIndex: exercise.orderIndex,
              })),
            },
          })),
        },
      },
      include: {
        days: {
          include: { exercises: true },
          orderBy: { orderIndex: "asc" },
        },
      },
    })
  }

  async list(ownerId: string) {
    return this.prisma.plan.findMany({
      where: { ownerId },
      include: { days: { include: { exercises: true }, orderBy: { orderIndex: "asc" } } },
      orderBy: { createdAt: "desc" },
    })
  }

  async findById(planId: string) {
    return this.prisma.plan.findUnique({
      where: { id: planId },
      include: { days: { include: { exercises: true }, orderBy: { orderIndex: "asc" } } },
    })
  }

  async updatePlan(
    ownerId: string,
    planId: string,
    input: {
      readonly name?: string
      readonly description?: string
    },
  ) {
    return this.prisma.plan.updateMany({ where: { id: planId, ownerId }, data: input })
  }

  async deletePlan(ownerId: string, planId: string) {
    return this.prisma.plan.deleteMany({ where: { id: planId, ownerId } })
  }

  async copyPlan(ownerId: string, planId: string) {
    const plan = await this.findById(planId)
    if (!plan) {
      return null
    }

    const copiedInput = {
      name: `${plan.name} copy`,
      days: plan.days.map((day) => ({
        name: day.name,
        orderIndex: day.orderIndex,
        exercises: day.exercises.map((exercise) => ({
          exerciseId: exercise.exerciseId,
          series: exercise.series,
          repsTarget: exercise.repsTarget,
          orderIndex: exercise.orderIndex,
        })),
      })),
      ...(plan.description ? { description: plan.description } : {}),
    }

    return this.create(ownerId, copiedInput)
  }

  async createPlanDay(
    planId: string,
    input: {
      readonly name: string
      readonly orderIndex: number
      readonly exercises: readonly {
        readonly exerciseId: string
        readonly series: number
        readonly repsTarget: number
        readonly orderIndex: number
      }[]
    },
  ) {
    return this.prisma.planDay.create({
      data: {
        planId,
        name: input.name,
        orderIndex: input.orderIndex,
        exercises: { create: input.exercises.map((exercise) => ({ ...exercise })) },
      },
      include: { plan: true, exercises: true },
    })
  }

  async findPlanDay(ownerId: string, planDayId: string) {
    return this.prisma.planDay.findFirst({
      where: { id: planDayId, plan: { ownerId } },
      include: { exercises: true },
    })
  }

  async listPlanDays(ownerId: string, planId: string) {
    return this.prisma.planDay.findMany({
      where: { planId, plan: { ownerId } },
      include: { exercises: true },
      orderBy: { orderIndex: "asc" },
    })
  }

  async deletePlanDay(ownerId: string, planDayId: string) {
    return this.prisma.planDay.deleteMany({ where: { id: planDayId, plan: { ownerId } } })
  }

  async assignPlan(planId: string, trainerId: string, traineeId: string) {
    await this.prisma.planAssignment.updateMany({
      where: { traineeId, isActive: true },
      data: { isActive: false },
    })

    return this.prisma.planAssignment.create({
      data: { planId, trainerId, traineeId, isActive: true },
    })
  }

  async getActiveAssignment(traineeId: string) {
    return this.prisma.planAssignment.findFirst({
      where: { traineeId, isActive: true },
      include: {
        plan: {
          include: { days: { include: { exercises: true }, orderBy: { orderIndex: "asc" } } },
        },
      },
    })
  }
}
