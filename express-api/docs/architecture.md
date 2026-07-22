# Architecture

## Shape

This project is a modular monolith:

- `src/core`: env, auth, shared middleware, errors, OpenAPI
- `src/modules/*`: domain routers, services, repositories
- `prisma/`: schema, migration, seed
- `tests/`: acceptance tests backed by disposable PostgreSQL

## Request flow

1. Express route receives request.
2. Zod validates body/query/params.
3. Passport JWT authenticates actor.
4. Service enforces IDOR and trainer-relationship rules.
5. Repository executes real Prisma/PostgreSQL operations.
6. Central error middleware returns a uniform error envelope.

## Domain decisions

### Workout finalization

- Draft workout is created first.
- Finalization is transaction-wrapped.
- `IdempotencyKey` stores the final response payload.
- Elo history uses unique `(workoutSessionId, exerciseId)` so retries never double-count.

### Contextual benchmark

Benchmark queries filter by:

- `userId`
- `exerciseId`
- `gymId`
- `WorkoutSession.status = FINALIZED`
- `completedAt < current finalization timestamp`

That excludes the current draft and any unfinished sessions.

### Soft-deleted gyms

Gyms are soft-deleted because workout history, comparisons, and Elo records must preserve the original gym context even when a user removes the gym from active lists.

### Reports

- Templates create a frozen `ReportTemplateVersion` snapshot.
- Assignments bind to a specific template version.
- Submissions validate against that frozen version, not the latest template.

## Security posture

- JWT auth for every protected route
- role middleware for `TRAINEE` / `TRAINER`
- self-or-active-relationship checks for cross-user access
- no user-controlled Elo mutations
- no file upload, social auth, push, admin, payments, or background bus features
