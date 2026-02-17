import { UIMessage, convertToModelMessages, smoothStream, ToolLoopAgent, createUIMessageStream, createUIMessageStreamResponse, ToolUIPart } from 'ai';
import { pageBuilderTools } from '@/lib/tools/sitecore/page-builder';
import { createSitecoreTools, CreateSitecoreToolsOptions } from '@/lib/tools/sitecore';
import { experimental_createXMCClient } from '@sitecore-marketplace-sdk/xmc';
import { retrieveModel } from '@/lib/ai/registry';
import { helpers, writeText } from '@/lib/ai/helpers';
import { buildSystem, Capability, toolsMapping } from '@/lib/tools/capabilities';
import { exaTools } from '@/lib/tools/exa';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

function executeRevert({
    messages,
    revert,
}: { messages: UIMessage[], revert: UIMessage['parts'][number] }) {
    const jobId = (revert as { data: { jobId: string; }; }).data.jobId;
    const toolCallId = `revert-${jobId}`;
    const toolName = 'revert_operation';
    const toolPart = messages.findLast(msg => msg.role === 'assistant')?.parts.find(part => part.type === `tool-${toolName}`) as ToolUIPart;
    const state = toolPart?.state;
    const stream = createUIMessageStream({
        execute: async ({ writer }) => {
            const { start, finish, toolInput } = helpers(writer);
            start();
            if (state === 'output-available' || state === 'output-error') {
                writeText(writer, `text-${jobId}`, state === 'output-available' ? 'Reverted job' : 'Error reverting job');
                finish();
                return;
            } else if (!state) {
                toolInput({
                    toolCallId,
                    toolName,
                    input: {
                        jobId,
                    },
                });
            }
        },
        originalMessages: messages,
    });
    return createUIMessageStreamResponse({ stream });
}

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
    const exaApiKey = req.headers.get("x-exa-api-key");
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

    const lastUserMessage = messages.findLast(msg => msg.role === 'user');
    const revert = lastUserMessage?.parts.find(part => part.type === 'data-revert');
    if (revert) {
        return executeRevert({ messages, revert });
    }

    const { model, providerOptions } = retrieveModel(modelName, apiKey);

    const options: CreateSitecoreToolsOptions = toolExecution === 'frontend' ? {
        execution: 'client',
        needsApproval,
    } : {
        execution: 'server',
        needsApproval,
        client: await experimental_createXMCClient({
            getAccessToken: async () => {
                return accessToken!;
            },
        }),
        sitecoreContextId: contextId!,
    };

    const agent = new ToolLoopAgent({
        model,
        instructions: buildSystem(capabilities),
        tools: {
            ...createSitecoreTools(options),
            ...pageBuilderTools,
            ...exaTools({ apiKey: exaApiKey! }),
        },
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