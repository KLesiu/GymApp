import { spawn } from "node:child_process"
import { fileURLToPath } from "node:url"
import { performance } from "node:perf_hooks"

const apps = [
  { name: "Express API", directory: "express-api" },
  { name: "Coach panel", directory: "liftcontext-coach" },
  { name: "Mobile app", directory: "mobile" },
]

const isWindows = process.platform === "win32"

const runTest = (app) =>
  new Promise((resolve) => {
    const startedAt = performance.now()

    printSection(`Running tests: ${app.name}`)

    const command = isWindows ? "npm test" : "npm"
    const args = isWindows ? [] : ["test"]

    const child = spawn(command, args, {
      cwd: fileURLToPath(new URL(`../${app.directory}/`, import.meta.url)),
      stdio: "inherit",
      shell: isWindows,
      env: { ...process.env, CI: "true" },
    })

    child.on("error", (error) => {
      resolve({ app, status: "failed", durationMs: performance.now() - startedAt, error })
    })

    child.on("close", (code) => {
      resolve({
        app,
        status: code === 0 ? "passed" : "failed",
        code,
        durationMs: performance.now() - startedAt,
      })
    })
  })

const results = []

for (const app of apps) {
  results.push(await runTest(app))
}

printSection("Test summary")

for (const result of results) {
  const marker = result.status === "passed" ? "PASS" : "FAIL"
  const duration = `${(result.durationMs / 1000).toFixed(1)}s`
  const suffix = result.error ? ` - ${result.error.message}` : ""
  console.log(`${marker} ${result.app.name} (${duration})${suffix}`)
}

const failed = results.filter((result) => result.status !== "passed")
if (failed.length > 0) {
  process.exitCode = 1
}

function printSection(title) {
  const line = "=".repeat(title.length + 8)
  console.log(`\n${line}`)
  console.log(`=== ${title} ===`)
  console.log(`${line}\n`)
}
