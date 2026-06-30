import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { JWTPayload } from 'jose';
import { generateRecommendations, RecommendationRequest, RecommendationResult } from './recommendation';
import { supabaseJwtConfigFromEnv, verifySupabaseJwt } from './auth';
import providers from './providers.json';

interface Env {
  OPENAI_API_KEY: string;
  // Public Supabase project URL — used to discover the ES256 JWKS and token issuer.
  SUPABASE_URL: string;
  // Optional overrides (normally all derived from SUPABASE_URL).
  SUPABASE_JWKS_URL?: string;
  SUPABASE_JWT_ISSUER?: string;
  SUPABASE_JWT_AUDIENCE?: string;
}

const app = new Hono<{ Bindings: Env; Variables: { jwtPayload: JWTPayload } }>();

app.use('*', cors({ origin: '*' }));

// Verify the Supabase-issued JWT using ES256 + the project's public JWKS (no
// shared secret). Signature, issuer, audience ("authenticated") and expiry are
// all validated. Anything missing/invalid/expired fails closed with a 401.
app.use('/recommend', async (c, next) => {
  const auth = c.req.header('Authorization');
  if (!auth || !auth.startsWith('Bearer ')) {
    return c.json({ error: 'UNAUTHORIZED', message: 'Missing Bearer token' }, 401);
  }
  const token = auth.slice('Bearer '.length).trim();
  try {
    const config = supabaseJwtConfigFromEnv(c.env);
    const payload = await verifySupabaseJwt(token, config);
    c.set('jwtPayload', payload);
  } catch {
    return c.json({ error: 'UNAUTHORIZED', message: 'Invalid or expired token' }, 401);
  }
  await next();
});

app.post('/recommend', async (c) => {
  try {
    const body = await c.req.json<RecommendationRequest>();

    if (!body.projectDescription || !body.useCases || body.useCases.length === 0) {
      return c.json({ error: 'INVALID_PAYLOAD', message: 'projectDescription and useCases are required' }, 400);
    }

    const recommendations = generateRecommendations(body);

    if (recommendations.length === 0) {
      return c.json({ error: 'NO_MATCH', message: 'No model satisfies the given constraints. Try relaxing budget or latency.' }, 422);
    }

    // Generate SDK snippets via OpenAI gpt-4o-mini
    const openaiKey = c.env.OPENAI_API_KEY;
    if (openaiKey) {
      for (const rec of recommendations) {
        rec.snippet = await generateSnippet(openaiKey, rec.provider, rec.model, rec.task);
      }
    }

    const totalCost = recommendations.reduce((sum, r) => sum + r.estimatedMonthlyCost, 0);

    return c.json({ recommendations, totalEstimatedCost: Math.round(totalCost * 100) / 100 });
  } catch (err: any) {
    return c.json({ error: 'INTERNAL_ERROR', message: err.message || 'Unknown error' }, 500);
  }
});

async function generateSnippet(apiKey: string, provider: string, model: string, task: string): Promise<string> {
  const prompt = `Write a concise TypeScript code snippet that uses the ${provider} SDK to call the ${model} model for a ${task} use case. Include imports and a comment. Keep it under 15 lines.`;

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 250,
        temperature: 0.2,
      }),
    });

    if (!res.ok) {
      return `// Snippet generation failed (${res.status}). Use ${provider} ${model} docs for sample code.`;
    }

    const data = await res.json<{ choices?: { message?: { content?: string } }[] }>();
    return data.choices?.[0]?.message?.content?.trim() || '// No snippet generated';
  } catch {
    return `// Could not reach snippet service. Use ${provider} ${model} docs for sample code.`;
  }
}

export default app;
