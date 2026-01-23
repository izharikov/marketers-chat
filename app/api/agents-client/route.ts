import { streamText, UIMessage, convertToModelMessages, tool, stepCountIs } from 'ai';
import { openai, OpenAIResponsesProviderOptions } from '@ai-sdk/openai';
import {
    clientAssetTools,
    clientComponentsTools,
    clientContentTools,
    clientEnvironmentTools,
    clientJobTools,
    clientPagesTools,
    clientPersonalizationTools,
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
        model,
        messages: await convertToModelMessages(messages),
        system:
            'You are SitecoreAI assistnant: use available tools.',
        tools: {
            // ...clientAssetTools(),
            ...clientComponentsTools(),
            ...clientContentTools(),
            // ...clientEnvironmentTools(),
            ...clientPagesTools(),
            ...clientPersonalizationTools(),
            ...clientSitesTools(),
            // ...clientJobTools(),

        },
        stopWhen: stepCountIs(100),
        providerOptions: {
            openai: { // fixes from https://github.com/vercel/ai/issues/7099#issuecomment-3567630392
                reasoningSummary: 'detailed',
                reasoningEffort: 'low',
                store: false,
                include: ['reasoning.encrypted_content'],
            } satisfies OpenAIResponsesProviderOptions,
        },
    });
    // send sources and reasoning back to the client
    return result.toUIMessageStreamResponse({
        sendSources: true,
        sendReasoning: true,
    });
}