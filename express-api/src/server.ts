import { createApp } from "./app"
import { env } from "./config/env"
import { prisma } from "./core/db/prisma"

const app = createApp(prisma)

app.listen(env.PORT, () => {
  process.stdout.write(`LiftContext Express API listening on ${env.PORT}\n`)
})
