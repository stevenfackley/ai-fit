import {
  createRemoteJWKSet,
  jwtVerify,
  type JWTPayload,
  type JWTVerifyGetKey,
} from 'jose';

/**
 * Configuration for verifying a Supabase-issued JWT.
 *
 * Modern Supabase projects sign access tokens with ES256 (asymmetric) and
 * publish the public key set (JWKS) under the project's auth endpoint. We verify
 * the signature against that public key — there is no shared/symmetric secret.
 */
export interface SupabaseJwtConfig {
  /** Absolute URL of the project JWKS, e.g. https://<ref>.supabase.co/auth/v1/.well-known/jwks.json */
  jwksUrl: string;
  /** Expected `iss` claim, e.g. https://<ref>.supabase.co/auth/v1 */
  issuer: string;
  /** Expected `aud` claim. Supabase end-user tokens use "authenticated". */
  audience: string;
}

/**
 * Subset of the Worker env needed to derive the JWT verification config.
 * SUPABASE_URL is the public project URL (not a secret). The override vars exist
 * for non-standard setups and tests; normally only SUPABASE_URL is set.
 */
export interface SupabaseJwtEnv {
  SUPABASE_URL?: string;
  SUPABASE_JWKS_URL?: string;
  SUPABASE_JWT_ISSUER?: string;
  SUPABASE_JWT_AUDIENCE?: string;
}

/**
 * Build the verification config from Worker env vars.
 *
 * By default everything is derived from SUPABASE_URL:
 *   jwksUrl  = {url}/auth/v1/.well-known/jwks.json
 *   issuer   = {url}/auth/v1
 *   audience = "authenticated"
 * Each piece can be overridden independently.
 *
 * Throws if no usable config can be assembled — the caller treats that as
 * "fail closed" (reject the request) rather than letting traffic through.
 */
export function supabaseJwtConfigFromEnv(env: SupabaseJwtEnv): SupabaseJwtConfig {
  const base = (env.SUPABASE_URL ?? '').trim().replace(/\/+$/, '');
  const authBase = base ? `${base}/auth/v1` : '';

  const jwksUrl = env.SUPABASE_JWKS_URL?.trim()
    || (authBase ? `${authBase}/.well-known/jwks.json` : '');
  const issuer = env.SUPABASE_JWT_ISSUER?.trim() || authBase;
  const audience = env.SUPABASE_JWT_AUDIENCE?.trim() || 'authenticated';

  if (!jwksUrl || !issuer) {
    throw new Error(
      'Supabase JWT verification is not configured: set SUPABASE_URL '
      + '(or SUPABASE_JWKS_URL + SUPABASE_JWT_ISSUER).',
    );
  }

  return { jwksUrl, issuer, audience };
}

/**
 * Module-level cache of remote JWK sets, keyed by JWKS URL. `createRemoteJWKSet`
 * returns a resolver that fetches once and then caches keys in memory (with its
 * own rotation/cooldown handling), so we keep one resolver per URL for the life
 * of the isolate.
 */
const remoteKeySets = new Map<string, JWTVerifyGetKey>();

function remoteKeySetFor(jwksUrl: string): JWTVerifyGetKey {
  let set = remoteKeySets.get(jwksUrl);
  if (!set) {
    set = createRemoteJWKSet(new URL(jwksUrl));
    remoteKeySets.set(jwksUrl, set);
  }
  return set;
}

/**
 * Verify a Supabase access token.
 *
 * - Algorithm is pinned to ES256. Pinning the alg is a deliberate defense: it
 *   blocks the classic "alg confusion" downgrade where an attacker submits an
 *   HS256 token signed with the (public) JWKS key used as the HMAC secret.
 * - Signature is checked against the project's public JWKS (keyed by the token's
 *   `kid` header).
 * - issuer, audience and expiry (`exp`/`nbf`) are all validated by `jwtVerify`.
 *
 * Resolves with the token payload on success; throws on any failure (bad
 * signature, wrong issuer/audience, expired, malformed). Callers map the throw
 * to a 401 — i.e. fail closed.
 *
 * `keySet` is injectable so tests can supply a local JWK set and avoid network.
 */
export async function verifySupabaseJwt(
  token: string,
  config: SupabaseJwtConfig,
  keySet?: JWTVerifyGetKey,
): Promise<JWTPayload> {
  const keys = keySet ?? remoteKeySetFor(config.jwksUrl);
  const { payload } = await jwtVerify(token, keys, {
    issuer: config.issuer,
    audience: config.audience,
    algorithms: ['ES256'],
  });
  return payload;
}
