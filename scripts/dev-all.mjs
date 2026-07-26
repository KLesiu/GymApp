import { spawn, spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const apiDir = resolve(root, 'express-api')
const coachDir = resolve(root, 'liftcontext-coach')
const mobileDir = resolve(root, 'mobile')
const npmCli = process.env.npm_execpath
const npm = npmCli ? process.execPath : process.platform === 'win32' ? 'npm.cmd' : 'npm'
const hostDatabaseUrl = 'postgresql://postgres:postgres@localhost:5432/liftcontext?schema=public'
const shell = !npmCli && process.platform === 'win32'

const npmArgs = (args) => (npmCli ? [npmCli, ...args] : args)

const run = (command, args, cwd, env = {}) => {
  const result = spawnSync(command, args, { cwd, env: { ...process.env, ...env }, stdio: 'inherit', shell })
  if (result.status !== 0) process.exit(result.status ?? 1)
}

const runInfo = (command, args, cwd, env = {}) => {
  spawnSync(command, args, { cwd, env: { ...process.env, ...env }, stdio: 'inherit', shell })
}

const tryRun = (command, args, cwd) => {
  spawnSync(command, args, { cwd, stdio: 'ignore', shell })
}

const ensureInstall = (cwd, requiredPackage) => {
  if (!existsSync(resolve(cwd, 'node_modules')) || !existsSync(resolve(cwd, 'node_modules', requiredPackage))) {
    run(npm, npmArgs(['ci']), cwd)
  }
}

const waitForDb = () => {
  for (let attempt = 1; attempt <= 20; attempt += 1) {
    const result = spawnSync('docker', ['compose', 'exec', '-T', 'db', 'pg_isready', '-U', 'postgres', '-d', 'liftcontext'], { cwd: apiDir, stdio: 'ignore' })
    if (result.status === 0) return
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1000)
  }
  throw new Error('PostgreSQL did not become ready in time')
}

const children = []
const start = (name, command, args, cwd, env = {}) => {
  const child = spawn(command, args, { cwd, env: { ...process.env, ...env }, stdio: 'inherit', shell })
  children.push(child)
  child.on('exit', (code) => {
    if (code && code !== 0) console.error(`${name} exited with code ${code}`)
  })
}

process.on('SIGINT', () => {
  for (const child of children) child.kill('SIGINT')
  process.exit(0)
})

console.log('Starting LiftContext dependencies...')
run('docker', ['compose', 'up', '-d', 'db'], apiDir)
tryRun('docker', ['compose', 'stop', 'api'], apiDir)
waitForDb()

console.log('Installing dependencies when node_modules is missing...')
ensureInstall(apiDir, 'tsx')
ensureInstall(coachDir, 'vite')
ensureInstall(mobileDir, 'expo')

console.log('Checking Prisma migrations...')
runInfo(npm, npmArgs(['exec', '--', 'prisma', 'migrate', 'status']), apiDir, { DATABASE_URL: hostDatabaseUrl })
console.log('Applying pending migrations, if any...')
run(npm, npmArgs(['run', 'prisma:migrate']), apiDir, { DATABASE_URL: hostDatabaseUrl })
run(npm, npmArgs(['run', 'prisma:generate']), apiDir, { DATABASE_URL: hostDatabaseUrl })

console.log('Regenerating API clients...')
run(npm, npmArgs(['run', 'generate:api']), coachDir)

console.log('Starting API, coach panel, and mobile app...')
start('express-api', npm, npmArgs(['run', 'dev']), apiDir, { DATABASE_URL: hostDatabaseUrl })
start('liftcontext-coach', npm, npmArgs(['run', 'dev']), coachDir)
start('mobile', npm, npmArgs(['start']), mobileDir)
