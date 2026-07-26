# LiftContext Express API

LiftContext API built with Express, TypeScript, Prisma, PostgreSQL, Passport JWT, Zod, Swagger, Docker, and Vitest/Supertest.

## Included domains

- auth/users
- gyms
- workout sessions/sets/history/contextual benchmark
- body measurements/trends
- custom muscle groups/exercises/plans
- trainer-trainee relationship invitations by trainee email
- report templates/assignments/submissions/feedback/recurrence
- LiftContext Rating history/ranking inspired by Elo

## Tech stack

- Express 4
- TypeScript strict
- Prisma ORM
- PostgreSQL 16+
- Passport JWT + `jsonwebtoken`
- `argon2`
- Zod
- Swagger UI
- Vitest + Supertest against a real PostgreSQL container started through Docker CLI

## Quick start

1. Copy `.env.example` to `.env`.
2. Start PostgreSQL:

```bash
docker compose up -d db
```

3. Install and migrate:

```bash
npm install
npm run prisma:generate
npx prisma migrate deploy
```

4. Seed:

```bash
npm run prisma:seed
```

5. Run:

```bash
npm run build
npm start
```

Swagger UI: `http://localhost:3000/docs`

## Scripts

- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`
- `npm run prisma:generate`
- `npm run prisma:migrate`
- `npm run prisma:seed`
- `npm run prisma:studio`

## Notes

- Gyms use soft delete so historical workouts and Elo comparisons keep their original gym context.
- Workout finalization requires an `Idempotency-Key` header.

## Documentation

- `docs/architecture.md`
- `docs/api-reference.md`
