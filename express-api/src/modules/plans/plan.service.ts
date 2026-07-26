import type { AccessService } from "../../core/access/access-service"
import { ForbiddenError, NotFoundError, ValidationAppError } from "../../core/errors/app-error"
import type { PlanRepository } from "./plan.repository"

type PlanShape = {
  readonly id: string
  readonly ownerId: string
  readonly name: string
  readonly description: string | null
  readonly weeksCount: number
  readonly days: readonly {
    readonly id: string
    readonly name: string
    readonly weekNumber: number
    readonly orderIndex: number
    readonly exercises: readonly {
      readonly id: string
      readonly exerciseId: string
      readonly series: number
      readonly repsTarget: number
      readonly orderIndex: number
    }[]
  }[]
}

const mapPlan = (plan: PlanShape | null) => {
  if (!plan) {
    return null
  }

  return {
    _id: plan.id,
    id: plan.id,
    name: plan.name,
    description: plan.description,
    weeksCount: plan.weeksCount,
    days: plan.days.map((day) => ({
      _id: day.id,
      id: day.id,
      name: day.name,
      weekNumber: day.weekNumber,
      orderIndex: day.orderIndex,
      exercises: day.exercises.map((exercise) => ({
        _id: exercise.id,
        id: exercise.id,
        exerciseId: exercise.exerciseId,
        series: exercise.series,
        repsTarget: exercise.repsTarget,
        orderIndex: exercise.orderIndex,
      })),
    })),
  }
}

export class PlanService {
  constructor(
    private readonly repository: PlanRepository,
    private readonly accessService: AccessService,
  ) {}

  async create(userId: string, input: Parameters<PlanRepository["create"]>[1]) {
    await this.assertOwnedExercises(userId, input.days ?? [])
    return mapPlan(await this.repository.create(userId, input))
  }

  async list(userId: string) {
    return (await this.repository.list(userId)).map((plan) => mapPlan(plan))
  }

  async get(userId: string, planId: string) {
    const plan = await this.repository.findById(planId)
    if (!plan || plan.ownerId !== userId) {
      throw new NotFoundError("PLAN_NOT_FOUND")
    }
    return mapPlan(plan)
  }

  async update(
    userId: string,
    planId: string,
    input: { readonly name?: string; readonly description?: string; readonly weeksCount?: number },
  ) {
    if (input.weeksCount !== undefined) {
      const weeksCount = input.weeksCount
      const plan = await this.repository.findById(planId)
      if (!plan || plan.ownerId !== userId) {
        throw new NotFoundError("PLAN_NOT_FOUND")
      }
      if (plan.days.some((day) => day.weekNumber > weeksCount)) {
        throw new ValidationAppError("PLAN_WEEK_OUT_OF_RANGE")
      }
    }
    const result = await this.repository.updatePlan(userId, planId, input)
    if (result.count === 0) {
      throw new NotFoundError("PLAN_NOT_FOUND")
    }
    return this.get(userId, planId)
  }

  async delete(userId: string, planId: string) {
    const result = await this.repository.deletePlan(userId, planId)
    if (result.count === 0) {
      throw new NotFoundError("PLAN_NOT_FOUND")
    }
    return { msg: "DELETED" }
  }

  async copy(userId: string, planId: string) {
    const copied = await this.repository.copyPlan(userId, planId)
    if (!copied) {
      throw new NotFoundError("PLAN_NOT_FOUND")
    }
    return mapPlan(copied)
  }

  async assignPlan(trainerId: string, planId: string, traineeId: string) {
    await this.accessService.assertSelfOrActiveTrainerRelationship(trainerId, traineeId)
    const plan = await this.repository.findById(planId)

    if (!plan) {
      throw new NotFoundError("PLAN_NOT_FOUND")
    }

    if (plan.ownerId !== trainerId) {
      throw new ForbiddenError("PLAN_ACCESS_DENIED")
    }

    await this.repository.assignPlan(planId, trainerId, traineeId)
    return { msg: "PLAN_ASSIGNED", plan: mapPlan(plan) }
  }

  async getActivePlan(traineeId: string) {
    const assignment = await this.repository.getActiveAssignment(traineeId)
    if (!assignment) {
      return null
    }
    const plan = mapPlan(assignment.plan)
    return plan ? { ...plan, assignedByTrainer: assignment.trainerId !== traineeId } : null
  }

