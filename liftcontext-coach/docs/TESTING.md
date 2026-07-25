# Testing

Unit and component tests use Vitest and Vue Test Utils. Integration-oriented tests use deterministic fetch mocks. E2E smoke tests use Playwright.

Run:

```bash
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
```

The deterministic tests do not use public production data.
