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
  useApiKey,
  useAppSettings,
} from '@/components/providers/app-settings-provider';
import { useAuth } from '@/components/providers/auth';
import {
  useAppContext,
  useMarketplaceClient,
} from '@/components/providers/marketplace';
import { Capability } from '@/lib/tools/capabilities';

export function useChatBot() {
  const client = useMarketplaceClient();
  const { getAccessTokenSilently } = useAuth();
  const { localSettings } = useAppSettings();
  const model = useRef<string | undefined>(undefined);
  const capabilities = useRef<Capability[]>([]);
  const needsApproval = useRef<boolean>(localSettings.needsToolApproval);
  const sitecoreToolExecutionRef = useRef<string>(
    localSettings.sitecoreToolsExecution
  );
  const appContext = useAppContext();

  useEffect(() => {
    needsApproval.current = localSettings.needsToolApproval;
    sitecoreToolExecutionRef.current = localSettings.sitecoreToolsExecution;
  }, [localSettings]);

  const apiKey = useApiKey('vercel');
  const exaApiKey = useApiKey('exa');

  const executeTool = async (toolPart: ToolUIPart) => {
    const toolName = toolPart.type.substring('tool-'.length);
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
      chat.addToolOutput({
        state: 'output-error',
        tool: toolName,
        toolCallId: toolPart.toolCallId,
        errorText: e?.toString() || 'Unknown error',
      });
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
        if (sitecoreToolExecutionRef.current === 'backend') {
          const accessToken = await getAccessTokenSilently();
          authorization['Authorization'] = `Bearer ${accessToken}`;
        }
        return {
          'x-vercel-api-key': apiKey!,
          'x-exa-api-key': exaApiKey!,
          ...authorization,
        };
      },
      body: () => {
        return {
          model: model.current,
          sitecoreToolsExecution: sitecoreToolExecutionRef.current,
          contextId: appContext?.resourceAccess?.[0]?.context?.preview,
          capabilities: capabilities.current,
          needsApproval: needsApproval.current,
        };
      },
    }),
    sendAutomaticallyWhen: (opts) => {
      if (sitecoreToolExecutionRef.current === 'frontend') {
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
      if (sitecoreToolExecutionRef.current === 'backend') {
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
      if (sitecoreToolExecutionRef.current === 'frontend') {
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
    needsApproval,
    executeTool,
    toolRejected,
  };
}
