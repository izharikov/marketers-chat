import { tool } from 'ai';
import { Exa } from 'exa-js';
import { z } from 'zod';

type ExaToolOptions = {
  apiKey: string;
  needsApproval?: Parameters<typeof tool>[0]['needsApproval'];
};

const webSearch = ({ apiKey, needsApproval }: ExaToolOptions) =>
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
          numResults: 3,
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

export const exaTools = (config: ExaToolOptions) => {
  return {
    web_search: webSearch(config),
  };
};

export type ExaToolName = keyof ReturnType<typeof exaTools>;
