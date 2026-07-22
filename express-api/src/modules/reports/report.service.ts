import { z } from "zod"

import type { AccessService } from "../../core/access/access-service"
import {
  AppError,
  ForbiddenError,
  NotFoundError,
  ValidationAppError,
} from "../../core/errors/app-error"
import type { ReportRepository } from "./report.repository"

const templateSnapshotSchema = z.object({
  fields: z.array(
    z.object({
      key: z.string(),
      label: z.string(),
      type: z.string(),
      isRequired: z.boolean(),
      order: z.number(),
      moduleConfig: z.record(z.unknown()).nullable(),
    }),
  ),
})

type TemplateSnapshot = z.infer<typeof templateSnapshotSchema>
type TemplateSnapshotField = TemplateSnapshot["fields"][number]

export class ReportService {
  constructor(
    private readonly repository: ReportRepository,
    private readonly accessService: AccessService,
  ) {}

  async createTemplate(
    trainerId: string,
    input: Parameters<ReportRepository["createTemplate"]>[1],
  ) {
    return this.repository.createTemplate(trainerId, input)
  }

  async listTemplates(trainerId: string) {
    return this.repository.listTemplates(trainerId)
  }

  async getTemplate(trainerId: string, templateId: string) {
    const template = await this.repository.findTemplateForTrainer(templateId, trainerId)
    if (!template) {
      throw new NotFoundError("REPORT_TEMPLATE_NOT_FOUND")
    }
    return template
  }

  async updateTemplate(
    trainerId: string,
    templateId: string,
    input: Parameters<ReportRepository["updateTemplate"]>[2],
  ) {
    const template = await this.repository.updateTemplate(trainerId, templateId, input)
    if (!template) {
      throw new NotFoundError("REPORT_TEMPLATE_NOT_FOUND")
    }
    return template
  }

  async deleteTemplate(trainerId: string, templateId: string) {
    const result = await this.repository.deleteTemplate(trainerId, templateId)
    if (result.count === 0) {
      throw new NotFoundError("REPORT_TEMPLATE_NOT_FOUND")
    }
    return { msg: "DELETED" }
  }

  async assign(
    trainerId: string,
    traineeId: string,
    templateId: string,
    dueAt?: string,
    note?: string,
  ) {
    await this.accessService.assertSelfOrActiveTrainerRelationship(trainerId, traineeId)
    const template = await this.repository.findTemplateForTrainer(templateId, trainerId)

    if (!template) {
      throw new NotFoundError("REPORT_TEMPLATE_NOT_FOUND")
    }

    const version = template.versions[0]

    if (!version) {
      throw new AppError("REPORT_TEMPLATE_VERSION_MISSING", 500)
    }

    return this.repository.createAssignment(
      trainerId,
      traineeId,
      templateId,
      version.id,
      dueAt,
      note,
    )
  }

  async createRecurringRule(
    trainerId: string,
    input: Parameters<ReportRepository["createRecurringRule"]>[1],
  ) {
    await this.accessService.assertSelfOrActiveTrainerRelationship(trainerId, input.traineeId)
    const template = await this.repository.findTemplateForTrainer(input.templateId, trainerId)

    if (!template) {
      throw new NotFoundError("REPORT_TEMPLATE_NOT_FOUND")
    }

    return this.repository.createRecurringRule(trainerId, input)
  }

  async listRecurringRules(trainerId: string, traineeId?: string) {
    if (traineeId) {
      await this.accessService.assertSelfOrActiveTrainerRelationship(trainerId, traineeId)
    }
    return this.repository.listRecurringRules(trainerId, traineeId)
  }

  async updateRecurringRule(
    trainerId: string,
    recurringRuleId: string,
    input: Partial<Parameters<ReportRepository["createRecurringRule"]>[1]>,
  ) {
    const result = await this.repository.updateRecurringRule(trainerId, recurringRuleId, input)
    if (result.count === 0) {
      throw new NotFoundError("RECURRING_REPORT_RULE_NOT_FOUND")
    }
    return { msg: "UPDATED" }
  }

  async deleteRecurringRule(trainerId: string, recurringRuleId: string) {
    const result = await this.repository.deleteRecurringRule(trainerId, recurringRuleId)
    if (result.count === 0) {
      throw new NotFoundError("RECURRING_REPORT_RULE_NOT_FOUND")
    }
    return { msg: "DELETED" }
  }

