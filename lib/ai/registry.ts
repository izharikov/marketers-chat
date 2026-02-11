import { devToolsMiddleware } from "@ai-sdk/devtools";
import { OpenAIResponsesProviderOptions } from "@ai-sdk/openai";
import { createGateway, GatewayModelId, LanguageModel, ToolLoopAgent, wrapLanguageModel } from "ai";

export function retrieveModel(modelName: GatewayModelId, apiKey: string): { model: LanguageModel, providerOptions: ConstructorParameters<typeof ToolLoopAgent>[0]['providerOptions'] } {
    const gateway = createGateway({ apiKey });
    const model = process.env.NODE_ENV === 'development' ? wrapLanguageModel({
        model: gateway(modelName),
        middleware: [devToolsMiddleware()],
    }) : modelName;
    return {
        model,
        providerOptions: {
            openai: { // fixes from https://github.com/vercel/ai/issues/7099#issuecomment-3567630392
                reasoningSummary: 'detailed',
                reasoningEffort: 'low',
                store: false,
                include: ['reasoning.encrypted_content'],
            } satisfies OpenAIResponsesProviderOptions,
        }
    };
}