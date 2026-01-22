import { streamText, UIMessage, convertToModelMessages, tool, stepCountIs } from 'ai';
import { openai } from '@ai-sdk/openai';
import {
    clientPagesTools,
    clientSitesTools
} from '@/lib/agents/tools';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    const {
        messages,
        model,
    }: {
        messages: UIMessage[];
        model: string;
    } = await req.json();

    const result = streamText({
        model: openai(model),
        messages: await convertToModelMessages(messages),
        system:
            'You are SitecoreAI assistnant: use available tools.',
        tools: {
            // ...assetTools(xmcClient, contextId),
            // ...componentsTools(xmcClient, contextId),
            // ...contentTools(xmcClient, contextId),
            // ...environmentTools(xmcClient, contextId),
            ...clientPagesTools(),
            // ...personalizationTools(xmcClient, contextId),
            ...clientSitesTools(),
            // ...jobTools(xmcClient, contextId),

        },
        activeTools: ['get_page', 'get_all_pages_by_site'],
        stopWhen: stepCountIs(10),
    });
    // send sources and reasoning back to the client
    return result.toUIMessageStreamResponse({
        sendSources: true,
        sendReasoning: true,
    });
}