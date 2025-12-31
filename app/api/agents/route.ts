import { streamText, UIMessage, convertToModelMessages, tool, stepCountIs } from 'ai';
import { openai } from '@ai-sdk/openai';
import {
    assetTools, componentsTools,
    contentTools, environmentTools, pagesTools,
    personalizationTools, sitesTools, jobTools
} from '@/lib/agents/tools';
import { experimental_createXMCClient } from '@sitecore-marketplace-sdk/xmc';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    const {
        messages,
        model,
        contextId,
    }: {
        messages: UIMessage[];
        model: string;
        contextId: string;
    } = await req.json();

    const accessToken = req.headers.get("authorization")?.split(" ")[1];

    const xmcClient = await experimental_createXMCClient({
        getAccessToken: async () => {
            return accessToken!;
        },
    });

    const result = streamText({
        model: openai(model),
        messages: await convertToModelMessages(messages),
        system:
            'You are SitecoreAI assistnant: use available tools.',
        tools: {
            ...assetTools(xmcClient, contextId),
            ...componentsTools(xmcClient, contextId),
            ...contentTools(xmcClient, contextId),
            ...environmentTools(xmcClient, contextId),
            ...pagesTools(xmcClient, contextId),
            ...personalizationTools(xmcClient, contextId),
            ...sitesTools(xmcClient, contextId),
            ...jobTools(xmcClient, contextId),

        },
        stopWhen: stepCountIs(10),
    });
    // send sources and reasoning back to the client
    return result.toUIMessageStreamResponse({
        sendSources: true,
        sendReasoning: true,
    });
}