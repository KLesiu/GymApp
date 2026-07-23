# Brand readiness checklist

- New name and identifiers: `LiftContext`, `liftcontext-mobile`, `pl.jakubleskiewicz.liftcontext`, `liftcontext` URL scheme.
- New icons and splash: source SVG and PNG exports live in `assets/brand/`.
- New palette and typography: canvas, ink, context teal, and reference yellow tokens in `src/theme/`.
- New navigation: Expo Router route groups and tabs: Today, Workout, Progress, Coach, More.
- New components: primitive system in `src/components/primitives.tsx`.
- New PL/EN copy: written in `src/i18n/index.ts` for this app.
- No old EAS/Firebase config: no EAS project ID, Firebase, SignalR, push, Google auth, photo upload, or store credentials are configured.
- Forbidden-name audit must be clean before publishing.