  async pauseRecurringRule(trainerId: string, recurringRuleId: string) {
    const result = await this.repository.pauseRecurringRule(trainerId, recurringRuleId)
    if (result.count === 0) {
      throw new NotFoundError("RECURRING_REPORT_RULE_NOT_FOUND")
    }
    return { msg: "PAUSED" }
  }

  async resumeRecurringRule(trainerId: string, recurringRuleId: string) {
    const result = await this.repository.resumeRecurringRule(trainerId, recurringRuleId)
    if (result.count === 0) {
      throw new NotFoundError("RECURRING_REPORT_RULE_NOT_FOUND")
    }
    return { msg: "RESUMED" }
  }

  async listAssignmentsForTrainee(traineeId: string) {
    return this.repository.listAssignmentsForTrainee(traineeId)
  }

  async listSubmissionsForTrainer(trainerId: string, traineeId?: string) {
    if (traineeId) {
      await this.accessService.assertSelfOrActiveTrainerRelationship(trainerId, traineeId)
    }
    return this.repository.listSubmissionsForTrainer(trainerId, traineeId)
  }

  async submit(traineeId: string, assignmentId: string, answers: Record<string, unknown>) {
    const assignment = await this.repository.findAssignment(assignmentId)

    if (!assignment) {
      throw new NotFoundError("REPORT_ASSIGNMENT_NOT_FOUND")
    }

    if (assignment.traineeId !== traineeId) {
      throw new ForbiddenError("REPORT_ASSIGNMENT_ACCESS_DENIED")
    }

    this.validateAnswers(assignment.templateVersion.snapshotJson, answers)

    return this.repository.createSubmission(assignmentId, traineeId, answers)
  }

  async addFeedback(
    trainerId: string,
    submissionId: string,
    trainerOverallComment: string | undefined,
    fieldComments: Record<string, string>,
  ) {
    const existing = await this.repository.findSubmissionForTrainer(submissionId, trainerId)

    if (!existing) {
      throw new NotFoundError("REPORT_SUBMISSION_NOT_FOUND")
    }

    const submission = await this.repository.updateFeedback(
      submissionId,
      trainerOverallComment,
      fieldComments,
    )

    if (!submission) {
      throw new NotFoundError("REPORT_SUBMISSION_NOT_FOUND")
    }

    return { trainerId, submissionId, msg: "FEEDBACK_SAVED" }
  }

  private validateAnswers(snapshot: unknown, answers: Record<string, unknown>) {
    const parsedSnapshot = templateSnapshotSchema.safeParse(snapshot)
    if (!parsedSnapshot.success) {
      throw new AppError("REPORT_TEMPLATE_VERSION_INVALID", 500)
    }

    const typedSnapshot = parsedSnapshot.data
    const expected = new Map(typedSnapshot.fields.map((field) => [field.key.toLowerCase(), field]))

    for (const field of typedSnapshot.fields) {
      if (field.isRequired && !(field.key in answers)) {
        throw new ValidationAppError("REPORT_FIELD_VALIDATION_FAILED")
      }
    }

    for (const [key, value] of Object.entries(answers)) {
      const field = expected.get(key.toLowerCase())

      if (!field) {
        throw new ValidationAppError("REPORT_FIELD_VALIDATION_FAILED")
      }

      if (!this.isValidValue(field, value)) {
        throw new ValidationAppError("REPORT_FIELD_VALIDATION_FAILED")
      }
    }
  }

  private isValidValue(field: TemplateSnapshotField, value: unknown) {
    switch (field.type) {
      case "TEXT":
        return typeof value === "string"
      case "NUMBER":
        return typeof value === "number" && Number.isFinite(value)
      case "SCALE": {
        if (typeof value !== "number" || !Number.isFinite(value)) {
          return false
        }

        const minValue = field.moduleConfig?.min
        const maxValue = field.moduleConfig?.max
        const min = typeof minValue === "number" ? minValue : 1
        const max = typeof maxValue === "number" ? maxValue : 5
        return value >= min && value <= max
      }
      default:
        return false
    }
  }
}
