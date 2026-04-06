import { gateway, tool } from 'ai';
import { Exa } from 'exa-js';
import { z } from 'zod';

type ExaToolOptions = {
  apiKey: string;
  needsApproval?: Parameters<typeof tool>[0]['needsApproval'];
};

type WebSearchToolOptions =
  | ({
      provider: 'exa';
    } & ExaToolOptions)
  | {
      provider: 'perplexity';
    };

const exaSearch = ({ apiKey, needsApproval }: ExaToolOptions) =>
  tool({
    needsApproval,
    description: 'Search the web for up-to-date information',
    inputSchema: z.object({
      query: z.string().min(1).max(100).describe('The search query'),
    }),
    execute: async ({ query }) => {
      if (!apiKey) {
        throw new Error('Exa API key is required to use websearch');
      }
      try {
        const exa = new Exa(apiKey);
        const { results } = await exa.search(query, {
          numResults: 5,
          contents: {
            summary: true,
            livecrawl: 'always',
          },
        });
        return results.map((result) => ({
          title: result.title,
          url: result.url,
          content: result.summary,
          publishedDate: result.publishedDate,
        }));
      } catch (error) {
        console.error('Error searching web:', error);
        throw new Error('Failed to search web');
      }
    },
  });

export const webSearchTools = (config: WebSearchToolOptions) => {
  return {
    web_search:
      config.provider === 'exa'
        ? exaSearch(config)
        : gateway.tools.perplexitySearch(),
  };
};

export type WebSearchToolName = keyof ReturnType<typeof webSearchTools>;
