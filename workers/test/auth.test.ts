import { describe, expect, it } from 'vitest';
import { SignJWT } from 'jose';
import { supabaseJwtConfigFromEnv, verifySupabaseJwt } from '../src/auth';
import {
  TEST_AUDIENCE,
  TEST_ISSUER,
  TEST_JWKS_URL,
  TEST_SUPABASE_URL,
  makeTestKeys,
  mintToken,
  tamperSignature,
} from './helpers';

const config = {
  jwksUrl: TEST_JWKS_URL,
  issuer: TEST_ISSUER,
  audience: TEST_AUDIENCE,
};

describe('supabaseJwtConfigFromEnv', () => {
  it('derives jwks/issuer/audience from SUPABASE_URL', () => {
    expect(supabaseJwtConfigFromEnv({ SUPABASE_URL: TEST_SUPABASE_URL })).toEqual({
      jwksUrl: TEST_JWKS_URL,
      issuer: TEST_ISSUER,
      audience: 'authenticated',
    });
  });

  it('tolerates a trailing slash on SUPABASE_URL', () => {
    expect(supabaseJwtConfigFromEnv({ SUPABASE_URL: `${TEST_SUPABASE_URL}/` }).jwksUrl).toBe(TEST_JWKS_URL);
  });

  it('honours explicit overrides', () => {
    const cfg = supabaseJwtConfigFromEnv({
      SUPABASE_URL: TEST_SUPABASE_URL,
      SUPABASE_JWKS_URL: 'https://other.example/jwks.json',
      SUPABASE_JWT_ISSUER: 'https://other.example',
      SUPABASE_JWT_AUDIENCE: 'svc',
    });
    expect(cfg).toEqual({
      jwksUrl: 'https://other.example/jwks.json',
      issuer: 'https://other.example',
      audience: 'svc',
    });
  });

  it('throws (fail closed) when nothing is configured', () => {
    expect(() => supabaseJwtConfigFromEnv({})).toThrow(/not configured/i);
  });
});

describe('verifySupabaseJwt (ES256 via JWKS)', () => {
  it('accepts a valid ES256 token and returns its claims', async () => {
    const { privateKey, localKeySet } = await makeTestKeys();
    const token = await mintToken(privateKey, { subject: 'user-abc' });

    const payload = await verifySupabaseJwt(token, config, localKeySet);

    expect(payload.sub).toBe('user-abc');
    expect(payload.iss).toBe(TEST_ISSUER);
    expect(payload.aud).toBe('authenticated');
  });

  it('rejects a tampered signature', async () => {
    const { privateKey, localKeySet } = await makeTestKeys();
    const token = tamperSignature(await mintToken(privateKey));

    await expect(verifySupabaseJwt(token, config, localKeySet)).rejects.toThrow();
  });

  it('rejects an expired token', async () => {
    const { privateKey, localKeySet } = await makeTestKeys();
    const expired = await mintToken(privateKey, {
      expEpochSeconds: Math.floor(Date.now() / 1000) - 60,
    });

    await expect(verifySupabaseJwt(expired, config, localKeySet)).rejects.toThrow();
  });

  it('rejects a token from the wrong issuer', async () => {
    const { privateKey, localKeySet } = await makeTestKeys();
    const token = await mintToken(privateKey, { issuer: 'https://evil.example/auth/v1' });

    await expect(verifySupabaseJwt(token, config, localKeySet)).rejects.toThrow();
  });

  it('rejects a token with the wrong audience', async () => {
    const { privateKey, localKeySet } = await makeTestKeys();
    const token = await mintToken(privateKey, { audience: 'anon' });

    await expect(verifySupabaseJwt(token, config, localKeySet)).rejects.toThrow();
  });

  it('rejects a token signed by a different key', async () => {
    const signer = await makeTestKeys();
    const verifier = await makeTestKeys();
    const token = await mintToken(signer.privateKey); // shares the kid, different key material

    await expect(verifySupabaseJwt(token, config, verifier.localKeySet)).rejects.toThrow();
  });

  it('rejects an alg-confusion (HS256) token even with a matching kid', async () => {
    const { localKeySet } = await makeTestKeys();
    const now = Math.floor(Date.now() / 1000);
    const hsToken = await new SignJWT({ role: 'authenticated' })
      .setProtectedHeader({ alg: 'HS256', kid: 'test-key-1' })
      .setSubject('attacker')
      .setIssuer(TEST_ISSUER)
      .setAudience(TEST_AUDIENCE)
      .setIssuedAt(now)
      .setExpirationTime(now + 3600)
      .sign(new TextEncoder().encode('any-shared-secret-guess'));

    await expect(verifySupabaseJwt(hsToken, config, localKeySet)).rejects.toThrow();
  });

  it('rejects garbage / non-JWT input', async () => {
    const { localKeySet } = await makeTestKeys();
    await expect(verifySupabaseJwt('not-a-jwt', config, localKeySet)).rejects.toThrow();
    await expect(verifySupabaseJwt('', config, localKeySet)).rejects.toThrow();
  });
});
