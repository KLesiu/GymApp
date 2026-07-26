const uuidSchema = { type: "string", format: "uuid" } as const
const dateTimeSchema = { type: "string", format: "date-time" } as const

const pathParam = (name: string) => ({
  name,
  in: "path",
  required: true,
  schema: uuidSchema,
})

const queryParam = (name: string, schema: Record<string, unknown>, required = false) => ({
  name,
  in: "query",
  required,
  schema,
})

const headerParam = (name: string, required = true) => ({
  name,
  in: "header",
  required,
  schema: { type: "string" },
})

const jsonBody = (schema: Record<string, unknown>, required = true) => ({
  required,
  content: {
    "application/json": {
      schema,
    },
  },
})

const schemaRef = (name: string) => ({ $ref: `#/components/schemas/${name}` })

const jsonResponse = (description: string, schema: Record<string, unknown>) => ({
  description,
  content: {
    "application/json": {
      schema,
    },
  },
})

const exerciseBodyPartEnum = [
  "CHEST",
  "BACK",
  "SHOULDERS",
  "BICEPS",
  "TRICEPS",
  "QUADS",
  "HAMSTRINGS",
  "GLUTES",
  "CORE",
  "CALVES",
] as const

const bodyPartEnum = [
  "WEIGHT",
  "BODY_FAT",
  ...exerciseBodyPartEnum,
  "WAIST",
  "HIPS",
  "THIGH",
  "ARM",
] as const

const ok = { description: "OK" } as const
const created = { description: "Created" } as const
const auth = [{ bearerAuth: [] }]

