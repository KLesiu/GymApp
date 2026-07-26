import { expect, it } from "vitest"

import { authRequest, describeAcceptance } from "./helpers/acceptance-context"

describeAcceptance("plan trainer report acceptance", (environment, register) => {
  it("allows self exercise and plan creation", async () => {
    const user = await register("plan-user", "plan-user@example.com")
    const exercise = await createExercise(environment, user.token, "Row", "BACK", "STRENGTH")

    const plan = await authRequest(environment.client.post("/api/v1/plans"), user.token).send({
      name: "Self Plan",
      days: [
        {
          name: "Day 1",
          orderIndex: 0,
          exercises: [{ exerciseId: exercise.body._id, series: 3, repsTarget: 10, orderIndex: 0 }],
        },
      ],
    })

    expect(plan.status).toBe(201)
    expect(plan.body.days[0].exercises[0].exerciseId).toBe(exercise.body._id)

    const copy = await authRequest(
      environment.client.post(`/api/v1/plans/${plan.body._id}/copy`),
      user.token,
    ).send()
    const active = await authRequest(
      environment.client.post("/api/v1/plans/active"),
      user.token,
    ).send({
      planId: copy.body._id,
    })
    const days = await authRequest(
      environment.client.get(`/api/v1/plans/${copy.body._id}/days`),
      user.token,
    )

    expect(copy.status).toBe(201)
    expect(active.body.msg).toBe("PLAN_ACTIVATED")
    expect(days.body).toHaveLength(1)
  })

  it("supports plan-day create read update and delete", async () => {
    const user = await register("plan-day-user", "plan-day-user@example.com")
    const exercise = await createExercise(
      environment,
      user.token,
      "Plan Day Row",
      "BACK",
      "STANDARD",
    )
    const plan = await authRequest(environment.client.post("/api/v1/plans"), user.token).send({
      name: "Plan Day Plan",
      days: [{ name: "Initial", orderIndex: 0, exercises: [] }],
    })

    const day = await authRequest(
      environment.client.post(`/api/v1/plans/${plan.body._id}/days`),
      user.token,
    ).send({
      name: "Extra",
      orderIndex: 1,
      exercises: [{ exerciseId: exercise.body._id, series: 2, repsTarget: 12, orderIndex: 0 }],
    })
    const detail = await authRequest(
      environment.client.get(`/api/v1/plan-days/${day.body._id}`),
      user.token,
    )
    const updated = await authRequest(
      environment.client.patch(`/api/v1/plan-days/${day.body._id}`),
      user.token,
    ).send({
      name: "Extra Updated",
      weekNumber: 1,
      orderIndex: 1,
      exercises: [{ exerciseId: exercise.body._id, series: 4, repsTarget: 8, orderIndex: 0 }],
    })
    const deleted = await authRequest(
      environment.client.delete(`/api/v1/plan-days/${day.body._id}`),
      user.token,
    )

    expect(detail.body.name).toBe("Extra")
    expect(updated.body.name).toBe("Extra Updated")
    expect(updated.body.exercises[0]).toMatchObject({ series: 4, repsTarget: 8 })
    expect(deleted.body.msg).toBe("DELETED")
  })

  it("creates a plan day after deleting an earlier day without order collisions", async () => {
    const user = await register("plan-day-order", "plan-day-order@example.com")
    const exercise = await createExercise(environment, user.token, "Order Row", "BACK", "STANDARD")
    const plan = await authRequest(environment.client.post("/api/v1/plans"), user.token).send({
      name: "Plan Day Order Plan",
      days: [
        {
          name: "First",
          weekNumber: 1,
          orderIndex: 0,
          exercises: [{ exerciseId: exercise.body._id, series: 2, repsTarget: 10, orderIndex: 0 }],
        },
        {
          name: "Second",
          weekNumber: 1,
          orderIndex: 1,
          exercises: [{ exerciseId: exercise.body._id, series: 3, repsTarget: 10, orderIndex: 0 }],
        },
      ],
    })

    await authRequest(
      environment.client.delete(`/api/v1/plan-days/${plan.body.days[0]._id}`),
      user.token,
    )
    const added = await authRequest(
      environment.client.post(`/api/v1/plans/${plan.body._id}/days`),
      user.token,
    ).send({
      name: "Third",
      weekNumber: 1,
      orderIndex: 1,
      exercises: [{ exerciseId: exercise.body._id, series: 4, repsTarget: 10, orderIndex: 0 }],
    })

    expect(added.status).toBe(201)
    expect(added.body.name).toBe("Third")
    expect(added.body.orderIndex).toBeGreaterThan(1)
  })

  it("returns multi-week plan days grouped by week before day order", async () => {
    const user = await register("plan-day-sort", "plan-day-sort@example.com")
    const exercise = await createExercise(environment, user.token, "Sort Row", "BACK", "STANDARD")
    const plan = await authRequest(environment.client.post("/api/v1/plans"), user.token).send({
      name: "Plan Day Sort Plan",
      weeksCount: 2,
      days: [
        {
          name: "Week 2 First",
          weekNumber: 2,
          orderIndex: 0,
          exercises: [{ exerciseId: exercise.body._id, series: 2, repsTarget: 10, orderIndex: 0 }],
        },
        {
          name: "Week 1 First",
          weekNumber: 1,
          orderIndex: 0,
          exercises: [{ exerciseId: exercise.body._id, series: 3, repsTarget: 10, orderIndex: 0 }],
        },
        {
          name: "Week 1 Second",
          weekNumber: 1,
          orderIndex: 1,
          exercises: [{ exerciseId: exercise.body._id, series: 4, repsTarget: 10, orderIndex: 0 }],
        },
      ],
    })

    const detail = await authRequest(
      environment.client.get(`/api/v1/plans/${plan.body._id}`),
      user.token,
    )

    expect(detail.body.days.map((day: { name: string }) => day.name)).toEqual([
      "Week 1 First",
      "Week 1 Second",
      "Week 2 First",
    ])
  })

  it("moves an edited plan day to the end of its target week", async () => {
    const user = await register("plan-day-move", "plan-day-move@example.com")
    const exercise = await createExercise(environment, user.token, "Move Row", "BACK", "STANDARD")
    const plan = await authRequest(environment.client.post("/api/v1/plans"), user.token).send({
      name: "Plan Day Move Plan",
      weeksCount: 2,
      days: [
        {
          name: "Week 1 Move Me",
          weekNumber: 1,
          orderIndex: 0,
          exercises: [{ exerciseId: exercise.body._id, series: 2, repsTarget: 10, orderIndex: 0 }],
        },
        {
          name: "Week 2 First",
          weekNumber: 2,
          orderIndex: 0,
          exercises: [{ exerciseId: exercise.body._id, series: 3, repsTarget: 10, orderIndex: 0 }],
        },
      ],
    })

    const moved = await authRequest(
      environment.client.patch(`/api/v1/plan-days/${plan.body.days[0]._id}`),
      user.token,
    ).send({
      name: "Week 2 Second",
      weekNumber: 2,
      orderIndex: 0,
      exercises: [{ exerciseId: exercise.body._id, series: 4, repsTarget: 8, orderIndex: 0 }],
    })
    const detail = await authRequest(
      environment.client.get(`/api/v1/plans/${plan.body._id}`),
      user.token,
    )

    expect(moved.body.weekNumber).toBe(2)
    expect(moved.body.orderIndex).toBe(1)
    expect(detail.body.days.map((day: { name: string }) => day.name)).toEqual([
      "Week 2 First",
      "Week 2 Second",
    ])
  })

  it("deletes a self-active plan instead of cloning it back to the same user", async () => {
    const user = await register("self-active-delete", "self-active-delete@example.com")
    const exercise = await createExercise(
      environment,
      user.token,
      "Self Active Row",
      "BACK",
      "STANDARD",
    )
    const plan = await authRequest(environment.client.post("/api/v1/plans"), user.token).send({
      name: "Self Active Delete Plan",
      days: [
        {
          name: "Self Day",
          orderIndex: 0,
          exercises: [{ exerciseId: exercise.body._id, series: 2, repsTarget: 10, orderIndex: 0 }],
        },
      ],
    })
    await authRequest(environment.client.post("/api/v1/plans/active"), user.token).send({
      planId: plan.body._id,
    })

    const deleted = await authRequest(
      environment.client.delete(`/api/v1/plans/${plan.body._id}`),
      user.token,
    )
    const active = await authRequest(environment.client.get("/api/v1/plans/active"), user.token)
    const list = await authRequest(environment.client.get("/api/v1/plans"), user.token)

    expect(deleted.body.msg).toBe("DELETED")
    expect(active.body).toBeNull()
    expect(
      list.body.some((item: { name: string }) => item.name === "Self Active Delete Plan"),
    ).toBe(false)
  })

  it("exposes global starter exercises for new user plans", async () => {
    const user = await register("starter-exercises-user", "starter-exercises-user@example.com")
    const exercises = await authRequest(environment.client.get("/api/v1/exercises"), user.token)

    expect(exercises.status).toBe(200)
    expect(
      exercises.body.filter((exercise: { isGlobal?: boolean }) => exercise.isGlobal),
    ).toHaveLength(50)

    const globalExercise = (exercises.body as { _id: string; isGlobal?: boolean }[])[0]
    if (!globalExercise) {
      throw new Error("Expected at least one global starter exercise")
    }
    const plan = await authRequest(environment.client.post("/api/v1/plans"), user.token).send({
      name: "Starter Global Plan",
      days: [
        {
          name: "Global Day",
          orderIndex: 0,
          exercises: [{ exerciseId: globalExercise._id, series: 3, repsTarget: 10, orderIndex: 0 }],
        },
      ],
    })

    expect(globalExercise.isGlobal).toBe(true)
    expect(plan.status).toBe(201)
    expect(plan.body.days[0].exercises[0].exerciseId).toBe(globalExercise._id)
  })

  it("blocks trainer access without active relationship", async () => {
    const trainer = await register("trainer-block", "trainer-block@example.com", ["TRAINER"])
    const trainee = await register("trainee-block", "trainee-block@example.com")
    const response = await authRequest(
      environment.client.get(`/api/v1/users/${trainee.userId}/elo`),
      trainer.token,
    )

    expect(response.status).toBe(403)
  })

  it("allows trainer to assign a plan after the trainee accepts the relationship", async () => {
    const trainer = await register("trainer-assign", "trainer-assign@example.com", ["TRAINER"])
    const trainee = await register("trainee-assign", "trainee-assign@example.com")
    const relationship = await createRelationship(
      environment,
      trainer.token,
      `  ${trainee.email.toUpperCase()}  `,
    )
    const invitations = await authRequest(
      environment.client.get("/api/v1/trainer/relationships"),
      trainer.token,
    )

    expect(relationship.status).toBe(201)
    expect(invitations.body[0]).toMatchObject({
      traineeEmail: trainee.email,
      status: "PENDING",
    })
    await authRequest(
      environment.client.post(`/api/v1/trainee/relationships/${relationship.body.id}/accept`),
      trainee.token,
    ).send()

    const exercise = await createExercise(environment, trainer.token, "Squat", "QUADS", "STANDARD")
    const plan = await authRequest(environment.client.post("/api/v1/plans"), trainer.token).send({
      name: "Coach Plan",
      days: [
        {
          name: "Lower",
          orderIndex: 0,
          exercises: [{ exerciseId: exercise.body._id, series: 5, repsTarget: 5, orderIndex: 0 }],
        },
      ],
    })

    const assignment = await authRequest(
      environment.client.post(`/api/v1/plans/${plan.body._id}/assignments`),
      trainer.token,
    ).send({ traineeId: trainee.userId })

    expect(assignment.status).toBe(201)
    const active = await authRequest(environment.client.get("/api/v1/plans/active"), trainee.token)
    const trainerActive = await authRequest(
      environment.client.get(`/api/v1/trainer/trainees/${trainee.userId}/active-plan`),
      trainer.token,
    )
    expect(active.body._id).toBe(plan.body._id)
    expect(active.body.assignedByTrainer).toBe(true)
    expect(trainerActive.body._id).toBe(plan.body._id)
    const detached = await authRequest(
      environment.client.post(`/api/v1/trainer/trainees/${trainee.userId}/unlink`),
      trainer.token,
    ).send()
    expect(detached.body.msg).toBe("DETACHED")

    const resurrectDetached = await authRequest(
      environment.client.post(`/api/v1/trainee/relationships/${relationship.body.id}/accept`),
      trainee.token,
    ).send()
    expect(resurrectDetached.status).toBe(409)
  })

  it("keeps assigned trainee plan when trainer deletes the source template", async () => {
    const trainer = await register(
      "trainer-delete-template",
      "trainer-delete-template@example.com",
      ["TRAINER"],
    )
    const trainee = await register("trainee-delete-template", "trainee-delete-template@example.com")
    const relationship = await createRelationship(environment, trainer.token, trainee.email)
    await authRequest(
      environment.client.post(`/api/v1/trainee/relationships/${relationship.body.id}/accept`),
      trainee.token,
    ).send()

    const exercise = await createExercise(
      environment,
      trainer.token,
      "Template Deadlift",
      "HAMSTRINGS",
      "STRENGTH",
    )
    const plan = await authRequest(environment.client.post("/api/v1/plans"), trainer.token).send({
      name: "Template To Delete",
      days: [
        {
          name: "Posterior Chain",
          orderIndex: 0,
          exercises: [{ exerciseId: exercise.body._id, series: 4, repsTarget: 8, orderIndex: 0 }],
        },
      ],
    })
    await authRequest(
      environment.client.post(`/api/v1/plans/${plan.body._id}/assignments`),
      trainer.token,
    ).send({ traineeId: trainee.userId })

    const deleted = await authRequest(
      environment.client.delete(`/api/v1/plans/${plan.body._id}`),
      trainer.token,
    )
    const active = await authRequest(environment.client.get("/api/v1/plans/active"), trainee.token)
    const trainerPlans = await authRequest(environment.client.get("/api/v1/plans"), trainer.token)

    expect(deleted.body.msg).toBe("DELETED")
    expect(active.status).toBe(200)
    expect(active.body._id).not.toBe(plan.body._id)
    expect(active.body.name).toBe("Template To Delete")
    expect(active.body.days[0].name).toBe("Posterior Chain")
    expect(active.body.days[0].exercises[0]).toMatchObject({ series: 4, repsTarget: 8 })
    expect(trainerPlans.body.some((item: { _id: string }) => item._id === plan.body._id)).toBe(
      false,
    )
  })

  it("does not snapshot inactive plan assignments when trainer deletes a template", async () => {
    const trainer = await register(
      "trainer-delete-inactive",
      "trainer-delete-inactive@example.com",
      ["TRAINER"],
    )
    const trainee = await register("trainee-delete-inactive", "trainee-delete-inactive@example.com")
    const relationship = await createRelationship(environment, trainer.token, trainee.email)
    await authRequest(
      environment.client.post(`/api/v1/trainee/relationships/${relationship.body.id}/accept`),
      trainee.token,
    ).send()
    const exercise = await createExercise(
      environment,
      trainer.token,
      "Inactive Template Row",
      "BACK",
      "STANDARD",
    )
    const oldPlan = await createPlan(
      environment,
      trainer.token,
      "Inactive Template",
      exercise.body._id,
    )
    const currentPlan = await createPlan(
      environment,
      trainer.token,
      "Current Template",
      exercise.body._id,
    )

    await authRequest(
      environment.client.post(`/api/v1/plans/${oldPlan.body._id}/assignments`),
      trainer.token,
    ).send({ traineeId: trainee.userId })
    await authRequest(
      environment.client.post(`/api/v1/plans/${currentPlan.body._id}/assignments`),
      trainer.token,
    ).send({ traineeId: trainee.userId })
    await authRequest(environment.client.delete(`/api/v1/plans/${oldPlan.body._id}`), trainer.token)
    const traineePlans = await authRequest(environment.client.get("/api/v1/plans"), trainee.token)
    const active = await authRequest(environment.client.get("/api/v1/plans/active"), trainee.token)

    expect(
      traineePlans.body.some((item: { name: string }) => item.name === "Inactive Template"),
    ).toBe(false)
    expect(active.body._id).toBe(currentPlan.body._id)
  })

  it("allows trainee to start a workout from a trainer-assigned plan", async () => {
    const trainer = await register("trainer-workout-plan", "trainer-workout-plan@example.com", [
      "TRAINER",
    ])
    const trainee = await register("trainee-workout-plan", "trainee-workout-plan@example.com")
    const relationship = await createRelationship(environment, trainer.token, trainee.email)
    await authRequest(
      environment.client.post(`/api/v1/trainee/relationships/${relationship.body.id}/accept`),
      trainee.token,
    ).send()
    const exercise = await createExercise(
      environment,
      trainer.token,
      "Trainer Workout Row",
      "BACK",
      "STANDARD",
    )
    const plan = await createPlan(
      environment,
      trainer.token,
      "Trainer Workout Plan",
      exercise.body._id,
    )
    const gym = await authRequest(environment.client.post("/api/v1/gyms"), trainee.token).send({
      name: "Trainee Gym",
      address: "Address",
    })
    await authRequest(
      environment.client.post(`/api/v1/plans/${plan.body._id}/assignments`),
      trainer.token,
    ).send({ traineeId: trainee.userId })

    const workout = await authRequest(
      environment.client.post("/api/v1/workouts"),
      trainee.token,
    ).send({
      gymId: gym.body._id,
      planId: plan.body._id,
      planDayId: plan.body.days[0]._id,
      startedAt: new Date("2026-01-04T10:00:00.000Z").toISOString(),
      sets: [
        { exerciseId: exercise.body._id, series: 1, reps: null, weight: null, unit: "KILOGRAMS" },
      ],
    })

    expect(workout.status, JSON.stringify(workout.body)).toBe(201)
    expect(workout.body.planDay?._id ?? workout.body.planDay?.id).toBe(plan.body.days[0]._id)
  })

  it("allows trainers to invite trainees registered with mixed-case email", async () => {
    const trainer = await register("trainer-mixed-email", "trainer-mixed-email@example.com", [
      "TRAINER",
    ])
    const trainee = await register("trainee-mixed-email", "Trainee.Mixed.Email@Example.com")

    const relationship = await createRelationship(
      environment,
      trainer.token,
      "trainee.mixed.email@example.com",
    )

    expect(trainee.email).toBe("trainee.mixed.email@example.com")
    expect(relationship.status).toBe(201)
    expect(relationship.body.traineeId).toBe(trainee.userId)
  })

  it("does not allow rejected relationships to be accepted later", async () => {
    const trainer = await register("trainer-rejected", "trainer-rejected@example.com", ["TRAINER"])
    const trainee = await register("trainee-rejected", "trainee-rejected@example.com")
    const relationship = await createRelationship(environment, trainer.token, trainee.email)

    const rejected = await authRequest(
      environment.client.post(`/api/v1/trainee/relationships/${relationship.body.id}/reject`),
      trainee.token,
    ).send()
    const resurrectRejected = await authRequest(
      environment.client.post(`/api/v1/trainee/relationships/${relationship.body.id}/accept`),
      trainee.token,
    ).send()

    expect(rejected.status).toBe(200)
    expect(resurrectRejected.status).toBe(409)
  })

  it("blocks a trainer from assigning another trainer's plan", async () => {
    const owner = await register("trainer-owner", "trainer-owner@example.com", ["TRAINER"])
    const attacker = await register("trainer-attacker", "trainer-attacker@example.com", ["TRAINER"])
    const trainee = await register("trainee-foreign-plan", "trainee-foreign-plan@example.com")
    const relationship = await createRelationship(environment, attacker.token, trainee.email)
    await authRequest(
      environment.client.post(`/api/v1/trainee/relationships/${relationship.body.id}/accept`),
      trainee.token,
    ).send()

    const exercise = await createExercise(
      environment,
      owner.token,
      "Owner Squat",
      "QUADS",
      "STANDARD",
    )
    const plan = await authRequest(environment.client.post("/api/v1/plans"), owner.token).send({
      name: "Owner Plan",
      days: [
        {
          name: "Lower",
          orderIndex: 0,
          exercises: [{ exerciseId: exercise.body._id, series: 5, repsTarget: 5, orderIndex: 0 }],
        },
      ],
    })

    const blocked = await authRequest(
      environment.client.post(`/api/v1/plans/${plan.body._id}/assignments`),
      attacker.token,
    ).send({ traineeId: trainee.userId })

    expect(blocked.status).toBe(403)
  })

  it("rejects report submission when answer type does not match frozen template version", async () => {
    const trainer = await register("trainer-report", "trainer-report@example.com", ["TRAINER"])
    const trainee = await register("trainee-report", "trainee-report@example.com")
    const relationship = await createRelationship(environment, trainer.token, trainee.email)
    await authRequest(
      environment.client.post(`/api/v1/trainee/relationships/${relationship.body.id}/accept`),
      trainee.token,
    ).send()

    const template = await authRequest(
      environment.client.post("/api/v1/trainer/report-templates"),
      trainer.token,
    ).send({
      name: "Weekly Checkin",
      fields: [
        {
          key: "mood",
          label: "Mood",
          type: "SCALE",
          isRequired: true,
          order: 0,
          moduleConfig: { min: 1, max: 5 },
        },
      ],
    })
    const assignment = await authRequest(
      environment.client.post("/api/v1/trainer/report-assignments"),
      trainer.token,
    ).send({ traineeId: trainee.userId, templateId: template.body.id })

    const invalid = await authRequest(
      environment.client.post(
        `/api/v1/trainee/report-assignments/${assignment.body.id}/submissions`,
      ),
      trainee.token,
    ).send({ answers: { mood: "excellent" } })

    expect(invalid.status).toBe(400)
  })

  it("blocks a trainer from assigning another trainer's report template", async () => {
    const owner = await register("template-owner", "template-owner@example.com", ["TRAINER"])
    const attacker = await register("template-attacker", "template-attacker@example.com", [
      "TRAINER",
    ])
    const trainee = await register(
      "trainee-foreign-template",
      "trainee-foreign-template@example.com",
    )
    const relationship = await createRelationship(environment, attacker.token, trainee.email)
    await authRequest(
      environment.client.post(`/api/v1/trainee/relationships/${relationship.body.id}/accept`),
      trainee.token,
    ).send()
    const template = await createScaleTemplate(environment, owner.token, "Owner Checkin")

    const blocked = await authRequest(
      environment.client.post("/api/v1/trainer/report-assignments"),
      attacker.token,
    ).send({ traineeId: trainee.userId, templateId: template.body.id })

    expect(blocked.status).toBe(404)
  })

  it("allows only the owning trainer to add report feedback", async () => {
    const trainer = await register("feedback-owner", "feedback-owner@example.com", ["TRAINER"])
    const otherTrainer = await register("feedback-attacker", "feedback-attacker@example.com", [
      "TRAINER",
    ])
    const trainee = await register("feedback-trainee", "feedback-trainee@example.com")
    const relationship = await createRelationship(environment, trainer.token, trainee.email)
    await authRequest(
      environment.client.post(`/api/v1/trainee/relationships/${relationship.body.id}/accept`),
      trainee.token,
    ).send()

    const template = await createScaleTemplate(environment, trainer.token, "Feedback Checkin")
    const assignment = await authRequest(
      environment.client.post("/api/v1/trainer/report-assignments"),
      trainer.token,
    ).send({ traineeId: trainee.userId, templateId: template.body.id })
    const submission = await authRequest(
      environment.client.post(
        `/api/v1/trainee/report-assignments/${assignment.body.id}/submissions`,
      ),
      trainee.token,
    ).send({ answers: { mood: 4 } })

    const blocked = await authRequest(
      environment.client.patch(`/api/v1/trainer/report-submissions/${submission.body.id}/feedback`),
      otherTrainer.token,
    ).send({ trainerOverallComment: "nope", fieldComments: { mood: "bad" } })
    const allowed = await authRequest(
      environment.client.patch(`/api/v1/trainer/report-submissions/${submission.body.id}/feedback`),
      trainer.token,
    ).send({ trainerOverallComment: "good", fieldComments: { mood: "ok" } })

    expect(blocked.status).toBe(404)
    expect(allowed.status).toBe(200)
    expect(allowed.body.msg).toBe("FEEDBACK_SAVED")
  })

  it("supports report template list update delete and recurring lifecycle", async () => {
    const trainer = await register("report-crud", "report-crud@example.com", ["TRAINER"])
    const trainee = await register("report-crud-trainee", "report-crud-trainee@example.com")
    const relationship = await createRelationship(environment, trainer.token, trainee.email)
    await authRequest(
      environment.client.post(`/api/v1/trainee/relationships/${relationship.body.id}/accept`),
      trainee.token,
    ).send()

    const template = await authRequest(
      environment.client.post("/api/v1/trainer/report-templates"),
      trainer.token,
    ).send({
      name: "Crud Checkin",
      description: "Initial description",
      fields: [
        {
          key: "mood",
          label: "Mood",
          type: "SCALE",
          isRequired: true,
          order: 0,
          moduleConfig: { min: 1, max: 5 },
        },
      ],
    })
    const list = await authRequest(
      environment.client.get("/api/v1/trainer/report-templates"),
      trainer.token,
    )
    const renamed = await authRequest(
      environment.client.patch(`/api/v1/trainer/report-templates/${template.body.id}`),
      trainer.token,
    ).send({
      name: "Renamed Checkin",
    })
    const updated = await authRequest(
      environment.client.patch(`/api/v1/trainer/report-templates/${template.body.id}`),
      trainer.token,
    ).send({
      name: "Updated Checkin",
      fields: [{ key: "mood", label: "Mood", type: "SCALE", isRequired: true, order: 0 }],
    })
    const recurring = await authRequest(
      environment.client.post("/api/v1/trainer/recurring-report-rules"),
      trainer.token,
    ).send({
      traineeId: trainee.userId,
      templateId: template.body.id,
      intervalUnit: "WEEK",
      intervalValue: 1,
      startsAt: new Date("2026-01-01T00:00:00.000Z").toISOString(),
      endsAt: new Date("2026-12-31T00:00:00.000Z").toISOString(),
    })
    const assignment = await authRequest(
      environment.client.post("/api/v1/trainer/report-assignments"),
      trainer.token,
    ).send({ traineeId: trainee.userId, templateId: template.body.id })
    const submission = await authRequest(
      environment.client.post(
        `/api/v1/trainee/report-assignments/${assignment.body.id}/submissions`,
      ),
      trainee.token,
    ).send({ answers: { mood: 4 } })
    const recurringList = await authRequest(
      environment.client.get("/api/v1/trainer/recurring-report-rules"),
      trainer.token,
    )
    const pausedRule = await authRequest(
      environment.client.post(`/api/v1/trainer/recurring-report-rules/${recurring.body.id}/pause`),
      trainer.token,
    ).send()
    const resumedRule = await authRequest(
      environment.client.post(`/api/v1/trainer/recurring-report-rules/${recurring.body.id}/resume`),
      trainer.token,
    ).send()
    const afterResumeList = await authRequest(
      environment.client.get("/api/v1/trainer/recurring-report-rules"),
      trainer.token,
    )
    const deletedRule = await authRequest(
      environment.client.delete(`/api/v1/trainer/recurring-report-rules/${recurring.body.id}`),
      trainer.token,
    ).send()

    expect(list.body).toHaveLength(1)
    expect(renamed.body.description).toBe("Initial description")
    expect(updated.body.name).toBe("Updated Checkin")
    expect(assignment.status).toBe(201)
    expect(submission.status).toBe(201)
    expect(recurringList.body).toHaveLength(1)
    expect(pausedRule.body.msg).toBe("PAUSED")
    expect(resumedRule.body.msg).toBe("RESUMED")
    expect(afterResumeList.body[0].endsAt).toBe("2026-12-31T00:00:00.000Z")
    expect(afterResumeList.body[0].pausedAt).toBeNull()
    expect(deletedRule.body.msg).toBe("DELETED")
  })
})

