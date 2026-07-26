import type { PrismaClient } from "@prisma/client"

const planDayOrder = [{ weekNumber: "asc" as const }, { orderIndex: "asc" as const }]

export class PlanRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(
    ownerId: string,
    input: {
      readonly name: string
      readonly description?: string
      readonly weeksCount?: number
      readonly days?: readonly {
        readonly name: string
        readonly weekNumber?: number
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
        weeksCount: input.weeksCount ?? 1,
        days: {
          create: (input.days ?? []).map((day) => ({
            name: day.name,
            weekNumber: day.weekNumber ?? 1,
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
          orderBy: planDayOrder,
        },
      },
    })
  }

  async list(ownerId: string) {
    return this.prisma.plan.findMany({
      where: { ownerId },
      include: { days: { include: { exercises: true }, orderBy: planDayOrder } },
      orderBy: { createdAt: "desc" },
    })
  }

  async findById(planId: string) {
    return this.prisma.plan.findUnique({
      where: { id: planId },
      include: { days: { include: { exercises: true }, orderBy: planDayOrder } },
    })
  }

  async updatePlan(
    ownerId: string,
    planId: string,
    input: {
      readonly name?: string
      readonly description?: string
      readonly weeksCount?: number
    },
  ) {
    return this.prisma.plan.updateMany({ where: { id: planId, ownerId }, data: input })
  }

  async countAvailableExercises(ownerId: string, exerciseIds: readonly string[]) {
    if (exerciseIds.length === 0) {
      return 0
    }

    return this.prisma.exercise.count({
      where: { id: { in: [...exerciseIds] }, OR: [{ ownerId }, { isGlobal: true }] },
    })
  }

  async deletePlan(ownerId: string, planId: string) {
    return this.prisma.$transaction(async (tx) => {
      const plan = await tx.plan.findFirst({
        where: { id: planId, ownerId },
        include: {
          assignments: true,
          days: { include: { exercises: true }, orderBy: planDayOrder },
        },
      })

      if (!plan) {
        return { count: 0 }
      }

      for (const assignment of plan.assignments.filter(
        (item) => item.isActive && item.traineeId !== ownerId,
      )) {
        const assignedPlan = await tx.plan.create({
          data: {
            ownerId: assignment.traineeId,
            name: plan.name,
            description: plan.description,
            weeksCount: plan.weeksCount,
            days: {
              create: plan.days.map((day) => ({
                name: day.name,
                weekNumber: day.weekNumber,
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
        })

        await tx.planAssignment.update({
          where: { id: assignment.id },
          data: { planId: assignedPlan.id },
        })
      }

      await tx.plan.delete({ where: { id: plan.id } })
      return { count: 1 }
    })
  }

  async copyPlan(ownerId: string, planId: string) {
    const plan = await this.prisma.plan.findFirst({
      where: { id: planId, ownerId },
      include: { days: { include: { exercises: true }, orderBy: planDayOrder } },
    })
    if (!plan) {
      return null
    }

    const copiedInput = {
      name: `${plan.name} copy`,
      weeksCount: plan.weeksCount,
      days: plan.days.map((day) => ({
        name: day.name,
        weekNumber: day.weekNumber,
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
      readonly weekNumber?: number
      readonly orderIndex: number
      readonly exercises: readonly {
        readonly exerciseId: string
        readonly series: number
        readonly repsTarget: number
        readonly orderIndex: number
      }[]
    },
  ) {
    const weekNumber = input.weekNumber ?? 1
    return this.prisma.$transaction(async (tx) => {
      const lastDay = await tx.planDay.findFirst({
        where: { planId, weekNumber },
        orderBy: { orderIndex: "desc" },
      })

      return tx.planDay.create({
        data: {
          planId,
          name: input.name,
          weekNumber,
          orderIndex: (lastDay?.orderIndex ?? -1) + 1,
          exercises: { create: input.exercises.map((exercise) => ({ ...exercise })) },
        },
        include: { plan: true, exercises: true },
      })
    })
  }

  async findPlanDay(ownerId: string, planDayId: string) {
    return this.prisma.planDay.findFirst({
      where: { id: planDayId, plan: { ownerId } },
      include: { exercises: true, plan: true },
    })
  }

  async listPlanDays(ownerId: string, planId: string) {
    return this.prisma.planDay.findMany({
      where: { planId, plan: { ownerId } },
      include: { exercises: true },
      orderBy: planDayOrder,
    })
  }

  async deletePlanDay(ownerId: string, planDayId: string) {
    return this.prisma.planDay.deleteMany({ where: { id: planDayId, plan: { ownerId } } })
  }

  async updatePlanDay(
    ownerId: string,
    planDayId: string,
    input: {
      readonly name: string
      readonly weekNumber?: number
      readonly orderIndex: number
      readonly exercises: readonly {
        readonly exerciseId: string
        readonly series: number
        readonly repsTarget: number
        readonly orderIndex: number
      }[]
    },
  ) {
    const day = await this.findPlanDay(ownerId, planDayId)
    if (!day) {
      return null
    }

    await this.prisma.$transaction(async (tx) => {
      const weekNumber = input.weekNumber ?? day.weekNumber
      const movedToAnotherWeek = weekNumber !== day.weekNumber
      const lastDayInTargetWeek = movedToAnotherWeek
        ? await tx.planDay.findFirst({
            where: { planId: day.planId, weekNumber, id: { not: planDayId } },
            orderBy: { orderIndex: "desc" },
          })
        : null

      await tx.planExercise.deleteMany({ where: { planDayId } })
      await tx.planDay.update({
        where: { id: planDayId },
        data: {
          name: input.name,
          weekNumber,
          orderIndex: movedToAnotherWeek
            ? (lastDayInTargetWeek?.orderIndex ?? -1) + 1
            : input.orderIndex,
          exercises: { create: input.exercises.map((exercise) => ({ ...exercise })) },
        },
      })
    })

    return this.findPlanDay(ownerId, planDayId)
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
          include: { days: { include: { exercises: true }, orderBy: planDayOrder } },
        },
      },
    })
  }

  async deactivateSelfPlan(traineeId: string, planId: string) {
    return this.prisma.planAssignment.updateMany({
      where: { traineeId, planId, isActive: true },
      data: { isActive: false },
    })
  }
}
