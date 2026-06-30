import {
  SignJWT,
  createLocalJWKSet,
  exportJWK,
  generateKeyPair,
  type JWK,
  type JWTVerifyGetKey,
} from 'jose';

// A self-consistent set of test values. The Worker derives jwksUrl/issuer from
// SUPABASE_URL, so these line up with SUPABASE_URL = https://test.supabase.co.
export const TEST_SUPABASE_URL = 'https://test.supabase.co';
export const TEST_ISSUER = `${TEST_SUPABASE_URL}/auth/v1`;
export const TEST_JWKS_URL = `${TEST_SUPABASE_URL}/auth/v1/.well-known/jwks.json`;
export const TEST_AUDIENCE = 'authenticated';
export const TEST_KID = 'test-key-1';

export interface TestKeys {
  privateKey: CryptoKey;
  publicJwk: JWK;
  jwks: { keys: JWK[] };
  localKeySet: JWTVerifyGetKey;
}

/** Generate an ES256 keypair and the matching published JWKS for tests. */
export async function makeTestKeys(): Promise<TestKeys> {
  const { privateKey, publicKey } = await generateKeyPair('ES256', { extractable: true });
  const publicJwk: JWK = {
    ...(await exportJWK(publicKey)),
    kid: TEST_KID,
    alg: 'ES256',
    use: 'sig',
  };
  const jwks = { keys: [publicJwk] };
  return { privateKey, publicJwk, jwks, localKeySet: createLocalJWKSet(jwks) };
}

export interface MintOptions {
  issuer?: string;
  audience?: string;
  subject?: string;
  /** Absolute exp as epoch seconds (overrides the default of now + 1h). */
  expEpochSeconds?: number;
  kid?: string;
  /** Header alg override, for alg-confusion tests. */
  alg?: string;
}

/** Mint a signed ES256 access token with sensible Supabase-like defaults. */
export async function mintToken(privateKey: CryptoKey, opts: MintOptions = {}): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({ role: 'authenticated' })
    .setProtectedHeader({ alg: opts.alg ?? 'ES256', kid: opts.kid ?? TEST_KID })
    .setSubject(opts.subject ?? 'user-123')
    .setIssuer(opts.issuer ?? TEST_ISSUER)
    .setAudience(opts.audience ?? TEST_AUDIENCE)
    .setIssuedAt(now)
    .setExpirationTime(opts.expEpochSeconds ?? now + 3600)
    .sign(privateKey);
}

/** Corrupt the signature segment of a compact JWS so verification must fail. */
export function tamperSignature(token: string): string {
  const parts = token.split('.');
  const sig = parts[2];
  const last = sig.at(-1);
  // base64url alphabet — swap the final char for a different valid one.
  const swapped = last === 'A' ? 'B' : 'A';
  parts[2] = sig.slice(0, -1) + swapped;
  return parts.join('.');
}