const createExercise = async (
  environment: Parameters<Parameters<typeof describeAcceptance>[1]>[0],
  token: string,
  name: string,
  region: string,
  formula: string,
) => {
  const muscleGroup = await authRequest(
    environment.client.post("/api/v1/muscle-groups"),
    token,
  ).send({
    name: `${name} group`,
    region,
  })
  return authRequest(environment.client.post("/api/v1/exercises"), token).send({
    name,
    bodyPart: region,
    muscleGroupId: muscleGroup.body._id,
    formula,
  })
}

const createRelationship = async (
  environment: Parameters<Parameters<typeof describeAcceptance>[1]>[0],
  trainerToken: string,
  traineeEmail: string,
) =>
  authRequest(environment.client.post("/api/v1/trainer/relationships"), trainerToken).send({
    traineeEmail,
  })

const createPlan = async (
  environment: Parameters<Parameters<typeof describeAcceptance>[1]>[0],
  token: string,
  name: string,
  exerciseId: string,
) =>
  authRequest(environment.client.post("/api/v1/plans"), token).send({
    name,
    days: [
      {
        name: "Training Day",
        orderIndex: 0,
        exercises: [{ exerciseId, series: 3, repsTarget: 10, orderIndex: 0 }],
      },
    ],
  })

const createScaleTemplate = async (
  environment: Parameters<Parameters<typeof describeAcceptance>[1]>[0],
  trainerToken: string,
  name: string,
) =>
  authRequest(environment.client.post("/api/v1/trainer/report-templates"), trainerToken).send({
    name,
    fields: [
      {
        key: "mood",
        label: "Mood",
        type: "SCALE",
        isRequired: true,
        order: 0,
        moduleConfig: { min: 1, max: 5 },
      },
    ],
  })
