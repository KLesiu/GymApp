import type { Prisma, PrismaClient, RecurrenceUnit } from "@prisma/client"

type ReportTemplateFieldInput = {
  readonly key: string
  readonly label: string
  readonly type: string
  readonly isRequired: boolean
  readonly order: number
  readonly moduleConfig?: Record<string, unknown>
}

type ReportTemplateInput = {
  readonly name: string
  readonly description?: string
  readonly fields: readonly ReportTemplateFieldInput[]
}

type ReportTemplateUpdateInput = Partial<ReportTemplateInput>

const toJsonObject = (value: Record<string, unknown>): Prisma.InputJsonObject => {
  return JSON.parse(JSON.stringify(value))
}

const toTemplateSnapshot = (fields: readonly ReportTemplateFieldInput[]) =>
  toJsonObject({
    fields: fields.map((field) => ({
      key: field.key,
      label: field.label,
      type: field.type,
      isRequired: field.isRequired,
      order: field.order,
      moduleConfig: field.moduleConfig ?? null,
    })),
  })

export class ReportRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async createTemplate(trainerId: string, input: ReportTemplateInput) {
    return this.prisma.reportTemplate.create({
      data: {
        trainerId,
        name: input.name,
        description: input.description ?? null,
        versions: {
          create: {
            version: 1,
            snapshotJson: toTemplateSnapshot(input.fields),
          },
        },
      },
      include: { versions: { orderBy: { version: "desc" }, take: 1 } },
    })
  }

  async findTemplate(templateId: string) {
    return this.prisma.reportTemplate.findUnique({
      where: { id: templateId },
      include: { versions: { orderBy: { version: "desc" }, take: 1 } },
    })
  }

  async findTemplateForTrainer(templateId: string, trainerId: string) {
    return this.prisma.reportTemplate.findFirst({
      where: { id: templateId, trainerId },
      include: { versions: { orderBy: { version: "desc" }, take: 1 } },
    })
  }

  async listTemplates(trainerId: string) {
    return this.prisma.reportTemplate.findMany({
      where: { trainerId },
      include: { versions: { orderBy: { version: "desc" }, take: 1 } },
      orderBy: { createdAt: "desc" },
    })
  }

  async updateTemplate(trainerId: string, templateId: string, input: ReportTemplateUpdateInput) {
    return this.prisma.$transaction(async (transaction) => {
      const template = await transaction.reportTemplate.findFirst({
        where: { id: templateId, trainerId },
        include: { versions: { orderBy: { version: "desc" }, take: 1 } },
      })

      if (!template) {
        return null
      }

      const latestVersion = template.versions[0]

      return transaction.reportTemplate.update({
        where: { id: templateId, trainerId },
        data: {
          ...(input.name !== undefined ? { name: input.name } : {}),
          ...(input.description !== undefined ? { description: input.description } : {}),
          ...(input.fields !== undefined
            ? {
                versions: {
                  create: {
                    version: (latestVersion?.version ?? 0) + 1,
                    snapshotJson: toTemplateSnapshot(input.fields),
                  },
                },
              }
            : {}),
        },
        include: { versions: { orderBy: { version: "desc" }, take: 1 } },
      })
    })
  }

  async pauseRecurringRule(trainerId: string, recurringRuleId: string) {
    const pausedAt = new Date()
    return this.prisma.recurringReportRule.updateMany({
      where: { id: recurringRuleId, trainerId },
      data: {
        pausedAt,
      },
    })
  }

  async resumeRecurringRule(trainerId: string, recurringRuleId: string) {
    const resumedAt = new Date()
    return this.prisma.recurringReportRule.updateMany({
      where: { id: recurringRuleId, trainerId },
      data: {
        pausedAt: null,
        nextRunAt: resumedAt,
      },
    })
  }

  async deleteTemplate(trainerId: string, templateId: string) {
    return this.prisma.reportTemplate.deleteMany({ where: { id: templateId, trainerId } })
  }

  async createAssignment(
    trainerId: string,
    traineeId: string,
    templateId: string,
    templateVersionId: string,
    dueAt?: string,
    note?: string,
  ) {
    return this.prisma.reportAssignment.create({
      data: {
        trainerId,
        traineeId,
        templateId,
        templateVersionId,
        dueAt: dueAt ? new Date(dueAt) : null,
        note: note ?? null,
      },
    })
  }

  async createRecurringRule(
    trainerId: string,
    input: {
      readonly traineeId: string
      readonly templateId: string
      readonly intervalUnit: RecurrenceUnit
      readonly intervalValue: number
      readonly startsAt: string
      readonly endsAt?: string
    },
  ) {
    return this.prisma.recurringReportRule.create({
      data: {
        trainerId,
        traineeId: input.traineeId,
        templateId: input.templateId,
        intervalUnit: input.intervalUnit,
        intervalValue: input.intervalValue,
        startsAt: new Date(input.startsAt),
        endsAt: input.endsAt ? new Date(input.endsAt) : null,
        nextRunAt: new Date(input.startsAt),
      },
    })
  }

  async listRecurringRules(trainerId: string, traineeId?: string) {
    return this.prisma.recurringReportRule.findMany({
      where: { trainerId, ...(traineeId ? { traineeId } : {}) },
      orderBy: { createdAt: "desc" },
    })
  }

  async updateRecurringRule(
    trainerId: string,
    recurringRuleId: string,
    input: Partial<Parameters<ReportRepository["createRecurringRule"]>[1]>,
  ) {
    return this.prisma.recurringReportRule.updateMany({
      where: { id: recurringRuleId, trainerId },
      data: {
        ...(input.intervalUnit ? { intervalUnit: input.intervalUnit } : {}),
        ...(input.intervalValue ? { intervalValue: input.intervalValue } : {}),
        ...(input.startsAt
          ? { startsAt: new Date(input.startsAt), nextRunAt: new Date(input.startsAt) }
          : {}),
        ...(input.endsAt ? { endsAt: new Date(input.endsAt) } : {}),
      },
    })
  }

  async deleteRecurringRule(trainerId: string, recurringRuleId: string) {
    return this.prisma.recurringReportRule.deleteMany({ where: { id: recurringRuleId, trainerId } })
  }

  async listAssignmentsForTrainee(traineeId: string) {
    return this.prisma.reportAssignment.findMany({
      where: { traineeId },
      include: { template: true, submission: true },
      orderBy: { createdAt: "desc" },
    })
  }

  async listSubmissionsForTrainer(trainerId: string, traineeId?: string) {
    return this.prisma.reportSubmission.findMany({
      where: { assignment: { trainerId, ...(traineeId ? { traineeId } : {}) } },
      include: {
        assignment: { include: { template: true, templateVersion: true, trainee: true } },
      },
      orderBy: { submittedAt: "desc" },
    })
  }

  async findSubmissionForTrainer(submissionId: string, trainerId: string) {
    return this.prisma.reportSubmission.findFirst({
      where: { id: submissionId, assignment: { trainerId } },
    })
  }

  async findAssignment(assignmentId: string) {
    return this.prisma.reportAssignment.findUnique({
      where: { id: assignmentId },
      include: { templateVersion: true },
    })
  }

  async createSubmission(
    assignmentId: string,
    traineeId: string,
    answers: Record<string, unknown>,
  ) {
    return this.prisma.$transaction(async (transaction) => {
      const submission = await transaction.reportSubmission.create({
        data: { assignmentId, traineeId, payloadJson: toJsonObject(answers) },
      })

      await transaction.reportAssignment.update({
        where: { id: assignmentId },
        data: { status: "SUBMITTED", submittedAt: submission.submittedAt },
      })

      return submission
    })
  }

  async updateFeedback(
    submissionId: string,
    trainerOverallComment: string | undefined,
    fieldComments: Record<string, string>,
  ) {
    return this.prisma.reportSubmission.update({
      where: { id: submissionId },
      data: {
        trainerOverallComment: trainerOverallComment ?? null,
        trainerFieldCommentsJson: toJsonObject(fieldComments),
        assignment: {
          update: { status: "REVIEWED" },
        },
      },
    })
  }
}
