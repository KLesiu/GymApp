# LiftContext

LiftContext is a three-part engineering demonstrator for strength training and remote coaching:

- `express-api` — Express + TypeScript + Prisma + PostgreSQL API.
- `mobile` — Expo React Native app for the trainee/athlete.
- `liftcontext-coach` — Vue 3 + Vite trainer panel.

## Local demo

Fast root commands:

```bash
npm run dev:all
```

This starts PostgreSQL, checks and applies pending Prisma migrations, ensures demo users plus global starter exercises exist, regenerates API clients, then starts `express-api`, `liftcontext-coach`, and `mobile`.

For a destructive fresh start:

```bash
npm run dev:reset
```

This removes the local PostgreSQL Docker volume, recreates the database from migrations, seeds demo users plus 50 global starter exercises, regenerates clients, then starts all three apps.

1. Start PostgreSQL and the API:

```bash
cd express-api
docker compose up -d db
npm ci
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

2. Start the coach panel:

```bash
cd liftcontext-coach
npm ci
npm run generate:api
npm run dev
```

3. Start mobile:

```bash
cd mobile
npm ci
npm run generate:api
npm start
```

Mobile API URL examples: Android Emulator `http://10.0.2.2:3000`, iOS Simulator `http://localhost:3000`, physical device `http://<LAN-IP>:3000`.

## Verification

Run in each module:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

The API acceptance tests run against a real PostgreSQL container started with Docker CLI.

## Core demo scenarios

- Trainee registers, creates gym/exercise/plan, finishes workouts, sees same-gym benchmark and LiftContext Rating changes.
- Trainer registers, invites trainee by email, assigns plans/reports, and sees authorized trainee data.
- Report templates use frozen versions so old assignments render their original fields after template edits.

## Implementation and thesis roadmap

See [ROADMAP.md](ROADMAP.md) for the phased completion plan, requirement mapping, module choices, and acceptance criteria. Track progress in [roadmap issue #33](https://github.com/KLesiu/GymApp/issues/33); record optional-module choices in [decision issue #2](https://github.com/KLesiu/GymApp/issues/2).
