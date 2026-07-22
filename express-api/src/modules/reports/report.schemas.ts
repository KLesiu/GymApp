import { z } from "zod"

import { recurrenceUnits, reportFieldTypes } from "../../shared/constants"

export const reportFieldSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  type: z.enum(reportFieldTypes),
  isRequired: z.boolean(),
  order: z.number().int().nonnegative(),
  moduleConfig: z.record(z.unknown()).optional(),
})

export const reportTemplateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  fields: z.array(reportFieldSchema).min(1),
})

export const reportAssignmentSchema = z.object({
  traineeId: z.string().uuid(),
  templateId: z.string().uuid(),
  dueAt: z.string().datetime().optional(),
  note: z.string().optional(),
})

export const recurringRuleSchema = z.object({
  traineeId: z.string().uuid(),
  templateId: z.string().uuid(),
  intervalUnit: z.enum(recurrenceUnits),
  intervalValue: z.number().int().positive(),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime().optional(),
})

export const reportAssignmentParamsSchema = z.object({
  assignmentId: z.string().uuid(),
})

export const reportSubmissionParamsSchema = z.object({
  submissionId: z.string().uuid(),
})

export const reportSubmitSchema = z.object({
  answers: z.record(z.unknown()),
})

export const reportFeedbackSchema = z.object({
  trainerOverallComment: z.string().optional(),
  fieldComments: z.record(z.string().min(1)).default({}),
})

export const reportTemplateParamsSchema = z.object({ templateId: z.string().uuid() })

export const recurringRuleParamsSchema = z.object({ recurringRuleId: z.string().uuid() })

export const reportTemplateUpdateSchema = reportTemplateSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, { message: "At least one field is required" })

export const recurringRuleUpdateSchema = recurringRuleSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, { message: "At least one field is required" })

export const traineeReportQuerySchema = z.object({ traineeId: z.string().uuid().optional() })
