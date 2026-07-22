export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "LGYM Express API",
    version: "0.1.0",
    description: "Scoped LGYM Express + TypeScript + Prisma port",
  },
  servers: [{ url: "http://localhost:3000" }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  paths: {
    "/health": {
      get: {
        summary: "Health check",
        responses: { "200": { description: "OK" } },
      },
    },
    "/api/v1/auth/register": {
      post: { summary: "Register user", responses: { "201": { description: "Created" } } },
    },
    "/api/v1/auth/login": {
      post: { summary: "Login", responses: { "200": { description: "Authenticated" } } },
    },
    "/api/v1/auth/me": {
      get: { summary: "Get authenticated user", security: [{ bearerAuth: [] }] },
    },
    "/api/v1/gyms": {
      get: { summary: "List gyms", security: [{ bearerAuth: [] }] },
      post: { summary: "Create gym", security: [{ bearerAuth: [] }] },
    },
    "/api/v1/gyms/{gymId}": {
      get: { summary: "Get gym", security: [{ bearerAuth: [] }] },
      patch: { summary: "Update gym", security: [{ bearerAuth: [] }] },
      delete: { summary: "Soft-delete gym", security: [{ bearerAuth: [] }] },
    },
    "/api/v1/muscle-groups": {
      get: { summary: "List muscle groups", security: [{ bearerAuth: [] }] },
      post: { summary: "Create muscle group", security: [{ bearerAuth: [] }] },
    },
    "/api/v1/exercises": {
      get: { summary: "List exercises", security: [{ bearerAuth: [] }] },
      post: { summary: "Create exercise", security: [{ bearerAuth: [] }] },
    },
    "/api/v1/exercises/{exerciseId}": {
      get: { summary: "Get exercise", security: [{ bearerAuth: [] }] },
      patch: { summary: "Update exercise", security: [{ bearerAuth: [] }] },
      delete: { summary: "Delete exercise", security: [{ bearerAuth: [] }] },
    },
    "/api/v1/exercises/last-scores": {
      post: { summary: "Get contextual last exercise scores", security: [{ bearerAuth: [] }] },
    },
    "/api/v1/plans": {
      get: { summary: "List plans", security: [{ bearerAuth: [] }] },
      post: { summary: "Create plan", security: [{ bearerAuth: [] }] },
    },
    "/api/v1/plans/active": {
      get: { summary: "Get active plan", security: [{ bearerAuth: [] }] },
      post: { summary: "Set active plan", security: [{ bearerAuth: [] }] },
    },
    "/api/v1/plans/{planId}": {
      get: { summary: "Get plan", security: [{ bearerAuth: [] }] },
      patch: { summary: "Update plan", security: [{ bearerAuth: [] }] },
      delete: { summary: "Delete plan", security: [{ bearerAuth: [] }] },
    },
    "/api/v1/plans/{planId}/copy": {
      post: { summary: "Copy plan", security: [{ bearerAuth: [] }] },
    },
    "/api/v1/plans/{planId}/assignments": {
      post: { summary: "Assign trainer plan to trainee", security: [{ bearerAuth: [] }] },
    },
    "/api/v1/plans/{planId}/days": {
      get: { summary: "List plan days", security: [{ bearerAuth: [] }] },
      post: { summary: "Create plan day", security: [{ bearerAuth: [] }] },
    },
    "/api/v1/plan-days/{planDayId}": {
      get: { summary: "Get plan day", security: [{ bearerAuth: [] }] },
      delete: { summary: "Delete plan day", security: [{ bearerAuth: [] }] },
    },
    "/api/v1/workouts": {
      get: { summary: "List finalized workouts", security: [{ bearerAuth: [] }] },
      post: { summary: "Create workout draft", security: [{ bearerAuth: [] }] },
    },
    "/api/v1/workouts/dates": {
      get: { summary: "List workout dates", security: [{ bearerAuth: [] }] },
    },
    "/api/v1/workouts/{workoutId}": {
      get: { summary: "Get workout details", security: [{ bearerAuth: [] }] },
    },
    "/api/v1/workouts/{workoutId}/finalize": {
      post: { summary: "Finalize workout", security: [{ bearerAuth: [] }] },
    },
    "/api/v1/measurements": {
      get: { summary: "List body measurements", security: [{ bearerAuth: [] }] },
      post: { summary: "Create body measurement", security: [{ bearerAuth: [] }] },
    },
    "/api/v1/measurements/bulk": {
      post: { summary: "Create body measurements in bulk", security: [{ bearerAuth: [] }] },
    },
    "/api/v1/measurements/history": {
      get: { summary: "Get measurement history", security: [{ bearerAuth: [] }] },
    },
    "/api/v1/measurements/trends": {
      get: { summary: "Get measurement trends", security: [{ bearerAuth: [] }] },
    },
    "/api/v1/measurements/{measurementId}": {
      get: { summary: "Get measurement detail", security: [{ bearerAuth: [] }] },
    },
    "/api/v1/trainer/relationships": {
      post: { summary: "Create trainer-trainee relationship", security: [{ bearerAuth: [] }] },
    },
    "/api/v1/trainee/relationships/{relationshipId}/accept": {
      post: { summary: "Accept trainer relationship", security: [{ bearerAuth: [] }] },
    },
    "/api/v1/trainee/relationships/{relationshipId}/reject": {
      post: { summary: "Reject trainer relationship", security: [{ bearerAuth: [] }] },
    },
    "/api/v1/trainee/trainer/detach": {
      post: { summary: "Detach current trainer", security: [{ bearerAuth: [] }] },
    },
    "/api/v1/trainer/trainees": {
      get: { summary: "List active trainees", security: [{ bearerAuth: [] }] },
    },
    "/api/v1/trainer/trainees/{traineeId}/unlink": {
      post: { summary: "Unlink trainee", security: [{ bearerAuth: [] }] },
    },
    "/api/v1/trainer/report-templates": {
      get: { summary: "List report templates", security: [{ bearerAuth: [] }] },
      post: { summary: "Create report template", security: [{ bearerAuth: [] }] },
    },
    "/api/v1/trainer/report-templates/{templateId}": {
      get: { summary: "Get report template", security: [{ bearerAuth: [] }] },
      patch: { summary: "Update report template", security: [{ bearerAuth: [] }] },
      delete: { summary: "Delete report template", security: [{ bearerAuth: [] }] },
    },
    "/api/v1/trainer/report-assignments": {
      post: { summary: "Assign report", security: [{ bearerAuth: [] }] },
    },
    "/api/v1/trainee/report-assignments": {
      get: { summary: "List trainee report assignments", security: [{ bearerAuth: [] }] },
    },
    "/api/v1/trainee/report-assignments/{assignmentId}/submissions": {
      post: { summary: "Submit report answers", security: [{ bearerAuth: [] }] },
    },
    "/api/v1/trainer/report-submissions": {
      get: { summary: "List report submissions", security: [{ bearerAuth: [] }] },
    },
    "/api/v1/trainer/report-submissions/{submissionId}/feedback": {
      patch: { summary: "Add report feedback", security: [{ bearerAuth: [] }] },
    },
    "/api/v1/trainer/recurring-report-rules": {
      get: { summary: "List recurring report rules", security: [{ bearerAuth: [] }] },
      post: { summary: "Create recurring report rule", security: [{ bearerAuth: [] }] },
    },
    "/api/v1/trainer/recurring-report-rules/{recurringRuleId}": {
      patch: { summary: "Update recurring report rule", security: [{ bearerAuth: [] }] },
      delete: { summary: "Delete recurring report rule", security: [{ bearerAuth: [] }] },
    },
    "/api/v1/trainer/recurring-report-rules/{recurringRuleId}/pause": {
      post: { summary: "Pause recurring report rule", security: [{ bearerAuth: [] }] },
    },
    "/api/v1/trainer/recurring-report-rules/{recurringRuleId}/resume": {
      post: { summary: "Resume recurring report rule", security: [{ bearerAuth: [] }] },
    },
    "/api/v1/ranking": {
      get: { summary: "Ranking", security: [{ bearerAuth: [] }] },
    },
    "/api/v1/users/{userId}/elo": {
      get: { summary: "Get user Elo", security: [{ bearerAuth: [] }] },
    },
    "/api/v1/elo/chart": {
      get: { summary: "Elo history chart", security: [{ bearerAuth: [] }] },
    },
  },
} as const
