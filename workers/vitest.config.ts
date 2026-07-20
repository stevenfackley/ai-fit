import { defineConfig } from 'vitest/config';

// Resolve the same package builds the Cloudflare Worker uses at runtime
// (the "workerd"/"worker" export conditions). This matters for `jose`:
// its Node build fetches the JWKS via `node:https`, but the worker build
// uses the global `fetch` — matching production AND letting tests mock the
// network with `vi.stubGlobal('fetch', ...)` instead of hitting node:https.
// Vitest 3 resolves externalized deps with Node's own conditions, so `jose`
// must be inlined and the conditions repeated for the SSR resolver.
const workerConditions = ['workerd', 'worker', 'browser'];

export default defineConfig({
  test: {
    environment: 'node',
    server: {
      deps: {
        inline: ['jose'],
      },
    },
  },
  resolve: {
    conditions: workerConditions,
  },
  ssr: {
    resolve: {
      conditions: workerConditions,
    },
  },
});
