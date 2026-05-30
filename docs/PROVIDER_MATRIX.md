# Provider Matrix — AI-Fit

## Schema

`workers/src/providers.json` follows this structure:

```json
{
  "<provider>": {
    "<model-id>": {
      "displayName": string,
      "maxTokens": number,
      "functionCalling": boolean,
      "fineTuning": boolean,
      "priceInput": number,    // USD per 1K tokens
      "priceOutput": number,   // USD per 1K tokens
      "regions": string[],
      "compliance": string[],  // e.g., ["gdpr", "hipaa"]
      "benchmarkScore": number // 0-100 composite score
    }
  }
}
```

## Initial Providers

### OpenAI

| Model | Max Tokens | Function Calling | Input $/1K | Output $/1K |
|-------|------------|------------------|------------|-------------|
| gpt-4o | 128,000 | Yes | $0.005 | $0.015 |
| gpt-4o-mini | 128,000 | Yes | $0.00015 | $0.00060 |

### Anthropic

| Model | Max Tokens | Function Calling | Input $/1K | Output $/1K |
|-------|------------|------------------|------------|-------------|
| claude-3-sonnet-20240229 | 200,000 | Yes | $0.003 | $0.015 |
| claude-3-haiku-20240307 | 200,000 | Yes | $0.00025 | $0.00125 |

## Updating the Matrix

1. Edit `workers/src/providers.json`
2. Update this doc with the new model details
3. Bump the version in `package.json`
4. Commit and deploy the Worker

## Sources

- [OpenAI Pricing](https://openai.com/pricing)
- [Anthropic Pricing](https://www.anthropic.com/pricing)
- Benchmark scores derived from public leaderboards (MMLU, HELM)
