import { streamText, UIMessage, convertToModelMessages, stepCountIs, smoothStream } from 'ai';
import { OpenAIResponsesProviderOptions } from '@ai-sdk/openai';
import { wrapLanguageModel, gateway } from 'ai';
import { devToolsMiddleware } from '@ai-sdk/devtools';
import {
    assetTools,
    componentsTools,
    contentTools,
    environmentTools,
    jobTools,
    pagesTools,
    personalizationTools,
    sitesTools
} from '@/lib/tools/client';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    const {
        messages,
        model: modelName,
    }: {
        messages: UIMessage[];
        model: string;
    } = await req.json();

    const model = process.env.NODE_ENV === 'development' ? wrapLanguageModel({
        model: gateway(modelName),
        middleware: [devToolsMiddleware()],
    }) : modelName;

    const config = {
        needsApproval: true,
    };

    const result = streamText({
        model,
        messages: await convertToModelMessages(messages),
        system:
            'You are SitecoreAI assistnant: use available tools.',
        tools: {
            ...assetTools(config),
            ...componentsTools(config),
            ...contentTools(config),
            ...environmentTools(config),
            ...pagesTools(config),
            ...personalizationTools(config),
            ...sitesTools(config),
            ...jobTools(config),

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
        experimental_transform: smoothStream(),
    });
    // send sources and reasoning back to the client
    return result.toUIMessageStreamResponse({
        sendSources: true,
        sendReasoning: true,
    });
}