  async getTrainerTraineeActivePlan(trainerId: string, traineeId: string) {
    await this.accessService.assertSelfOrActiveTrainerRelationship(trainerId, traineeId)
    return this.getActivePlan(traineeId)
  }

  async setSelfActivePlan(userId: string, planId: string) {
    const plan = await this.repository.findById(planId)
    if (!plan || plan.ownerId !== userId) {
      throw new NotFoundError("PLAN_NOT_FOUND")
    }
    await this.repository.assignPlan(planId, userId, userId)
    return { msg: "PLAN_ACTIVATED", plan: mapPlan(plan) }
  }

  async deactivateSelfPlan(userId: string, planId: string) {
    const result = await this.repository.deactivateSelfPlan(userId, planId)
    if (result.count === 0) {
      throw new NotFoundError("PLAN_NOT_FOUND")
    }
    return { msg: "PLAN_DEACTIVATED" }
  }

  async createPlanDay(
    userId: string,
    planId: string,
    input: Parameters<PlanRepository["createPlanDay"]>[1],
  ) {
    await this.get(userId, planId)
    await this.assertDayWithinPlanWeeks(planId, input.weekNumber ?? 1)
    await this.assertOwnedExercises(userId, [input])
    const day = await this.repository.createPlanDay(planId, input)
    return mapPlanDay(day)
  }

  async listPlanDays(userId: string, planId: string) {
    await this.get(userId, planId)
    return (await this.repository.listPlanDays(userId, planId)).map((day) => mapPlanDay(day))
  }

  async getPlanDay(userId: string, planDayId: string) {
    const day = await this.repository.findPlanDay(userId, planDayId)
    if (!day) {
      throw new NotFoundError("PLAN_DAY_NOT_FOUND")
    }
    return mapPlanDay(day)
  }

  async deletePlanDay(userId: string, planDayId: string) {
    const result = await this.repository.deletePlanDay(userId, planDayId)
    if (result.count === 0) {
      throw new NotFoundError("PLAN_DAY_NOT_FOUND")
    }
    return { msg: "DELETED" }
  }

  async updatePlanDay(
    userId: string,
    planDayId: string,
    input: Parameters<PlanRepository["updatePlanDay"]>[2],
  ) {
    await this.assertOwnedExercises(userId, [input])
    const currentDay = await this.repository.findPlanDay(userId, planDayId)
    if (!currentDay) {
      throw new NotFoundError("PLAN_DAY_NOT_FOUND")
    }
    await this.assertDayWithinPlanWeeks(currentDay.planId, input.weekNumber ?? 1)
    const day = await this.repository.updatePlanDay(userId, planDayId, input)
    if (!day) {
      throw new NotFoundError("PLAN_DAY_NOT_FOUND")
    }
    return mapPlanDay(day)
  }

  private async assertOwnedExercises(
    userId: string,
    days: readonly { readonly exercises: readonly { readonly exerciseId: string }[] }[],
  ) {
    const exerciseIds = Array.from(
      new Set(days.flatMap((day) => day.exercises.map((exercise) => exercise.exerciseId))),
    )
    const availableCount = await this.repository.countAvailableExercises(userId, exerciseIds)
    if (availableCount !== exerciseIds.length) {
      throw new ValidationAppError("EXERCISE_NOT_FOUND")
    }
  }

  private async assertDayWithinPlanWeeks(planId: string, weekNumber: number) {
    const plan = await this.repository.findById(planId)
    if (!plan) {
      throw new NotFoundError("PLAN_NOT_FOUND")
    }
    if (weekNumber < 1 || weekNumber > plan.weeksCount) {
      throw new ValidationAppError("PLAN_WEEK_OUT_OF_RANGE")
    }
  }
}

const mapPlanDay = (day: {
  readonly id: string
  readonly name: string
  readonly weekNumber: number
  readonly orderIndex: number
  readonly planId?: string
  readonly exercises: readonly {
    readonly id: string
    readonly exerciseId: string
    readonly series: number
    readonly repsTarget: number
    readonly orderIndex: number
  }[]
}) => ({
  _id: day.id,
  id: day.id,
  name: day.name,
  weekNumber: day.weekNumber,
  orderIndex: day.orderIndex,
  exercises: day.exercises.map((exercise) => ({
    _id: exercise.id,
    id: exercise.id,
    exerciseId: exercise.exerciseId,
    series: exercise.series,
    repsTarget: exercise.repsTarget,
    orderIndex: exercise.orderIndex,
  })),
})
