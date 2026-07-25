import { expect, it } from "vitest"

import { authRequest, describeAcceptance } from "./helpers/acceptance-context"

describeAcceptance("workout ranking acceptance", (environment, register) => {
  it("uses same-gym benchmark and ignores newer different-gym scores", async () => {
    const user = await register("bench-user", "bench-user@example.com")
    const exercise = await createExercise(
      environment,
      user.token,
      "Bench Press",
      "CHEST",
      "STANDARD",
    )
    const gymA = await authRequest(environment.client.post("/api/v1/gyms"), user.token).send({
      name: "Gym A",
      address: "A",
    })
    const gymB = await authRequest(environment.client.post("/api/v1/gyms"), user.token).send({
      name: "Gym B",
      address: "B",
    })

    await finalizeWorkout(environment, user.token, gymA.body._id, exercise.body._id, 80, "bench-a1")
    await finalizeWorkout(
      environment,
      user.token,
      gymB.body._id,
      exercise.body._id,
      120,
      "bench-b1",
    )
    const workoutA2 = await authRequest(
      environment.client.post("/api/v1/workouts"),
      user.token,
    ).send({
      gymId: gymA.body._id,
      startedAt: new Date("2026-01-03T10:00:00.000Z").toISOString(),
      sets: [
        { exerciseId: exercise.body._id, series: 1, reps: 9, weight: 82.5, unit: "KILOGRAMS" },
      ],
    })
    const finalize = await authRequest(
      environment.client.post(`/api/v1/workouts/${workoutA2.body.id}/finalize`),
      user.token,
    )
      .set("Idempotency-Key", "bench-a2")
      .send()

    expect(finalize.status).toBe(200)
    expect(finalize.body.comparison[0].seriesComparisons[0].previousResult.weight).toBe(80)
  })

  it("keeps workout finalization idempotent and does not double count Elo history", async () => {
    const user = await register("elo-user", "elo-user@example.com")
    const exercise = await createExercise(environment, user.token, "Curl", "BICEPS", "VOLUME")
    const gym = await authRequest(environment.client.post("/api/v1/gyms"), user.token).send({
      name: "Gym",
      address: "Address",
    })

    await finalizeWorkout(environment, user.token, gym.body._id, exercise.body._id, 20, "elo-base")
    const workout = await authRequest(environment.client.post("/api/v1/workouts"), user.token).send(
      {
        gymId: gym.body._id,
        startedAt: new Date("2026-01-02T10:00:00.000Z").toISOString(),
        sets: [
          { exerciseId: exercise.body._id, series: 1, reps: 12, weight: 22, unit: "KILOGRAMS" },
        ],
      },
    )

    const first = await authRequest(
      environment.client.post(`/api/v1/workouts/${workout.body.id}/finalize`),
      user.token,
    )
      .set("Idempotency-Key", "elo-repeat")
      .send()
    const second = await authRequest(
      environment.client.post(`/api/v1/workouts/${workout.body.id}/finalize`),
      user.token,
    )
      .set("Idempotency-Key", "elo-repeat")
      .send()

    expect(second.body.gainElo).toBe(first.body.gainElo)
    const history = await environment.db.eloHistory.findMany({
      where: { workoutSessionId: workout.body.id },
    })
    expect(history).toHaveLength(1)
  })

  it("finalizes the submitted set form instead of stale draft sets", async () => {
    const user = await register("form-source-user", "form-source-user@example.com")
    const exercise = await createExercise(
      environment,
      user.token,
      "Form Bench",
      "CHEST",
      "STANDARD",
    )
    const gym = await authRequest(environment.client.post("/api/v1/gyms"), user.token).send({
      name: "Form Gym",
      address: "Address",
    })
    const workout = await authRequest(environment.client.post("/api/v1/workouts"), user.token).send(
      {
        gymId: gym.body._id,
        startedAt: new Date("2026-01-04T10:00:00.000Z").toISOString(),
        sets: [
          { exerciseId: exercise.body._id, series: 1, reps: 10, weight: 100, unit: "KILOGRAMS" },
          { exerciseId: exercise.body._id, series: 2, reps: 12, weight: 120, unit: "KILOGRAMS" },
          { exerciseId: exercise.body._id, series: 3, reps: 10, weight: 0, unit: "KILOGRAMS" },
        ],
      },
    )

    const finalize = await authRequest(
      environment.client.post(`/api/v1/workouts/${workout.body.id}/finalize`),
      user.token,
    )
      .set("Idempotency-Key", "form-source-finalize")
      .send({
        sets: [
          {
            id: workout.body.exercises[0].id,
            exerciseId: exercise.body._id,
            series: 1,
            reps: 10,
            weight: 100,
            unit: "KILOGRAMS",
          },
          {
            id: workout.body.exercises[1].id,
            exerciseId: exercise.body._id,
            series: 2,
            reps: 12,
            weight: 120,
            unit: "KILOGRAMS",
          },
        ],
      })
    const history = await authRequest(environment.client.get("/api/v1/workouts"), user.token)

    expect(finalize.status).toBe(200)
    expect(history.body[0].exercises).toHaveLength(2)
    expect(history.body[0].exercises.map((set: { series: number }) => set.series)).toEqual([1, 2])
  })

  it("paginates ranking", async () => {
    await register("rank-1", "rank-1@example.com")
    await register("rank-2", "rank-2@example.com")
    await register("rank-3", "rank-3@example.com")
    const auth = await register("rank-auth", "rank-auth@example.com")

    const response = await authRequest(
      environment.client.get("/api/v1/ranking?page=1&pageSize=2"),
      auth.token,
    )
    expect(response.status).toBe(200)
    expect(response.body.items).toHaveLength(2)
    expect(response.body.total).toBeGreaterThanOrEqual(4)
  })

  it("exposes finalized workout history dates details and Elo chart", async () => {
    const user = await register("history-user", "history-user@example.com")
    const exercise = await createExercise(
      environment,
      user.token,
      "History Bench",
      "CHEST",
      "STANDARD",
    )
    const gym = await authRequest(environment.client.post("/api/v1/gyms"), user.token).send({
      name: "History Gym",
      address: "History",
    })

    await finalizeWorkout(
      environment,
      user.token,
      gym.body._id,
      exercise.body._id,
      80,
      "history-base",
    )
    await finalizeWorkout(
      environment,
      user.token,
      gym.body._id,
      exercise.body._id,
      90,
      "history-next",
    )

    const history = await authRequest(environment.client.get("/api/v1/workouts"), user.token)
    const dates = await authRequest(environment.client.get("/api/v1/workouts/dates"), user.token)
    const detail = await authRequest(
      environment.client.get(`/api/v1/workouts/${history.body[0].id}`),
      user.token,
    )
    const chart = await authRequest(environment.client.get("/api/v1/elo/chart"), user.token)

    expect(history.body).toHaveLength(2)
    expect(dates.body).toHaveLength(2)
    expect(detail.body.exercises[0].exerciseName).toBe("History Bench")
    expect(chart.body.length).toBeGreaterThanOrEqual(1)
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

const finalizeWorkout = async (
  environment: Parameters<Parameters<typeof describeAcceptance>[1]>[0],
  token: string,
  gymId: string,
  exerciseId: string,
  weight: number,
  key: string,
) => {
  const workout = await authRequest(environment.client.post("/api/v1/workouts"), token).send({
    gymId,
    startedAt: new Date("2026-01-01T10:00:00.000Z").toISOString(),
    sets: [{ exerciseId, series: 1, reps: 8, weight, unit: "KILOGRAMS" }],
  })

  await authRequest(environment.client.post(`/api/v1/workouts/${workout.body.id}/finalize`), token)
    .set("Idempotency-Key", key)
    .send()
}
