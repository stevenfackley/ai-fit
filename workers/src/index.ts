import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { bearerAuth } from 'hono/bearer-auth';
import { generateRecommendations, RecommendationRequest, RecommendationResult } from './recommendation';
import providers from './providers.json';

interface Env {
  OPENAI_API_KEY: string;
  SUPABASE_JWT_SECRET: string;
}

const app = new Hono<{ Bindings: Env }>();

app.use('*', cors({ origin: '*' }));

// Verify Supabase JWT (simplified — in production use a proper JWT verify library)
app.use('/recommend', async (c, next) => {
  const auth = c.req.header('Authorization');
  if (!auth || !auth.startsWith('Bearer ')) {
    return c.json({ error: 'UNAUTHORIZED', message: 'Missing Bearer token' }, 401);
  }
  // TODO: verify JWT signature with SUPABASE_JWT_SECRET
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

    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || '// No snippet generated';
  } catch {
    return `// Could not reach snippet service. Use ${provider} ${model} docs for sample code.`;
  }
}

export default app;
