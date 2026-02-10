import { streamText, UIMessage, convertToModelMessages, stepCountIs, smoothStream, createGateway, wrapLanguageModel, Tool } from 'ai';
import { OpenAIResponsesProviderOptions } from '@ai-sdk/openai';
import { devToolsMiddleware } from '@ai-sdk/devtools';
import {
    assetTools,
    componentsTools,
    contentTools,
    environmentTools,
    jobTools,
    pagesTools,
    personalizationTools,
    sitesTools,
    ToolDefinitionConfig
} from '@/lib/tools/xmc/client';
import { vercelAiToolsDefinition } from '@/lib/tools/client-side';
import { buildSystem, Capability } from '@/lib/tools/xmc';

function toolsFactory(config: ToolDefinitionConfig) {
    return {
        ...assetTools(config),
        ...componentsTools(config),
        ...contentTools(config),
        ...environmentTools(config),
        ...pagesTools(config),
        ...personalizationTools(config),
        ...sitesTools(config),
        ...jobTools(config),
        ...vercelAiToolsDefinition,
    }
};

type ToolName = keyof ReturnType<typeof toolsFactory>;

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    const {
        messages,
        model: modelName,
        capabilities,
    }: {
        messages: UIMessage[];
        model: string;
        capabilities: Capability[]
    } = await req.json();

    const apiKey = req.headers.get("x-vercel-api-key");
    if (!apiKey) {
        return Response.json(
            { error: "API key is required" },
            { status: 401 }
        );
    }

    const gateway = createGateway({ apiKey });
    const model = process.env.NODE_ENV === 'development' ? wrapLanguageModel({
        model: gateway(modelName),
        middleware: [devToolsMiddleware()],
    }) : modelName;

    const config = {
        needsApproval: false,
    };

    const tools = toolsFactory(config);

    const result = streamText({
        model,
        messages: await convertToModelMessages(messages),
        system: buildSystem(capabilities),
        tools,
        activeTools: capabilities.map(function (capability): ToolName[] {
            switch (capability) {
                case 'page_layout':
                    return [
                        'get_current_page_context',
                        'get_components_on_page',
                        'get_allowed_components_by_placeholder',
                        'add_component_on_page',
                        'get_component',
                        'update_content',
                        'reload_current_page',
                    ];
                case 'assets':
                    return ['get_asset_information', 'search_assets', 'update_asset', 'upload_asset'];
                case 'personalization':
                    return [
                        'create_personalization_version',
                        'get_personalization_versions_by_page',
                        'get_condition_templates',
                        'get_condition_template_by_id'
                    ];
            }
            return [];
        }).flat(),
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