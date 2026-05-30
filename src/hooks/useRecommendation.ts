import { useState, useCallback } from 'react';
import api from '../utils/api';

export interface RecommendationPayload {
  projectDescription: string;
  useCases: string[];
  budgetUsdPerMonth?: number;
  maxLatencyMs?: number;
  compliance?: string[];
  preferredProviders?: string[];
  estimatedRequestsPerMonth?: number;
  averageTokensPerRequest?: number;
}

export interface Recommendation {
  task: string;
  provider: string;
  model: string;
  displayName: string;
  reasons: string[];
  estimatedMonthlyCost: number;
  estimatedLatencyMs: number;
  snippet: string;
}

export interface RecommendationResponse {
  recommendations: Recommendation[];
  totalEstimatedCost: number;
}

export function useRecommendation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recommend = useCallback(
    async (payload: RecommendationPayload): Promise<RecommendationResponse> => {
      setLoading(true);
      setError(null);
      try {
        return await api.post<RecommendationResponse>('/recommend', payload);
      } catch (err: any) {
        const message = err.message || 'Failed to get recommendations';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { recommend, loading, error };
}
