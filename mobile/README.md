# LiftContext Mobile

Expo Router mobile app for the local ExpressJS gym API. LiftContext focuses on strength training records, same-gym benchmarking, and coach collaboration.

## Local setup

```bash
npm ci
npm run generate:api
npm start
```

Set `EXPO_PUBLIC_API_URL` in `.env`:

- iOS Simulator: `http://localhost:3000`
- Android Emulator: `http://10.0.2.2:3000`
- Physical device: `http://<your-lan-ip>:3000`

Start the backend from `../express-api` first and expose `/openapi.json` on port 3000. The generated OpenAPI files are written to `src/api/generated`.

## Brand assets

The source icon is `assets/brand/liftcontext-icon.svg`. Generate the PNG exports directly from SVG:

```bash
npx sharp-cli -i assets/brand/liftcontext-icon.svg -o assets/brand/icon.png resize 1024 1024
npx sharp-cli -i assets/brand/liftcontext-icon.svg -o assets/brand/adaptive-icon.png resize 1024 1024
npx sharp-cli -i assets/brand/liftcontext-icon.svg -o assets/brand/splash-icon.png resize 512 512
npx sharp-cli -i assets/brand/liftcontext-icon.svg -o assets/brand/favicon.png resize 48 48
```

## Verification

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm run generate:api
npx expo-doctor
npx expo export --platform android
npx expo export --platform ios
```

Smoke with the real API:

```bash
npm run smoke:e2e
```

## EAS

No production EAS Project ID, store credentials, Firebase config, or OTA URL is configured. If EAS is needed later, run `eas init` after the final app identifiers are approved.
