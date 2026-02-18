import { tool } from 'ai';
import { Exa } from 'exa-js';
import { z } from 'zod';

const webSearch = ({ apiKey }: { apiKey: string }) =>
  tool({
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

export const exaTools = ({ apiKey }: { apiKey: string }) => {
  return {
    web_search: webSearch({ apiKey }),
  };
};

export type ExaToolName = keyof ReturnType<typeof exaTools>;
