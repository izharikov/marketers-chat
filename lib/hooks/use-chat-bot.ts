'use client';

import { useEffect, useRef } from 'react';
import { useChat } from '@ai-sdk/react';
import {
  DefaultChatTransport,
  ToolUIPart,
  lastAssistantMessageIsCompleteWithApprovalResponses,
  lastAssistantMessageIsCompleteWithToolCalls,
} from 'ai';
import {
  executeAgentTool,
  executePageBuilderTool,
} from 'sitecore-ai-sdk-tools';
import { toast } from 'sonner';
import {
  AgentApiSettings,
  useApiKey,
  useAppSettings,
} from '@/components/providers/app-settings-provider';
import { useAuth } from '@/components/providers/auth';
import {
  useAppContext,
  useMarketplaceClient,
} from '@/components/providers/marketplace';
import { Capability, clientOnlyTools, serverOnlyTools, ToolName } from '@/lib/tools/capabilities';

export function useChatBot() {
  const client = useMarketplaceClient();
  const { getAccessTokenSilently } = useAuth();
  const { localSettings } = useAppSettings();
  const model = useRef<string | undefined>(undefined);
  const capabilities = useRef<Capability[]>([]);
  const agentApi = useRef<AgentApiSettings>(localSettings.agentApi);
  const appContext = useAppContext();

  useEffect(() => {
    agentApi.current = localSettings.agentApi;
  }, [localSettings]);

  const apiKey = useApiKey('vercel');
  const exaApiKey = useApiKey('exa');

  const executeTool = async (toolPart: ToolUIPart) => {
    const toolName = toolPart.type.substring('tool-'.length);
    if (serverOnlyTools.includes(toolName as any)) {
      chat.sendMessage();
      return;
    }

    if (
      agentApi.current.execution === 'backend' &&
      !clientOnlyTools.includes(toolName as ToolName)
    ) {
      return;
    }

    const sitecoreContextId = appContext?.resourceAccess?.[0]?.context?.preview;
    if (!sitecoreContextId) {
      throw new Error('No sitecore context found');
    }
    try {
      let res = await executeAgentTool(
        { client, sitecoreContextId },
        { toolName, input: toolPart.input }
      );
      if (!res.success) {
        res = await executePageBuilderTool(
          { client, sitecoreContextId },
          { toolName, input: toolPart.input }
        );
      }
      if (!res.success) {
        throw new Error(res.error);
      }
      chat.addToolOutput({
        tool: toolName,
        toolCallId: toolPart.toolCallId,
        output: res.result,
      });
    } catch (e) {
      console.error('Error executing tool', toolName, e);
      try {
        chat.addToolOutput({
          state: 'output-error',
          tool: toolName,
          toolCallId: toolPart.toolCallId,
          errorText: e?.toString() || 'Unknown error',
        });
      } catch (addOutputError) {
        console.error('Error adding tool output', addOutputError);
      }
    }
  };

  const toolRejected = async (toolPart: ToolUIPart) => {
    chat.addToolOutput({
      tool: toolPart.type.substring('tool-'.length),
      toolCallId: toolPart.toolCallId,
      output: 'ERROR: User rejected tool execution.',
    });
  };

  const chat = useChat({
    transport: new DefaultChatTransport({
      api: '/api/editors-agent',
      headers: async () => {
        const authorization: Record<string, string> = {};
        if (agentApi.current.execution === 'backend') {
          const accessToken = await getAccessTokenSilently();
          authorization['Authorization'] = `Bearer ${accessToken}`;
        }
        return {
          'x-vercel-api-key': apiKey!,
          ...(exaApiKey ? { 'x-exa-api-key': exaApiKey } : {}),
          ...authorization,
        };
      },
      body: () => {
        return {
          model: model.current,
          contextId: appContext?.resourceAccess?.[0]?.context?.preview,
          capabilities: capabilities.current,
          agentApi: agentApi.current,
        };
      },
    }),
    sendAutomaticallyWhen: (opts) => {
      if (agentApi.current.execution === 'frontend') {
        return lastAssistantMessageIsCompleteWithToolCalls(opts);
      }
      return (
        lastAssistantMessageIsCompleteWithApprovalResponses(opts) ||
        lastAssistantMessageIsCompleteWithToolCalls(opts)
      );
    },
    onError: (error) => {
      toast('Error in chat: ' + error.message);
    },
    onFinish: async ({ message, finishReason }) => {
      if (agentApi.current.execution === 'backend') {
        return;
      }
      if (finishReason !== 'tool-calls') {
        return;
      }
      for (const part of message.parts) {
        if (!part.type.startsWith('tool')) {
          continue;
        }
        const toolPart = part as ToolUIPart;
        if (toolPart.type.startsWith('tool')) {
          if (toolPart.state === 'approval-requested') {
            return;
          }
          if (toolPart.state === 'input-available') {
            await executeTool(toolPart);
          }
        }
      }
    },
    onToolCall: async ({ toolCall }) => {
      if (agentApi.current.execution === 'frontend') {
        return;
      }
      const sitecoreContextId =
        appContext?.resourceAccess?.[0]?.context?.preview;
      if (!sitecoreContextId) {
        throw new Error('No sitecore context found');
      }
      const { toolName, toolCallId, input } = toolCall;
      try {
        const res = await executePageBuilderTool(
          { client, sitecoreContextId },
          { toolName, input }
        );
        if (!res.success) {
          return;
        }
        chat.addToolOutput({
          tool: toolName,
          toolCallId,
          output: res.result,
        });
      } catch (e) {
        console.error('Error executing tool', toolName, e);
        chat.addToolOutput({
          state: 'output-error',
          tool: toolName,
          toolCallId,
          errorText: e?.toString() || 'Unknown error',
        });
      }
    },
  });

  return {
    chat,
    model,
    capabilities,
    agentApi,
    executeTool,
    toolRejected,
  };
}
