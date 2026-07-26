import { expect, it } from "vitest"

import { authRequest, describeAcceptance } from "./helpers/acceptance-context"

describeAcceptance("auth gym measurement acceptance", (environment, register) => {
  it("rejects invalid JWT", async () => {
    const response = await environment.client
      .get("/api/v1/auth/me")
      .set("Authorization", "Bearer invalid")

    expect(response.status).toBe(401)
  })

  it("forces public registration to create a trainee even when role is supplied", async () => {
    const response = await environment.client.post("/api/v1/auth/register").send({
      name: "role-escalation",
      email: "role-escalation@example.com",
      password: "password123",
      cpassword: "password123",
      isVisibleInRanking: true,
      roles: ["TRAINER"],
    })

    expect(response.status).toBe(201)
    expect(response.body.req.roles).toEqual(["TRAINEE"])
  })

  it("blocks trainee tokens from trainer-only actions", async () => {
    const trainee = await register("trainer-action-trainee", "trainer-action-trainee@example.com")
    const target = await register("trainer-action-target", "trainer-action-target@example.com")

    const relationship = await authRequest(
      environment.client.post("/api/v1/trainer/relationships"),
      trainee.token,
    ).send({ traineeCode: target.connectionCode })
    const template = await authRequest(
      environment.client.post("/api/v1/trainer/report-templates"),
      trainee.token,
    ).send({
      name: "Forbidden Template",
      fields: [{ key: "mood", label: "Mood", type: "SCALE", isRequired: true, order: 0 }],
    })

    expect(relationship.status).toBe(403)
    expect(template.status).toBe(403)
  })

  it("limits direct user Elo lookup to self or active trainer relationship", async () => {
    const actor = await register("elo-actor", "elo-actor@example.com")
    const target = await register("elo-target", "elo-target@example.com")

    const self = await authRequest(
      environment.client.get(`/api/v1/users/${actor.userId}/elo`),
      actor.token,
    )
    const blocked = await authRequest(
      environment.client.get(`/api/v1/users/${target.userId}/elo`),
      actor.token,
    )

    expect(self.status).toBe(200)
    expect(blocked.status).toBe(403)
  })

  it("supports gym CRUD", async () => {
    const user = await register("gym-user", "gym-user@example.com")
    const create = await authRequest(environment.client.post("/api/v1/gyms"), user.token).send({
      name: "Main Gym",
      address: "Street 1",
    })
    expect(create.status).toBe(201)

    const list = await authRequest(environment.client.get("/api/v1/gyms"), user.token)
    expect(list.body).toHaveLength(1)

    const gymId = create.body._id
    const update = await authRequest(
      environment.client.patch(`/api/v1/gyms/${gymId}`),
      user.token,
    ).send({ name: "Main Gym 2", address: "Street 2" })
    expect(update.body.name).toBe("Main Gym 2")

    const remove = await authRequest(environment.client.delete(`/api/v1/gyms/${gymId}`), user.token)
    expect(remove.body.msg).toBe("DELETED")
  })

  it("returns body measurement trends", async () => {
    const user = await register("measure-user", "measure-user@example.com")
    await authRequest(environment.client.post("/api/v1/measurements"), user.token).send({
      bodyPart: "WAIST",
      unit: "CM",
      value: 90,
      takenAt: new Date("2026-01-01T00:00:00.000Z").toISOString(),
    })
    await authRequest(environment.client.post("/api/v1/measurements"), user.token).send({
      bodyPart: "WAIST",
      unit: "CM",
      value: 88,
      takenAt: new Date("2026-01-02T00:00:00.000Z").toISOString(),
    })

    const response = await authRequest(
      environment.client.get("/api/v1/measurements/trends"),
      user.token,
    )
    expect(response.body[0].delta).toBe(-2)
  })

  it("returns measurement list history and detail", async () => {
    const user = await register("measure-detail-user", "measure-detail-user@example.com")
    await authRequest(environment.client.post("/api/v1/measurements"), user.token).send({
      bodyPart: "CHEST",
      unit: "CM",
      value: 100,
      takenAt: new Date("2026-01-01T00:00:00.000Z").toISOString(),
    })

    const list = await authRequest(environment.client.get("/api/v1/measurements"), user.token)
    const history = await authRequest(
      environment.client.get("/api/v1/measurements/history"),
      user.token,
    )
    const detail = await authRequest(
      environment.client.get(`/api/v1/measurements/${list.body[0]._id}`),
      user.token,
    )

    expect(list.body).toHaveLength(1)
    expect(history.body.measurements).toHaveLength(1)
    expect(detail.body.bodyPart).toBe("CHEST")
  })
})
