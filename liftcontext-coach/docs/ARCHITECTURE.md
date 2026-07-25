# Architecture

LiftContext Coach is a Vue 3/Vite SPA using Composition API, TypeScript strict mode, Pinia for session state, and TanStack Vue Query for server state.

Generated API files live under `src/api/generated` and are not edited manually. Application code talks to the backend through `src/api/http`, `src/api/queries`, and `src/api/adapters` so DTO details do not leak into UI components.

Protected trainee cache keys include `traineeId`. Logout clears local token storage and the Vue Query cache.

The UI is English-only and uses the LiftContext design tokens from `DESIGN.MD`.
