# Security

- The API is the authorization boundary. Route guards are only UX.
- The panel is restricted to `TRAINER`; `/api/v1/auth/me` is called after login and restore.
- Bearer token storage is isolated in `src/api/http/tokenStorage.ts` under `liftcontext.coach.session`.
- Token storage in `localStorage` is convenient for this academic SPA but vulnerable to XSS; the app avoids `v-html` and does not log tokens or health data.
- 401 clears the local session. Logout clears Vue Query cache.
- Trainee data query keys include `traineeId`.
- `nginx.conf` defines baseline SPA security headers and CSP.
