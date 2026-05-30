# API Specification — AI-Fit

## Endpoint

```
POST /recommend
```

Hosted on Cloudflare Workers.

## Authentication

Bearer token (Supabase JWT) required in `Authorization` header.

## Request Body

```json
{
  "projectDescription": "A chatbot for customer support with image upload",
  "useCases": ["chat", "image-analysis"],
  "budgetUsdPerMonth": 50,
  "maxLatencyMs": 1000,
  "compliance": ["gdpr"],
  "preferredProviders": ["openai", "anthropic"],
  "estimatedRequestsPerMonth": 10000,
  "averageTokensPerRequest": 2000
}
```

### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| projectDescription | string | Yes | Free-text project overview |
| useCases | string[] | Yes | Selected use-case tags |
| budgetUsdPerMonth | number | No | Monthly budget cap |
| maxLatencyMs | number | No | Max acceptable latency |
| compliance | string[] | No | Required compliance tags |
| preferredProviders | string[] | No | Whitelist of providers |
| estimatedRequestsPerMonth | number | No | Expected volume |
| averageTokensPerRequest | number | No | Avg tokens per call |

## Response Body

```json
{
  "recommendations": [
    {
      "task": "chat",
      "provider": "openai",
      "model": "gpt-4o-mini",
      "displayName": "GPT-4o mini",
      "reasons": [
        "Lowest cost for ≤4k-token generation",
        "Supports function calling"
      ],
      "estimatedMonthlyCost": 12.50,
      "estimatedLatencyMs": 350,
      "snippet": "import OpenAI from 'openai';\n..."
    }
  ],
  "totalEstimatedCost": 12.50
}
```

### Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| recommendations | object[] | One per task/use-case |
| task | string | The use-case this model serves |
| provider | string | Provider slug |
| model | string | Model ID |
| displayName | string | Human-readable name |
| reasons | string[] | Why this model was chosen |
| estimatedMonthlyCost | number | USD/month |
| estimatedLatencyMs | number | Predicted latency |
| snippet | string | Copy-ready TS code |
| totalEstimatedCost | number | Sum of all recommendations |

## Error Responses

| Status | Code | Description |
|--------|------|-------------|
| 400 | INVALID_PAYLOAD | Missing required fields |
| 401 | UNAUTHORIZED | Invalid or missing JWT |
| 422 | NO_MATCH | No model satisfies constraints |
| 500 | INTERNAL_ERROR | Worker or LLM call failure |

## Rate Limits

- 60 requests per minute per user (enforced by Worker + Supabase RLS)

## Future Extensions

- `GET /providers` — list available providers and models
- `POST /feedback` — submit recommendation feedback
