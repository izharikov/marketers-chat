export type Model = {
  id: string;
  name: string;
  chef: string;
  chefSlug: string;
};

export const models: Model[] = [
  {
    id: 'openai/gpt-5-nano',
    name: 'GPT 5 Nano',
    chef: 'OpenAI',
    chefSlug: 'openai',
  },
  {
    id: 'openai/gpt-5.2',
    name: 'GPT 5.2',
    chef: 'OpenAI',
    chefSlug: 'openai',
  },
  {
    id: 'anthropic/claude-opus-4.5',
    name: 'Claude Opus 4.5',
    chef: 'Anthropic',
    chefSlug: 'anthropic',
  },
  {
    id: 'google/gemini-2.0-pro',
    name: 'Gemini 2.0 Pro',
    chef: 'Google',
    chefSlug: 'google',
  },
];

export const modelProviders = ['OpenAI', 'Anthropic', 'Google'] as const;
