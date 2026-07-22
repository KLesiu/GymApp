import type { PrismaClient } from "@prisma/client"
import type { Request } from "express"
import { Router } from "express"

import { AccessService } from "../../core/access/access-service"
import { requireAuth, requireRole } from "../../core/auth/middleware"
import { UnauthorizedError } from "../../core/errors/app-error"
import { validate } from "../../core/http/validate"
import { ReportRepository } from "./report.repository"
import {
  recurringRuleParamsSchema,
  recurringRuleSchema,
  recurringRuleUpdateSchema,
  reportAssignmentParamsSchema,
  reportAssignmentSchema,
  reportFeedbackSchema,
  reportSubmissionParamsSchema,
  reportSubmitSchema,
  reportTemplateParamsSchema,
  reportTemplateSchema,
  reportTemplateUpdateSchema,
  traineeReportQuerySchema,
} from "./report.schemas"
import { ReportService } from "./report.service"

const getActorId = (request: Request) => {
  const actor = request.authActor
  if (!actor) {
    throw new UnauthorizedError()
  }
  return actor.user.id
}

export const buildReportRouter = (prisma: PrismaClient) => {
  const router = Router()
  const service = new ReportService(new ReportRepository(prisma), new AccessService(prisma))

  router.post(
    "/trainer/report-templates",
    requireAuth,
    requireRole("TRAINER"),
    validate({ body: reportTemplateSchema }),
    async (request, response) => {
      response.status(201).json(await service.createTemplate(getActorId(request), request.body))
    },
  )

  router.get(
    "/trainer/report-templates",
    requireAuth,
    requireRole("TRAINER"),
    async (request, response) => {
      response.json(await service.listTemplates(getActorId(request)))
    },
  )

  router.get(
    "/trainer/report-templates/:templateId",
    requireAuth,
    requireRole("TRAINER"),
    validate({ params: reportTemplateParamsSchema }),
    async (request, response) => {
      const params = reportTemplateParamsSchema.parse(request.params)
      response.json(await service.getTemplate(getActorId(request), params.templateId))
    },
  )

  router.patch(
    "/trainer/report-templates/:templateId",
    requireAuth,
    requireRole("TRAINER"),
    validate({ params: reportTemplateParamsSchema, body: reportTemplateUpdateSchema }),
    async (request, response) => {
      const params = reportTemplateParamsSchema.parse(request.params)
      response.json(
        await service.updateTemplate(getActorId(request), params.templateId, request.body),
      )
    },
  )

  router.delete(
    "/trainer/report-templates/:templateId",
    requireAuth,
    requireRole("TRAINER"),
    validate({ params: reportTemplateParamsSchema }),
    async (request, response) => {
      const params = reportTemplateParamsSchema.parse(request.params)
      response.json(await service.deleteTemplate(getActorId(request), params.templateId))
    },
  )

  router.post(
    "/trainer/report-assignments",
    requireAuth,
    requireRole("TRAINER"),
    validate({ body: reportAssignmentSchema }),
    async (request, response) => {
      response
        .status(201)
        .json(
          await service.assign(
            getActorId(request),
            request.body.traineeId,
            request.body.templateId,
            request.body.dueAt,
            request.body.note,
          ),
        )
    },
  )

  router.post(
    "/trainer/recurring-report-rules",
    requireAuth,
    requireRole("TRAINER"),
    validate({ body: recurringRuleSchema }),
    async (request, response) => {
      response
        .status(201)
        .json(await service.createRecurringRule(getActorId(request), request.body))
    },
  )

  router.get(
    "/trainer/recurring-report-rules",
    requireAuth,
    requireRole("TRAINER"),
    validate({ query: traineeReportQuerySchema }),
    async (request, response) => {
      const query = traineeReportQuerySchema.parse(request.query)
      response.json(await service.listRecurringRules(getActorId(request), query.traineeId))
    },
  )

  router.patch(
    "/trainer/recurring-report-rules/:recurringRuleId",
    requireAuth,
    requireRole("TRAINER"),
    validate({ params: recurringRuleParamsSchema, body: recurringRuleUpdateSchema }),
    async (request, response) => {
      const params = recurringRuleParamsSchema.parse(request.params)
      response.json(
        await service.updateRecurringRule(
          getActorId(request),
          params.recurringRuleId,
          request.body,
        ),
      )
    },
  )

  router.post(
    "/trainer/recurring-report-rules/:recurringRuleId/pause",
    requireAuth,
    requireRole("TRAINER"),
    validate({ params: recurringRuleParamsSchema }),
    async (request, response) => {
      const params = recurringRuleParamsSchema.parse(request.params)
      response.json(await service.pauseRecurringRule(getActorId(request), params.recurringRuleId))
    },
  )

  router.post(
    "/trainer/recurring-report-rules/:recurringRuleId/resume",
    requireAuth,
    requireRole("TRAINER"),
    validate({ params: recurringRuleParamsSchema }),
    async (request, response) => {
      const params = recurringRuleParamsSchema.parse(request.params)
      response.json(await service.resumeRecurringRule(getActorId(request), params.recurringRuleId))
    },
  )

  router.delete(
    "/trainer/recurring-report-rules/:recurringRuleId",
    requireAuth,
    requireRole("TRAINER"),
    validate({ params: recurringRuleParamsSchema }),
    async (request, response) => {
      const params = recurringRuleParamsSchema.parse(request.params)
      response.json(await service.deleteRecurringRule(getActorId(request), params.recurringRuleId))
    },
  )

  router.get(
    "/trainee/report-assignments",
    requireAuth,
    requireRole("TRAINEE"),
    async (request, response) => {
      response.json(await service.listAssignmentsForTrainee(getActorId(request)))
    },
  )

  router.get(
    "/trainer/report-submissions",
    requireAuth,
    requireRole("TRAINER"),
    validate({ query: traineeReportQuerySchema }),
    async (request, response) => {
      const query = traineeReportQuerySchema.parse(request.query)
      response.json(await service.listSubmissionsForTrainer(getActorId(request), query.traineeId))
    },
  )

  router.post(
    "/trainee/report-assignments/:assignmentId/submissions",
    requireAuth,
    requireRole("TRAINEE"),
    validate({ params: reportAssignmentParamsSchema, body: reportSubmitSchema }),
    async (request, response) => {
      const params = reportAssignmentParamsSchema.parse(request.params)
      response
        .status(201)
        .json(await service.submit(getActorId(request), params.assignmentId, request.body.answers))
    },
  )

  router.patch(
    "/trainer/report-submissions/:submissionId/feedback",
    requireAuth,
    requireRole("TRAINER"),
    validate({ params: reportSubmissionParamsSchema, body: reportFeedbackSchema }),
    async (request, response) => {
      const params = reportSubmissionParamsSchema.parse(request.params)
      response.json(
        await service.addFeedback(
          getActorId(request),
          params.submissionId,
          request.body.trainerOverallComment,
          request.body.fieldComments,
        ),
      )
    },
  )

  return router
}
