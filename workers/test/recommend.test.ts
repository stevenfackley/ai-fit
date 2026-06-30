import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import app from '../src/index';
import {
  TEST_JWKS_URL,
  TEST_SUPABASE_URL,
  makeTestKeys,
  mintToken,
  tamperSignature,
} from './helpers';

// Worker env (bindings) injected via app.request's 3rd argument.
const env = {
  OPENAI_API_KEY: 'test-openai-key',
  SUPABASE_URL: TEST_SUPABASE_URL,
};

const validBody = {
  projectDescription: 'A SaaS that summarises support tickets',
  useCases: ['chat'],
  estimatedRequestsPerMonth: 1000,
  averageTokensPerRequest: 1200,
};

function urlOf(input: unknown): string {
  if (typeof input === 'string') return input;
  if (input instanceof URL) return input.href;
  if (input && typeof (input as Request).url === 'string') return (input as Request).url;
  return String(input);
}

let keys: Awaited<ReturnType<typeof makeTestKeys>>;
let openaiCalls: string[];

// One keypair for the whole file: createRemoteJWKSet caches per URL, so the
// served JWKS must stay stable across requests.
beforeAll(async () => {
  keys = await makeTestKeys();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

afterAll(() => {
  vi.restoreAllMocks();
});

function stubFetch() {
  openaiCalls = [];
  const fetchMock = vi.fn(async (input: unknown, init?: RequestInit) => {
    const url = urlOf(input);
    if (url === TEST_JWKS_URL) {
      return new Response(JSON.stringify(keys.jwks), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }
    if (url.startsWith('https://api.openai.com/')) {
      openaiCalls.push(String(init?.body ?? ''));
      return new Response(
        JSON.stringify({ choices: [{ message: { content: '// mocked snippet' } }] }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      );
    }
    throw new Error(`unexpected live network call in test: ${url}`);
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

function post(token: string | undefined, body: unknown = validBody) {
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (token !== undefined) headers.Authorization = `Bearer ${token}`;
  return app.request('/recommend', { method: 'POST', headers, body: JSON.stringify(body) }, env);
}

describe('POST /recommend auth gate (ES256)', () => {
  it('200s for a valid ES256 token and returns recommendations + gpt-4o-mini snippet', async () => {
    stubFetch();
    const token = await mintToken(keys.privateKey);

    const res = await post(token);
    expect(res.status).toBe(200);

    const json = (await res.json()) as any;
    expect(Array.isArray(json.recommendations)).toBe(true);
    expect(json.recommendations.length).toBeGreaterThan(0);
    expect(json.recommendations[0].snippet).toBe('// mocked snippet');
    // the downstream model really is gpt-4o-mini
    expect(openaiCalls.some((b) => b.includes('gpt-4o-mini'))).toBe(true);
  });

  it('401s when the Authorization header is missing', async () => {
    stubFetch();
    const res = await post(undefined);
    expect(res.status).toBe(401);
  });

  it('401s for a garbage (non-JWT) bearer without touching the network', async () => {
    stubFetch();
    const res = await post('not-a-jwt');
    expect(res.status).toBe(401);
  });

  it('401s for a tampered signature', async () => {
    stubFetch();
    const token = tamperSignature(await mintToken(keys.privateKey));
    const res = await post(token);
    expect(res.status).toBe(401);
  });

  it('401s for an expired token', async () => {
    stubFetch();
    const expired = await mintToken(keys.privateKey, {
      expEpochSeconds: Math.floor(Date.now() / 1000) - 60,
    });
    const res = await post(expired);
    expect(res.status).toBe(401);
  });

  it('401s for a wrong-audience token', async () => {
    stubFetch();
    const token = await mintToken(keys.privateKey, { audience: 'anon' });
    const res = await post(token);
    expect(res.status).toBe(401);
  });
});
