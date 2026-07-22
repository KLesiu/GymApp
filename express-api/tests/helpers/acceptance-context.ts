import { afterAll, beforeAll, beforeEach, describe } from "vitest"

import { TestEnvironment } from "./test-environment"

export type AuthenticatedUser = {
  readonly token: string
  readonly userId: string
}

export const authRequest = <T extends { set(name: string, value: string): T }>(
  requestBuilder: T,
  token: string,
) => requestBuilder.set("Authorization", `Bearer ${token}`)

export const describeAcceptance = (
  title: string,
  suite: (environment: TestEnvironment, register: RegisterUser) => void,
) => {
  const environment = new TestEnvironment()
  const register: RegisterUser = async (name, email, roles = ["TRAINEE"]) => {
    const path = roles.includes("TRAINER")
      ? "/api/v1/auth/trainer/register"
      : "/api/v1/auth/register"
    const response = await environment.client.post(path).send({
      name,
      email,
      password: "password123",
      cpassword: "password123",
      isVisibleInRanking: true,
    })

    return {
      token: response.body.token,
      userId: response.body.req._id,
    }
  }

  describe(title, () => {
    beforeAll(async () => {
      await environment.start()
    }, 120000)

    afterAll(async () => {
      await environment.stop()
    }, 120000)

    beforeEach(async () => {
      await environment.reset()
    }, 120000)

    suite(environment, register)
  })
}

type RegisterUser = (
  name: string,
  email: string,
  roles?: readonly string[],
) => Promise<AuthenticatedUser>
