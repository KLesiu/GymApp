# LiftContext Coach

LiftContext Coach is the Vue 3 trainer panel for the LiftContext ecosystem. It complements the existing Express API and Mobile app by giving coaches a desktop-first workspace for trainees, strength profiles, plans, reports, exercises, and relationship management.

Author: Jakub Leśkiewicz, student number 52733.

Thesis topic: Design and implementation of a multi-platform training recording and remote coaching ecosystem using gamification mechanisms.

## Requirements

- Node.js 22+
- npm 10+
- Running LiftContext API exposing `/openapi.json`

## Setup

```bash
npm ci
npm run generate:api
npm run dev
```

Environment variables:

```bash
VITE_API_BASE_URL=http://localhost:3000
ORVAL_OPENAPI_URL=http://localhost:3000/openapi.json
```

## Verification

```bash
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
npm run audit:legacy
```

The app is English-only and has no runtime localization mechanism.
