import providers from './providers.json';
import latency from './latency.json';

export interface RecommendationRequest {
  projectDescription: string;
  useCases: string[];
  budgetUsdPerMonth?: number;
  maxLatencyMs?: number;
  compliance?: string[];
  preferredProviders?: string[];
  estimatedRequestsPerMonth?: number;
  averageTokensPerRequest?: number;
}

export interface RecommendationResult {
  task: string;
  provider: string;
  model: string;
  displayName: string;
  reasons: string[];
  estimatedMonthlyCost: number;
  estimatedLatencyMs: number;
  snippet: string;
}

const USE_CASE_REQUIREMENTS: Record<string, { capabilities: string[] }> = {
  chat: { capabilities: [] },
  'code-assist': { capabilities: [] },
  'image-generation': { capabilities: [] },
  embeddings: { capabilities: [] },
  search: { capabilities: [] },
  'function-calling': { capabilities: ['functionCalling'] },
};

function normalize(value: number, min: number, max: number): number {
  if (max === min) return 0;
  return (value - min) / (max - min);
}

function estimateCost(
  provider: string,
  model: string,
  requests: number,
  tokensPerRequest: number
): number {
  const p = (providers as any)[provider]?.[model];
  if (!p) return Infinity;
  const tokensPer1k = tokensPerRequest / 1000;
  // Assume 70/30 input/output split
  const inputCost = requests * tokensPer1k * 0.7 * p.priceInput;
  const outputCost = requests * tokensPer1k * 0.3 * p.priceOutput;
  return inputCost + outputCost;
}

function estimateLatency(provider: string, model: string): number {
  const providerRegions = (latency as any)[provider];
  if (!providerRegions) return 1000;
  const regions = Object.values(providerRegions) as { avgLatencyMs: number }[];
  const avg = regions.reduce((sum, r) => sum + r.avgLatencyMs, 0) / regions.length;
  return Math.round(avg);
}

export function generateRecommendations(
  req: RecommendationRequest
): RecommendationResult[] {
  const results: RecommendationResult[] = [];
  const requests = req.estimatedRequestsPerMonth ?? 1000;
  const tokens = req.averageTokensPerRequest ?? 1500;

  for (const task of req.useCases) {
    const requirements = USE_CASE_REQUIREMENTS[task] ?? { capabilities: [] };
    const candidates: { provider: string; model: string; score: number; cost: number; latencyMs: number }[] = [];

    for (const [providerName, models] of Object.entries(providers)) {
      if (req.preferredProviders && !req.preferredProviders.includes(providerName)) {
        continue;
      }

      for (const [modelId, modelData] of Object.entries(models as any)) {
        // Capability filter
        const missing = requirements.capabilities.filter(
          (cap) => !(modelData as any)[cap]
        );
        if (missing.length > 0) continue;

        // Compliance filter
        if (req.compliance && req.compliance.length > 0) {
          const comp = (modelData as any).compliance ?? [];
          const ok = req.compliance.every((c) => comp.includes(c));
          if (!ok) continue;
        }

        // Budget filter (soft)
        const cost = estimateCost(providerName, modelId, requests, tokens);
        if (req.budgetUsdPerMonth && cost > req.budgetUsdPerMonth) {
          continue;
        }

        // Latency filter (soft)
        const lat = estimateLatency(providerName, modelId);
        if (req.maxLatencyMs && lat > req.maxLatencyMs) {
          continue;
        }

        candidates.push({
          provider: providerName,
          model: modelId,
          score: 0,
          cost,
          latencyMs: lat,
        });
      }
    }

    if (candidates.length === 0) {
      // Fallback: relax budget and latency
      for (const [providerName, models] of Object.entries(providers)) {
        if (req.preferredProviders && !req.preferredProviders.includes(providerName)) continue;
        for (const [modelId, modelData] of Object.entries(models as any)) {
          const missing = requirements.capabilities.filter((cap) => !(modelData as any)[cap]);
          if (missing.length > 0) continue;
          const cost = estimateCost(providerName, modelId, requests, tokens);
          const lat = estimateLatency(providerName, modelId);
          candidates.push({ provider: providerName, model: modelId, score: 0, cost, latencyMs: lat });
        }
      }
    }

    // Normalize and score
    const minCost = Math.min(...candidates.map((c) => c.cost));
    const maxCost = Math.max(...candidates.map((c) => c.cost));
    const minLat = Math.min(...candidates.map((c) => c.latencyMs));
    const maxLat = Math.max(...candidates.map((c) => c.latencyMs));

    for (const c of candidates) {
      const normCost = 1 - normalize(c.cost, minCost, maxCost);
      const normLat = 1 - normalize(c.latencyMs, minLat, maxLat);
      const bench = (providers as any)[c.provider][c.model].benchmarkScore;
      const normBench = bench / 100;
      c.score = normCost * 0.5 + normLat * 0.3 + normBench * 0.2;
    }

    candidates.sort((a, b) => b.score - a.score);
    const best = candidates[0];
    if (!best) continue;

    const modelInfo = (providers as any)[best.provider][best.model];
    const reasons: string[] = [];
    if (best.cost <= minCost * 1.1) reasons.push('Lowest cost for expected usage');
    if (best.latencyMs <= minLat * 1.1) reasons.push('Fastest average latency');
    if (modelInfo.benchmarkScore >= 85) reasons.push('High benchmark performance');
    if (modelInfo.functionCalling) reasons.push('Supports function calling');
    if (reasons.length === 0) reasons.push('Best overall balance of cost, latency, and quality');

    results.push({
      task,
      provider: best.provider,
      model: best.model,
      displayName: modelInfo.displayName,
      reasons,
      estimatedMonthlyCost: Math.round(best.cost * 100) / 100,
      estimatedLatencyMs: best.latencyMs,
      snippet: '', // populated by index.ts via LLM
    });
  }

  return results;
}
