import { defineConfig } from 'orval'

export default defineConfig({
  liftContextCoachApi: {
    input: { target: process.env.ORVAL_OPENAPI_URL ?? '../mobile/src/api/generated/openapi.json' },
    output: {
      mode: 'split',
      target: 'src/api/generated/client.ts',
      schemas: 'src/api/generated/model',
      client: 'vue-query',
      httpClient: 'fetch',
      prettier: true,
      override: { mutator: { path: 'src/api/http/orvalMutator.ts', name: 'orvalMutator' } },
    },
  },
})
