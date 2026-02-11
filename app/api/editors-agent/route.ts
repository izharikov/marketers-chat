import { UIMessage, convertToModelMessages, smoothStream, ToolLoopAgent } from 'ai';
import * as clientTools from '@/lib/tools/xmc/client';
import * as serverTools from '@/lib/tools/xmc/server';
import { clientSideTools } from '@/lib/tools/client-side';
import { buildSystem, Capability, toolsMapping } from '@/lib/tools/xmc';
import { experimental_createXMCClient } from '@sitecore-marketplace-sdk/xmc';
import { retrieveModel } from '@/lib/ai/registry';

function frontendToolsFactory(config: clientTools.ToolDefinitionConfig) {
    return {
        ...clientTools.assetTools(config),
        ...clientTools.componentsTools(config),
        ...clientTools.contentTools(config),
        ...clientTools.environmentTools(config),
        ...clientTools.pagesTools(config),
        ...clientTools.personalizationTools(config),
        ...clientTools.sitesTools(config),
        ...clientTools.jobTools(config),
        ...clientSideTools,
    }
};

type ToolName = keyof ReturnType<typeof frontendToolsFactory>;
type ToolExecution = 'frontend' | 'backend';

async function createTools(toolExecution: ToolExecution, config: clientTools.ToolDefinitionConfig,
    accessToken: string | undefined, contextId: string | undefined) {
    switch (toolExecution) {
        case 'frontend':
            return frontendToolsFactory(config);
        case 'backend':
            const xmcClient = await experimental_createXMCClient({
                getAccessToken: async () => {
                    return accessToken!;
                },
            });
            return {
                ...serverTools.assetTools(xmcClient, contextId!),
                ...serverTools.componentsTools(xmcClient, contextId!),
                ...serverTools.contentTools(xmcClient, contextId!),
                ...serverTools.environmentTools(xmcClient, contextId!),
                ...serverTools.pagesTools(xmcClient, contextId!),
                ...serverTools.personalizationTools(xmcClient, contextId!),
                ...serverTools.sitesTools(xmcClient, contextId!, config),
                ...serverTools.jobTools(xmcClient, contextId!),
                ...clientSideTools
            }
    }
}

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    const {
        messages,
        model: modelName,
        capabilities,
        toolExecution = 'frontend',
        contextId,
        needsApproval,
    }: {
        messages: UIMessage[];
        model: string;
        capabilities: Capability[],
        toolExecution: 'frontend' | 'backend';
        contextId: string | undefined;
        needsApproval: boolean;
    } = await req.json();

    const apiKey = req.headers.get("x-vercel-api-key");
    const accessToken = req.headers.get("Authorization")?.split(" ")[1];
    if (!apiKey) {
        return Response.json(
            { error: "API key is required" },
            { status: 401 }
        );
    }

    if (toolExecution === 'backend' && (!accessToken || !contextId)) {
        throw new Error('Access token and sitecore context ID are required for backend tool execution.');
    }

    const { model, providerOptions } = retrieveModel(modelName, apiKey);

    const config = {
        needsApproval,
    };

    const agent = new ToolLoopAgent({
        model,
        instructions: buildSystem(capabilities),
        tools: await createTools(toolExecution, config, accessToken, contextId),
        activeTools: capabilities.map(cap => toolsMapping[cap]).flat(),
        providerOptions,
    });

    const stream = await agent.stream({
        messages: await convertToModelMessages(messages),
        experimental_transform: smoothStream(),
        abortSignal: req.signal,
    });
    return stream.toUIMessageStreamResponse({
        sendSources: true,
        sendReasoning: true,
    });
}