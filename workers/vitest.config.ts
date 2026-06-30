import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
  },
  resolve: {
    // Resolve the same package builds the Cloudflare Worker uses at runtime
    // (the "workerd"/"worker" export conditions). This matters for `jose`:
    // its Node build fetches the JWKS via `node:https`, but the worker build
    // uses the global `fetch` — matching production AND letting tests mock the
    // network with `vi.stubGlobal('fetch', ...)` instead of hitting node:https.
    conditions: ['workerd', 'worker', 'browser'],
  },
});
