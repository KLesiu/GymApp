# Mobile architecture

LiftContext is a fresh Expo Router app under `mobile/`, separated from the Express API under `express-api/`.

- `app/` contains auth, app tabs, and domain screens.
- `src/theme/tokens.ts` is the semantic design-system source.
- `src/components/primitives.tsx` defines Screen, Text, Button, IconButton, TextField, Card, Sheet, Dialog, EmptyState, ErrorState, Skeleton, Metric, and ChartCard.
- `src/api/generated` is generated from the local Express OpenAPI contract and must not be edited manually.
- `src/api/client.ts` handles base URL resolution, bearer auth, `Accept-Language`, timeout, cancellation, 401 session clearing, and 403 preservation.
- React Query owns server state. Zustand stores only session and language preference.
- Workout finalization sends a stable `Idempotency-Key` based on the operation id.
