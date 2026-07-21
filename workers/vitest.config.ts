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
  ssr: {
    // Vitest runs test files through Vite's SSR module graph, which resolves
    // package `exports` using `ssr.resolve.conditions` — NOT the top-level
    // `resolve.conditions` above (that one only governs client/browser
    // resolution). Without this, `jose` falls back to its `node` condition
    // (node:https) even though `resolve.conditions` requests the
    // worker/browser build, and the JWKS fetch mock never intercepts the
    // real DNS lookup, so verification throws and the request 401s.
    resolve: {
      conditions: ['workerd', 'worker', 'browser'],
    },
  },
});