export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "LiftContext Express API",
    version: "0.1.0",
    description: "LiftContext Express + TypeScript + Prisma API",
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
    schemas: {
      RegisterRequest: {
        type: "object",
        required: ["name", "email", "password", "cpassword"],
        properties: {
          name: { type: "string", minLength: 3, example: "new-user" },
          email: { type: "string", format: "email", example: "user@example.com" },
          password: { type: "string", minLength: 8, example: "password123" },
          cpassword: { type: "string", minLength: 8, example: "password123" },
          isVisibleInRanking: { type: "boolean", default: true },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["name", "password"],
        properties: {
          name: { type: "string", example: "seed-trainee" },
          password: { type: "string", example: "password123" },
        },
      },
      GymRequest: {
        type: "object",
        required: ["name", "address"],
        properties: {
          name: { type: "string", example: "Seed Gym" },
          address: { type: "string", example: "Seed Address" },
        },
      },
      MuscleGroupRequest: {
        type: "object",
        required: ["name", "region"],
        properties: {
          name: { type: "string", example: "Chest" },
          region: {
            type: "string",
            enum: [
              "CHEST",
              "BACK",
              "SHOULDERS",
              "BICEPS",
              "TRICEPS",
              "QUADS",
              "HAMSTRINGS",
              "GLUTES",
              "CORE",
              "CALVES",
              "CUSTOM",
            ],
          },
        },
      },
      MuscleGroupResponse: {
        type: "object",
        required: ["_id", "name", "region", "isGlobal"],
        properties: {
          _id: uuidSchema,
          name: { type: "string", example: "Chest" },
          region: { type: "string" },
          isGlobal: { type: "boolean", example: false },
        },
      },
      ExerciseRequest: {
        type: "object",
        required: ["name", "bodyPart"],
        properties: {
          name: { type: "string", example: "Bench press" },
          bodyPart: { type: "string", enum: exerciseBodyPartEnum },
          muscleGroupId: uuidSchema,
          formula: {
            type: "string",
            enum: ["STANDARD", "STRENGTH", "VOLUME", "PULLUP_INVERSE"],
            default: "STANDARD",
          },
        },
      },
      ExerciseResponse: {
        type: "object",
        required: ["_id", "name", "bodyPart", "formula", "isGlobal", "muscleGroup"],
        properties: {
          _id: uuidSchema,
          name: { type: "string", example: "Bench press" },
          bodyPart: { type: "string", enum: exerciseBodyPartEnum },
          formula: { type: "string", enum: ["STANDARD", "STRENGTH", "VOLUME", "PULLUP_INVERSE"] },
          isGlobal: { type: "boolean", example: false },
          muscleGroup: schemaRef("MuscleGroupResponse"),
        },
      },
      UpdateExerciseRequest: {
        type: "object",
        minProperties: 1,
        properties: {
          name: { type: "string", example: "Bench press" },
          bodyPart: { type: "string", enum: exerciseBodyPartEnum },
          muscleGroupId: uuidSchema,
          formula: {
            type: "string",
            enum: ["STANDARD", "STRENGTH", "VOLUME", "PULLUP_INVERSE"],
          },
        },
      },
      LastScoresRequest: {
        type: "object",
        required: ["exerciseId", "series"],
        properties: {
          exerciseId: uuidSchema,
          exerciseName: { type: "string", example: "Bench press" },
          series: { type: "integer", minimum: 1, maximum: 30, example: 1 },
          gymId: uuidSchema,
        },
      },
      PlanExerciseRequest: {
        type: "object",
        required: ["exerciseId", "series", "repsTarget", "orderIndex"],
        properties: {
          exerciseId: uuidSchema,
          series: { type: "integer", minimum: 1, example: 3 },
          repsTarget: { type: "integer", minimum: 1, example: 10 },
          orderIndex: { type: "integer", minimum: 0, example: 0 },
        },
      },
      PlanDayRequest: {
        type: "object",
        required: ["name", "orderIndex", "exercises"],
        properties: {
          name: { type: "string", example: "Push day" },
          weekNumber: { type: "integer", minimum: 1, default: 1, example: 1 },
          orderIndex: { type: "integer", minimum: 0, example: 0 },
          exercises: { type: "array", items: schemaRef("PlanExerciseRequest") },
        },
      },
      PlanRequest: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string", example: "Starter plan" },
          description: { type: "string", example: "Simple training plan" },
          weeksCount: { type: "integer", minimum: 1, default: 1, example: 2 },
          days: { type: "array", items: schemaRef("PlanDayRequest") },
        },
      },
      UpdatePlanRequest: {
        type: "object",
        minProperties: 1,
        properties: {
          name: { type: "string", example: "Updated plan" },
          description: { type: "string", example: "Updated description" },
          weeksCount: { type: "integer", minimum: 1, example: 2 },
        },
      },
      SetActivePlanRequest: {
        type: "object",
        required: ["planId"],
        properties: { planId: uuidSchema },
      },
      AssignPlanRequest: {
        type: "object",
        required: ["traineeId"],
        properties: { traineeId: uuidSchema },
      },
      WorkoutSetRequest: {
        type: "object",
        required: ["exerciseId", "series", "reps", "weight", "unit"],
        properties: {
          exerciseId: uuidSchema,
          series: { type: "integer", minimum: 1, example: 1 },
          reps: { type: "integer", minimum: 1, nullable: true, example: 10 },
          weight: { type: "number", minimum: 0, nullable: true, example: 80 },
          unit: { type: "string", enum: ["KILOGRAMS", "POUNDS"] },
        },
      },
      CreateWorkoutRequest: {
        type: "object",
        required: ["gymId", "startedAt", "sets"],
        properties: {
          gymId: uuidSchema,
          planId: uuidSchema,
          planDayId: uuidSchema,
          startedAt: { ...dateTimeSchema, example: "2026-07-22T12:00:00.000Z" },
          sets: { type: "array", minItems: 1, items: schemaRef("WorkoutSetRequest") },
        },
      },
      UpdateWorkoutSetsRequest: {
        type: "object",
        required: ["sets"],
        properties: {
          sets: {
            type: "array",
            minItems: 1,
            items: {
              type: "object",
              required: ["exerciseId", "series", "reps", "weight", "unit"],
              properties: {
                id: uuidSchema,
                exerciseId: uuidSchema,
                series: { type: "integer", minimum: 1, example: 1 },
                reps: { type: "integer", minimum: 1, example: 10 },
                weight: { type: "number", minimum: 0, example: 80 },
                unit: { type: "string", enum: ["KILOGRAMS", "POUNDS"] },
              },
            },
          },
        },
      },
      FinalizeWorkoutRequest: {
        type: "object",
        properties: {
          sets: {
            type: "array",
            minItems: 1,
            items: {
              type: "object",
              required: ["exerciseId", "series", "reps", "weight", "unit"],
              properties: {
                id: uuidSchema,
                exerciseId: uuidSchema,
                series: { type: "integer", minimum: 1, example: 1 },
                reps: { type: "integer", minimum: 1, example: 10 },
                weight: { type: "number", minimum: 0, example: 80 },
                unit: { type: "string", enum: ["KILOGRAMS", "POUNDS"] },
              },
            },
          },
        },
      },
      MeasurementRequest: {
        type: "object",
        required: ["bodyPart", "unit", "value", "takenAt"],
        properties: {
          bodyPart: {
            type: "string",
            enum: bodyPartEnum,
          },
          unit: { type: "string", enum: ["KG", "CM", "PERCENT"] },
          value: { type: "number", minimum: 0, exclusiveMinimum: true, example: 82.5 },
          takenAt: { ...dateTimeSchema, example: "2026-07-22T12:00:00.000Z" },
        },
      },
      RelationshipRequest: {
        type: "object",
        required: ["traineeEmail"],
        properties: {
          traineeEmail: { type: "string", format: "email", example: "trainee@example.com" },
        },
      },
      TrainerInvitationResponse: {
        type: "object",
        required: ["id", "_id", "traineeId", "traineeName", "traineeEmail", "status", "createdAt"],
        properties: {
          id: uuidSchema,
          _id: uuidSchema,
          traineeId: uuidSchema,
          traineeName: { type: "string", example: "seed-trainee" },
          traineeEmail: { type: "string", format: "email", example: "trainee@example.com" },
          status: { type: "string", enum: ["PENDING", "ACTIVE", "REJECTED", "DETACHED"] },
          createdAt: dateTimeSchema,
          activatedAt: { ...dateTimeSchema, nullable: true },
          detachedAt: { ...dateTimeSchema, nullable: true },
        },
      },
      ReportFieldRequest: {
        type: "object",
        required: ["key", "label", "type", "isRequired", "order"],
        properties: {
          key: { type: "string", example: "mood" },
          label: { type: "string", example: "Mood" },
          type: { type: "string", enum: ["TEXT", "NUMBER", "SCALE"] },
          isRequired: { type: "boolean", example: true },
          order: { type: "integer", minimum: 0, example: 0 },
          moduleConfig: { type: "object", additionalProperties: true },
        },
      },
      ReportSubmissionResponse: {
        type: "object",
        required: [
          "id",
          "traineeId",
          "assignmentId",
          "templateName",
          "templateVersion",
          "answers",
          "submittedAt",
        ],
        properties: {
          id: uuidSchema,
          traineeId: uuidSchema,
          traineeName: { type: "string", example: "seed-trainee" },
          assignmentId: uuidSchema,
          templateName: { type: "string", example: "Weekly check-in" },
          template: {
            type: "object",
            required: ["id", "name"],
            properties: { id: uuidSchema, name: { type: "string", example: "Weekly check-in" } },
          },
          templateVersion: {
            type: "object",
            required: ["id", "version", "snapshot"],
            properties: {
              id: uuidSchema,
              version: { type: "integer", minimum: 1, example: 2 },
              snapshot: {
                type: "object",
                required: ["fields"],
                properties: { fields: { type: "array", items: schemaRef("ReportFieldRequest") } },
                additionalProperties: true,
              },
            },
          },
          answers: { type: "object", additionalProperties: true, example: { mood: "good" } },
          submittedAt: dateTimeSchema,
          feedback: {
            type: "object",
            properties: {
              overallComment: { type: "string", nullable: true },
              fieldComments: { type: "object", additionalProperties: true, nullable: true },
              readAt: { ...dateTimeSchema, nullable: true },
            },
          },
        },
      },
      ReportTemplateRequest: {
        type: "object",
        required: ["name", "fields"],
        properties: {
          name: { type: "string", example: "Weekly check-in" },
          description: { type: "string", example: "Weekly trainee report" },
          fields: { type: "array", minItems: 1, items: schemaRef("ReportFieldRequest") },
        },
      },
      UpdateReportTemplateRequest: {
        type: "object",
        minProperties: 1,
        properties: {
          name: { type: "string", example: "Weekly check-in" },
          description: { type: "string", example: "Updated description" },
          fields: { type: "array", minItems: 1, items: schemaRef("ReportFieldRequest") },
        },
      },
      ReportAssignmentRequest: {
        type: "object",
        required: ["traineeId", "templateId"],
        properties: {
          traineeId: uuidSchema,
          templateId: uuidSchema,
          dueAt: dateTimeSchema,
          note: { type: "string", example: "Fill this after training" },
        },
      },
      RecurringRuleRequest: {
        type: "object",
        required: ["traineeId", "templateId", "intervalUnit", "intervalValue", "startsAt"],
        properties: {
          traineeId: uuidSchema,
          templateId: uuidSchema,
          intervalUnit: { type: "string", enum: ["DAY", "WEEK", "MONTH"] },
          intervalValue: { type: "integer", minimum: 1, example: 1 },
          startsAt: dateTimeSchema,
          endsAt: dateTimeSchema,
        },
      },
      UpdateRecurringRuleRequest: {
        type: "object",
        minProperties: 1,
        properties: {
          traineeId: uuidSchema,
          templateId: uuidSchema,
          intervalUnit: { type: "string", enum: ["DAY", "WEEK", "MONTH"] },
          intervalValue: { type: "integer", minimum: 1, example: 1 },
          startsAt: dateTimeSchema,
          endsAt: dateTimeSchema,
        },
      },
      ReportSubmitRequest: {
        type: "object",
        required: ["answers"],
        properties: {
          answers: { type: "object", additionalProperties: true, example: { mood: "good" } },
        },
      },
      ReportFeedbackRequest: {
        type: "object",
        properties: {
          trainerOverallComment: { type: "string", example: "Good progress" },
          fieldComments: {
            type: "object",
            additionalProperties: { type: "string" },
            example: { mood: "Keep tracking this" },
          },
        },
      },
    },
  },
  paths: {
    "/health": {
      get: {
        summary: "Health check",
        responses: { "200": ok },
      },
    },
    "/api/v1/auth/register": {
      post: {
        summary: "Register user",
        requestBody: jsonBody(schemaRef("RegisterRequest")),
        responses: { "201": created },
      },
    },
    "/api/v1/auth/trainer/register": {
      post: {
        summary: "Register trainer",
        requestBody: jsonBody(schemaRef("RegisterRequest")),
        responses: { "201": created },
      },
    },
    "/api/v1/auth/login": {
      post: {
        summary: "Login",
        requestBody: jsonBody(schemaRef("LoginRequest")),
        responses: { "200": { description: "Authenticated" } },
      },
    },
    "/api/v1/auth/me": {
      get: { summary: "Get authenticated user", security: auth, responses: { "200": ok } },
    },
    "/api/v1/gyms": {
      get: { summary: "List gyms", security: auth, responses: { "200": ok } },
      post: {
        summary: "Create gym",
        security: auth,
        requestBody: jsonBody(schemaRef("GymRequest")),
        responses: { "201": created },
      },
    },
    "/api/v1/gyms/{gymId}": {
      get: {
        summary: "Get gym",
        security: auth,
        parameters: [pathParam("gymId")],
        responses: { "200": ok },
      },
      patch: {
        summary: "Update gym",
        security: auth,
        parameters: [pathParam("gymId")],
        requestBody: jsonBody(schemaRef("GymRequest")),
        responses: { "200": ok },
      },
      delete: {
        summary: "Soft-delete gym",
        security: auth,
        parameters: [pathParam("gymId")],
        responses: { "200": ok },
      },
    },
    "/api/v1/muscle-groups": {
      get: {
        summary: "List muscle groups",
        security: auth,
        responses: {
          "200": jsonResponse("Muscle groups", {
            type: "array",
            items: schemaRef("MuscleGroupResponse"),
          }),
        },
      },
      post: {
        summary: "Create muscle group",
        security: auth,
        requestBody: jsonBody(schemaRef("MuscleGroupRequest")),
        responses: { "201": created },
      },
    },
    "/api/v1/exercises": {
      get: {
        summary: "List exercises",
        security: auth,
        responses: {
          "200": jsonResponse("Exercises", { type: "array", items: schemaRef("ExerciseResponse") }),
        },
      },
      post: {
        summary: "Create exercise",
        security: auth,
        requestBody: jsonBody(schemaRef("ExerciseRequest")),
        responses: { "201": created },
      },
    },
    "/api/v1/exercises/last-scores": {
      post: {
        summary: "Get contextual last exercise scores",
        security: auth,
        requestBody: jsonBody(schemaRef("LastScoresRequest")),
        responses: { "200": jsonResponse("Exercise", schemaRef("ExerciseResponse")) },
      },
    },
    "/api/v1/exercises/{exerciseId}": {
      get: {
        summary: "Get exercise",
        security: auth,
        parameters: [pathParam("exerciseId")],
        responses: {
          "200": jsonResponse("Trainer invitations", {
            type: "array",
            items: schemaRef("TrainerInvitationResponse"),
          }),
        },
      },
      patch: {
        summary: "Update exercise",
        security: auth,
        parameters: [pathParam("exerciseId")],
        requestBody: jsonBody(schemaRef("UpdateExerciseRequest")),
        responses: { "200": ok },
      },
      delete: {
        summary: "Delete exercise",
        security: auth,
        parameters: [pathParam("exerciseId")],
        responses: { "200": ok },
      },
    },
    "/api/v1/plans": {
      get: { summary: "List plans", security: auth, responses: { "200": ok } },
      post: {
        summary: "Create plan",
        security: auth,
        requestBody: jsonBody(schemaRef("PlanRequest")),
        responses: { "201": created },
      },
    },
    "/api/v1/plans/active": {
      get: { summary: "Get active plan", security: auth, responses: { "200": ok } },
      post: {
        summary: "Set active plan",
        security: auth,
        requestBody: jsonBody(schemaRef("SetActivePlanRequest")),
        responses: { "200": ok },
      },
    },
    "/api/v1/plans/active/{planId}": {
      delete: {
        summary: "Deactivate active plan",
        security: auth,
        parameters: [pathParam("planId")],
        responses: { "200": ok },
      },
    },
    "/api/v1/plans/{planId}": {
      get: {
        summary: "Get plan",
        security: auth,
        parameters: [pathParam("planId")],
        responses: { "200": ok },
      },
      patch: {
        summary: "Update plan",
        security: auth,
        parameters: [pathParam("planId")],
        requestBody: jsonBody(schemaRef("UpdatePlanRequest")),
        responses: { "200": ok },
      },
      delete: {
        summary: "Delete plan",
        security: auth,
        parameters: [pathParam("planId")],
        responses: { "200": ok },
      },
    },
    "/api/v1/plans/{planId}/copy": {
      post: {
        summary: "Copy plan",
        security: auth,
        parameters: [pathParam("planId")],
        responses: { "201": created },
      },
    },
    "/api/v1/plans/{planId}/assignments": {
      post: {
        summary: "Assign trainer plan to trainee",
        security: auth,
        parameters: [pathParam("planId")],
        requestBody: jsonBody(schemaRef("AssignPlanRequest")),
        responses: { "201": created },
      },
    },
    "/api/v1/plans/{planId}/days": {
      get: {
        summary: "List plan days",
        security: auth,
        parameters: [pathParam("planId")],
        responses: { "200": ok },
      },
      post: {
        summary: "Create plan day",
        security: auth,
        parameters: [pathParam("planId")],
        requestBody: jsonBody(schemaRef("PlanDayRequest")),
        responses: { "201": created },
      },
    },
    "/api/v1/plan-days/{planDayId}": {
      get: {
        summary: "Get plan day",
        security: auth,
        parameters: [pathParam("planDayId")],
        responses: { "200": ok },
      },
      patch: {
        summary: "Update plan day",
        security: auth,
        parameters: [pathParam("planDayId")],
        requestBody: jsonBody(schemaRef("PlanDayRequest")),
        responses: { "200": ok },
      },
      delete: {
        summary: "Delete plan day",
        security: auth,
        parameters: [pathParam("planDayId")],
        responses: { "200": ok },
      },
    },
    "/api/v1/workouts": {
      get: { summary: "List finalized workouts", security: auth, responses: { "200": ok } },
      post: {
        summary: "Create workout draft",
        security: auth,
        requestBody: jsonBody(schemaRef("CreateWorkoutRequest")),
        responses: { "201": created },
      },
    },
    "/api/v1/workouts/dates": {
      get: { summary: "List workout dates", security: auth, responses: { "200": ok } },
    },
    "/api/v1/workouts/{workoutId}": {
      get: {
        summary: "Get workout details",
        security: auth,
        parameters: [pathParam("workoutId")],
        responses: { "200": ok },
      },
    },
    "/api/v1/workouts/{workoutId}/finalize": {
      post: {
        summary: "Finalize workout",
        security: auth,
        parameters: [pathParam("workoutId"), headerParam("Idempotency-Key")],
        requestBody: jsonBody(schemaRef("FinalizeWorkoutRequest"), false),
        responses: { "200": ok },
      },
    },
    "/api/v1/workouts/{workoutId}/sets": {
      patch: {
        summary: "Update draft workout sets",
        security: auth,
        parameters: [pathParam("workoutId")],
        requestBody: jsonBody(schemaRef("UpdateWorkoutSetsRequest")),
        responses: { "200": ok },
      },
    },
    "/api/v1/measurements": {
      get: {
        summary: "List body measurements",
        security: auth,
        parameters: [
          queryParam("userId", uuidSchema),
          queryParam("bodyPart", {
            type: "string",
            enum: ["WEIGHT", "BODY_FAT", "CHEST", "WAIST", "HIPS", "THIGH", "ARM"],
          }),
          queryParam("unit", { type: "string", enum: ["KG", "CM", "PERCENT"] }),
        ],
        responses: { "200": ok },
      },
      post: {
        summary: "Create body measurement",
        security: auth,
        requestBody: jsonBody(schemaRef("MeasurementRequest")),
        responses: { "201": created },
      },
    },
    "/api/v1/measurements/bulk": {
      post: {
        summary: "Create body measurements in bulk",
        security: auth,
        requestBody: jsonBody({
          type: "array",
          minItems: 1,
          items: schemaRef("MeasurementRequest"),
        }),
        responses: { "201": created },
      },
    },
    "/api/v1/measurements/history": {
      get: {
        summary: "Get measurement history",
        security: auth,
        parameters: [
          queryParam("userId", uuidSchema),
          queryParam("bodyPart", {
            type: "string",
            enum: ["WEIGHT", "BODY_FAT", "CHEST", "WAIST", "HIPS", "THIGH", "ARM"],
          }),
          queryParam("unit", { type: "string", enum: ["KG", "CM", "PERCENT"] }),
        ],
        responses: { "200": ok },
      },
    },
    "/api/v1/measurements/trends": {
      get: {
        summary: "Get measurement trends",
        security: auth,
        parameters: [
          queryParam("userId", uuidSchema),
          queryParam("bodyPart", {
            type: "string",
            enum: ["WEIGHT", "BODY_FAT", "CHEST", "WAIST", "HIPS", "THIGH", "ARM"],
          }),
          queryParam("unit", { type: "string", enum: ["KG", "CM", "PERCENT"] }),
        ],
        responses: { "200": ok },
      },
    },
    "/api/v1/measurements/{measurementId}": {
      get: {
        summary: "Get measurement detail",
        security: auth,
        parameters: [pathParam("measurementId")],
        responses: { "200": ok },
      },
    },
    "/api/v1/trainer/relationships": {
      get: {
        summary: "List trainer invitations",
        security: auth,
        responses: { "200": ok },
      },
      post: {
        summary: "Create trainer-trainee relationship",
        security: auth,
        requestBody: jsonBody(schemaRef("RelationshipRequest")),
        responses: { "201": created },
      },
    },
    "/api/v1/trainee/relationships/{relationshipId}/accept": {
      post: {
        summary: "Accept trainer relationship",
        security: auth,
        parameters: [pathParam("relationshipId")],
        responses: { "200": ok },
      },
    },
    "/api/v1/trainee/relationships/{relationshipId}/reject": {
      post: {
        summary: "Reject trainer relationship",
        security: auth,
        parameters: [pathParam("relationshipId")],
        responses: { "200": ok },
      },
    },
    "/api/v1/trainee/relationships": {
      get: {
        summary: "List pending trainer invitations",
        security: auth,
        responses: { "200": ok },
      },
    },
    "/api/v1/trainee/trainer/detach": {
      post: { summary: "Detach current trainer", security: auth, responses: { "200": ok } },
    },
    "/api/v1/trainee/trainer": {
      get: { summary: "Get current trainer", security: auth, responses: { "200": ok } },
    },
    "/api/v1/trainer/trainees": {
      get: { summary: "List active trainees", security: auth, responses: { "200": ok } },
    },
    "/api/v1/trainer/trainees/{traineeId}/active-plan": {
      get: {
        summary: "Get trainee active plan",
        security: auth,
        parameters: [pathParam("traineeId")],
        responses: { "200": ok },
      },
    },
    "/api/v1/trainer/trainees/{traineeId}/unlink": {
      post: {
        summary: "Unlink trainee",
        security: auth,
        parameters: [pathParam("traineeId")],
        responses: { "200": ok },
      },
    },
    "/api/v1/trainer/report-templates": {
      get: { summary: "List report templates", security: auth, responses: { "200": ok } },
      post: {
        summary: "Create report template",
        security: auth,
        requestBody: jsonBody(schemaRef("ReportTemplateRequest")),
        responses: { "201": created },
      },
    },
    "/api/v1/trainer/report-templates/{templateId}": {
      get: {
        summary: "Get report template",
        security: auth,
        parameters: [pathParam("templateId")],
        responses: { "200": ok },
      },
      patch: {
        summary: "Update report template",
        security: auth,
        parameters: [pathParam("templateId")],
        requestBody: jsonBody(schemaRef("UpdateReportTemplateRequest")),
        responses: { "200": ok },
      },
      delete: {
        summary: "Delete report template",
        security: auth,
        parameters: [pathParam("templateId")],
        responses: { "200": ok },
      },
    },
    "/api/v1/trainer/report-assignments": {
      post: {
        summary: "Assign report",
        security: auth,
        requestBody: jsonBody(schemaRef("ReportAssignmentRequest")),
        responses: { "201": created },
      },
    },
    "/api/v1/trainee/report-assignments": {
      get: { summary: "List trainee report assignments", security: auth, responses: { "200": ok } },
    },
    "/api/v1/trainee/report-assignments/{assignmentId}/submissions": {
      post: {
        summary: "Submit report answers",
        security: auth,
        parameters: [pathParam("assignmentId")],
        requestBody: jsonBody(schemaRef("ReportSubmitRequest")),
        responses: { "201": created },
      },
    },
    "/api/v1/trainer/report-submissions": {
      get: {
        summary: "List report submissions",
        security: auth,
        parameters: [queryParam("traineeId", uuidSchema)],
        responses: {
          "200": {
            description: "Report submissions with frozen template versions",
            content: {
              "application/json": {
                schema: { type: "array", items: schemaRef("ReportSubmissionResponse") },
              },
            },
          },
        },
      },
    },
    "/api/v1/trainer/report-submissions/{submissionId}/feedback": {
      patch: {
        summary: "Add report feedback",
        security: auth,
        parameters: [pathParam("submissionId")],
        requestBody: jsonBody(schemaRef("ReportFeedbackRequest")),
        responses: { "200": ok },
      },
    },
    "/api/v1/trainer/recurring-report-rules": {
      get: {
        summary: "List recurring report rules",
        security: auth,
        parameters: [queryParam("traineeId", uuidSchema)],
        responses: { "200": ok },
      },
      post: {
        summary: "Create recurring report rule",
        security: auth,
        requestBody: jsonBody(schemaRef("RecurringRuleRequest")),
        responses: { "201": created },
      },
    },
    "/api/v1/trainer/recurring-report-rules/{recurringRuleId}": {
      patch: {
        summary: "Update recurring report rule",
        security: auth,
        parameters: [pathParam("recurringRuleId")],
        requestBody: jsonBody(schemaRef("UpdateRecurringRuleRequest")),
        responses: { "200": ok },
      },
      delete: {
        summary: "Delete recurring report rule",
        security: auth,
        parameters: [pathParam("recurringRuleId")],
        responses: { "200": ok },
      },
    },
    "/api/v1/trainer/recurring-report-rules/{recurringRuleId}/pause": {
      post: {
        summary: "Pause recurring report rule",
        security: auth,
        parameters: [pathParam("recurringRuleId")],
        responses: { "200": ok },
      },
    },
    "/api/v1/trainer/recurring-report-rules/{recurringRuleId}/resume": {
      post: {
        summary: "Resume recurring report rule",
        security: auth,
        parameters: [pathParam("recurringRuleId")],
        responses: { "200": ok },
      },
    },
    "/api/v1/ranking": {
      get: {
        summary: "Ranking",
        security: auth,
        parameters: [
          queryParam("page", { type: "integer", minimum: 1, default: 1 }),
          queryParam("pageSize", { type: "integer", minimum: 1, maximum: 100, default: 10 }),
        ],
        responses: { "200": ok },
      },
    },
    "/api/v1/users/{userId}/elo": {
      get: {
        summary: "Get user Elo",
        security: auth,
        parameters: [pathParam("userId")],
        responses: { "200": ok },
      },
    },
    "/api/v1/elo/chart": {
      get: { summary: "Elo history chart", security: auth, responses: { "200": ok } },
    },
  },
} as const
