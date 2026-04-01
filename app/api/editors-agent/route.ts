import { experimental_createXMCClient } from '@sitecore-marketplace-sdk/xmc';
import {
  ToolLoopAgent,
  ToolUIPart,
  UIMessage,
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  smoothStream,
} from 'ai';
import { experimental_createSkillTool as createSkillTool } from 'bash-tool';
import { pageBuilderTools } from 'sitecore-ai-sdk-tools';
import {
  CreateAgentToolsOptions,
  createAgentTools,
} from 'sitecore-ai-sdk-tools';
import { helpers, writeText } from '@/lib/ai/helpers';
import { retrieveModel } from '@/lib/ai/registry';
import {
  Capability,
  buildSystem,
  toolsMapping,
} from '@/lib/tools/capabilities';
import { webSearchTools } from '@/lib/tools/websearch';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

function executeRevert({
  messages,
  revert,
  capabilities,
}: {
  messages: UIMessage[];
  revert: UIMessage['parts'][number];
  capabilities: Capability[];
}) {
  const jobId = (revert as { data: { jobId: string } }).data.jobId;
  const toolCallId = `revert-${jobId}`;
  const toolName = 'revert_operation';
  const toolPart = messages
    .findLast((msg) => msg.role === 'assistant')
    ?.parts.find((part) => part.type === `tool-${toolName}`) as ToolUIPart;
  const state = toolPart?.state;
  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      const { start, finish, toolInput } = helpers(writer);
      start();
      if (state === 'output-available' || state === 'output-error') {
        // Check if reload was already emitted and completed
        const reloadPart = messages
          .findLast((msg) => msg.role === 'assistant')
          ?.parts.find(
            (part) => part.type === 'tool-reload_current_page'
          ) as ToolUIPart;

        if (reloadPart) {
          writeText(writer, `text-reload-${jobId}`, 'Page reloaded');
          finish();
          return;
        }

        writeText(
          writer,
          `text-${jobId}`,
          state === 'output-available' ? 'Reverted job' : 'Error reverting job'
        );

        const activeTools = capabilities.flatMap((cap) => toolsMapping[cap]);
        if (
          state === 'output-available' &&
          activeTools.includes('reload_current_page')
        ) {
          toolInput({
            toolCallId: `reload-${jobId}`,
            toolName: 'reload_current_page',
            input: {},
          });
        } else {
          finish();
        }
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
    contextId,
    agentApi,
  }: {
    messages: UIMessage[];
    model: string;
    capabilities: Capability[];
    contextId: string | undefined;
    agentApi: {
      needsApproval: boolean;
      approvalFor: 'all' | 'mutations';
      execution: 'frontend' | 'backend';
    };
  } = await req.json();

  const apiKey = req.headers.get('x-vercel-api-key');
  const accessToken = req.headers.get('Authorization')?.split(' ')[1];
  if (!apiKey) {
    return Response.json({ error: 'API key is required' }, { status: 401 });
  }

  if (agentApi.execution === 'backend' && (!accessToken || !contextId)) {
    throw new Error(
      'Access token and sitecore context ID are required for backend tool execution.'
    );
  }

  const lastUserMessage = messages.findLast((msg) => msg.role === 'user');
  const revert = lastUserMessage?.parts.find(
    (part) => part.type === 'data-revert'
  );
  if (revert) {
    return executeRevert({ messages, revert, capabilities });
  }

  const { model, providerOptions } = retrieveModel(modelName, apiKey);

  const approvalOptions = {
    needsApproval: agentApi.needsApproval,
    needsApprovalFor: agentApi.approvalFor,
  };
  const agentToolOptions: CreateAgentToolsOptions =
    agentApi.execution === 'frontend'
      ? {
          execution: 'client',
          ...approvalOptions,
        }
      : {
          execution: 'server',
          client: await experimental_createXMCClient({
            getAccessToken: async () => {
              return accessToken!;
            },
          }),
          sitecoreContextId: contextId!,
          ...approvalOptions,
        };

  const { skill } = await createSkillTool({
    skillsDirectory: './chat-skills',
    destination: 'chat-skills',
  });

  const agent = new ToolLoopAgent({
    model,
    instructions: buildSystem(capabilities),
    tools: {
      ...createAgentTools(agentToolOptions),
      ...pageBuilderTools({}),
      ...webSearchTools({ provider: 'perplexity' }),
      skill: {
        ...skill,
        needsApproval: true,
      },
    },
    activeTools: capabilities.map((cap) => toolsMapping[cap]).concat(['skill']).flat(),
    providerOptions,
  });

  const stream = await agent.stream({
    messages: await convertToModelMessages(messages),
    experimental_transform: smoothStream({delayInMs: 10}),
    abortSignal: req.signal,
  });
  return stream.toUIMessageStreamResponse({
    sendSources: true,
    sendReasoning: true,
    messageMetadata: ({ part }) => {
      if (part.type === 'finish-step') {
        return {
          inputTokens: part.usage.inputTokens,
        };
      }
    },
  });
}
