export type ModelPricing = {
  input: number;
  output: number;
};

export type Model = {
  id: string;
  name: string;
  chef: string;
  chefSlug: string;
  pricing: ModelPricing;
  contextWindow: number;
};

export const models: Model[] = [
  // OpenAI
  {
    id: 'openai/gpt-5.4-pro',
    name: 'GPT 5.4 Pro',
    chef: 'OpenAI',
    chefSlug: 'openai',
    pricing: { input: 30, output: 180 },
    contextWindow: 128_000,
  },
  {
    id: 'openai/gpt-5.4',
    name: 'GPT 5.4',
    chef: 'OpenAI',
    chefSlug: 'openai',
    pricing: { input: 2.5, output: 15 },
    contextWindow: 128_000,
  },
  {
    id: 'openai/gpt-5.4-mini',
    name: 'GPT 5.4 Mini',
    chef: 'OpenAI',
    chefSlug: 'openai',
    pricing: { input: 0.75, output: 4.5 },
    contextWindow: 128_000,
  },
  {
    id: 'openai/gpt-5.4-nano',
    name: 'GPT 5.4 Nano',
    chef: 'OpenAI',
    chefSlug: 'openai',
    pricing: { input: 0.2, output: 1.25 },
    contextWindow: 128_000,
  },
  {
    id: 'openai/o4-mini',
    name: 'o4 Mini',
    chef: 'OpenAI',
    chefSlug: 'openai',
    pricing: { input: 1.1, output: 4.4 },
    contextWindow: 200_000,
  },
  {
    id: 'openai/o3',
    name: 'o3',
    chef: 'OpenAI',
    chefSlug: 'openai',
    pricing: { input: 2, output: 8 },
    contextWindow: 200_000,
  },
  // Anthropic
  {
    id: 'anthropic/claude-opus-4.6',
    name: 'Claude Opus 4.6',
    chef: 'Anthropic',
    chefSlug: 'anthropic',
    pricing: { input: 5, output: 25 },
    contextWindow: 200_000,
  },
  {
    id: 'anthropic/claude-sonnet-4.6',
    name: 'Claude Sonnet 4.6',
    chef: 'Anthropic',
    chefSlug: 'anthropic',
    pricing: { input: 3, output: 15 },
    contextWindow: 200_000,
  },
  {
    id: 'anthropic/claude-sonnet-4.5',
    name: 'Claude Sonnet 4.5',
    chef: 'Anthropic',
    chefSlug: 'anthropic',
    pricing: { input: 3, output: 15 },
    contextWindow: 200_000,
  },
  {
    id: 'anthropic/claude-haiku-4.5',
    name: 'Claude Haiku 4.5',
    chef: 'Anthropic',
    chefSlug: 'anthropic',
    pricing: { input: 1, output: 5 },
    contextWindow: 200_000,
  },
  // Google
  {
    id: 'google/gemini-3.1-pro-preview',
    name: 'Gemini 3.1 Pro',
    chef: 'Google',
    chefSlug: 'google',
    pricing: { input: 2, output: 12 },
    contextWindow: 1_000_000,
  },
  {
    id: 'google/gemini-3-flash',
    name: 'Gemini 3 Flash',
    chef: 'Google',
    chefSlug: 'google',
    pricing: { input: 0.5, output: 3 },
    contextWindow: 1_000_000,
  },
  {
    id: 'google/gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    chef: 'Google',
    chefSlug: 'google',
    pricing: { input: 1.25, output: 10 },
    contextWindow: 1_000_000,
  },
  {
    id: 'google/gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    chef: 'Google',
    chefSlug: 'google',
    pricing: { input: 0.3, output: 2.5 },
    contextWindow: 1_000_000,
  },
  // xAI
  {
    id: 'xai/grok-4',
    name: 'Grok 4',
    chef: 'xAI',
    chefSlug: 'xai',
    pricing: { input: 3, output: 15 },
    contextWindow: 256_000,
  },
  {
    id: 'xai/grok-3',
    name: 'Grok 3',
    chef: 'xAI',
    chefSlug: 'xai',
    pricing: { input: 3, output: 15 },
    contextWindow: 131_072,
  },
  // DeepSeek
  {
    id: 'deepseek/deepseek-v3.2',
    name: 'DeepSeek V3.2',
    chef: 'DeepSeek',
    chefSlug: 'deepseek',
    pricing: { input: 0.28, output: 0.42 },
    contextWindow: 128_000,
  },
  {
    id: 'deepseek/deepseek-r1',
    name: 'DeepSeek R1',
    chef: 'DeepSeek',
    chefSlug: 'deepseek',
    pricing: { input: 1.35, output: 5.4 },
    contextWindow: 128_000,
  },
  // Mistral
  {
    id: 'mistral/mistral-large-3',
    name: 'Mistral Large 3',
    chef: 'Mistral',
    chefSlug: 'mistral',
    pricing: { input: 0.5, output: 1.5 },
    contextWindow: 128_000,
  },
  {
    id: 'mistral/mistral-medium',
    name: 'Mistral Medium',
    chef: 'Mistral',
    chefSlug: 'mistral',
    pricing: { input: 0.4, output: 2 },
    contextWindow: 128_000,
  },
  // Meta
  {
    id: 'meta/llama-4-maverick',
    name: 'Llama 4 Maverick',
    chef: 'Meta',
    chefSlug: 'meta',
    pricing: { input: 0.35, output: 1.15 },
    contextWindow: 1_000_000,
  },
  {
    id: 'meta/llama-4-scout',
    name: 'Llama 4 Scout',
    chef: 'Meta',
    chefSlug: 'meta',
    pricing: { input: 0.17, output: 0.66 },
    contextWindow: 512_000,
  },
];

export const DEFAULT_MODEL_ID = 'openai/gpt-5.4-nano';

export const modelProviders = [
  'OpenAI',
  'Anthropic',
  'Google',
  'xAI',
  'DeepSeek',
  'Mistral',
  'Meta',
] as const;
