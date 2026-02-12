'use client';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, FinishReason, lastAssistantMessageIsCompleteWithApprovalResponses, lastAssistantMessageIsCompleteWithToolCalls, tool, ToolCallPart, ToolUIPart } from 'ai';
import { useAuth } from '@/components/providers/auth';
import { useAppContext, useMarketplaceClient } from '@/components/providers/marketplace';
import { runClientTool } from '@/lib/tools/xmc/client';

import AiChat from '@/components/custom/AiChat';
import { useEffect, useRef, useState } from 'react';
import { useApiKey, useAppSettings } from '@/components/providers/app-settings-provider';
import { executeClientSideTool } from '@/lib/tools/client-side';
import { Capability } from '@/lib/tools/xmc';
import { toast } from 'sonner';

type ToolExecution = 'frontend' | 'backend';

const toolExecution: ToolExecution = 'backend';

const ChatBotServerTools = () => {
  const { localSettings } = useAppSettings();
  const model = useRef<string | undefined>(undefined);
  const capabilities = useRef<Capability[]>([]);
  const needsApproval = useRef<boolean>(localSettings.needsToolApproval);
  useEffect(() => {
    needsApproval.current = localSettings.needsToolApproval;
  }, [localSettings]);
  const appContext = useAppContext();
  const apiKey = useApiKey('vercel');
  const chat = useChat({
    transport: new DefaultChatTransport({
      api: '/api/editors-agent',
      body: () => {
        return {
          model: model.current,
          toolExecution,
          contextId: appContext?.resourceAccess?.[0]?.context?.preview,
          capabilities: capabilities.current,
          needsApproval: needsApproval.current,
        }
      },
      headers: async () => {
        const accessToken = await getAccessTokenSilently();
        return {
          Authorization: `Bearer ${accessToken}`,
          'x-vercel-api-key': apiKey!,
        }
      },
    }),
    sendAutomaticallyWhen: (opts) => {
      return lastAssistantMessageIsCompleteWithApprovalResponses(opts) || lastAssistantMessageIsCompleteWithToolCalls(opts);
    },
    onToolCall: async ({ toolCall }) => {
      const sitecoreContextId = appContext?.resourceAccess?.[0]?.context?.preview!;
      const { toolName, toolCallId, input } = toolCall;
      try {
        const res = await executeClientSideTool({ client, sitecoreContextId }, toolName, input, true);
        if (!res) {
          return;
        }
        chat.addToolOutput({
          tool: toolName,
          toolCallId,
          output: res,
        });
      } catch (e) {
        console.error('Error executing tool', toolName, e);
        chat.addToolOutput({
          state: "output-error",
          tool: toolName,
          toolCallId,
          errorText: e?.toString()!,
        });
      }
    }
  });
  const { getAccessTokenSilently } = useAuth();
  const client = useMarketplaceClient();

  return (
    <AiChat
      chat={chat}
      onSetModel={val => model.current = val}
      selectedCapabilities={['page_layout']}
      availabelCapabilities={['page_layout', 'sites', 'assets', 'personalization']}
      onCapabilitiesChange={val => capabilities.current = val}
    />
  );
}

const ChatBotClientTools = () => {
  const client = useMarketplaceClient();
  const { localSettings } = useAppSettings();
  const model = useRef<string | undefined>(undefined);
  const capabilities = useRef<Capability[]>([]);
  const needsApproval = useRef<boolean>(localSettings.needsToolApproval);
  useEffect(() => {
    needsApproval.current = localSettings.needsToolApproval;
  }, [localSettings]);
  const apiKey = useApiKey('vercel');

  const executeTool = async (toolPart: ToolUIPart) => {
    const toolName = toolPart.type.substring('tool-'.length);
    const sitecoreContextId = appContext?.resourceAccess?.[0]?.context?.preview!;
    try {
      let res = await runClientTool(client, sitecoreContextId, { toolName, input: toolPart.input });
      if (!res) {
        res = await executeClientSideTool({ client, sitecoreContextId }, toolName, toolPart.input);
      }
      if (!res) {
        return;
      }
      chat.addToolOutput({
        tool: toolName,
        toolCallId: toolPart.toolCallId,
        output: res,
      });
    } catch (e) {
      console.error('Error executing tool', toolName, e);
      chat.addToolOutput({
        state: "output-error",
        tool: toolName,
        toolCallId: toolPart.toolCallId,
        errorText: e?.toString()!,
      });
    }
  }

  const toolRejected = async (toolPart: ToolUIPart) => {
    chat.addToolOutput({
      tool: toolPart.type.substring('tool-'.length),
      toolCallId: toolPart.toolCallId,
      output: 'ERROR: User rejected tool execution.',
    });
  }

  const chat = useChat({
    transport: new DefaultChatTransport({
      api: '/api/editors-agent',
      headers: {
        'x-vercel-api-key': apiKey!,
      },
      body: () => {
        return {
          model: model.current,
          capabilities: capabilities.current,
          needsApproval: needsApproval.current,
        }
      }
    }),
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    onError: (error) => {
      toast('Error in chat');
    },
    onFinish: async ({ message, finishReason }) => {
      // if tool was finished because of tool call
      if (finishReason !== 'tool-calls') {
        return;
      }
      for (const part of message.parts) {
        if (!part.type.startsWith('tool')) {
          continue;
        }
        const toolPart = part as ToolUIPart;
        if (toolPart.type.startsWith('tool')) {
          // if approve was requested - should be handled in Confirmation section
          if (toolPart.state === 'approval-requested') {
            return;
          }
          // if input is available - run tool
          if (toolPart.state === 'input-available') {
            await executeTool(toolPart);
          }
        }
      }
    },
  });
  const appContext = useAppContext();
  return (
    <AiChat
      chat={chat}
      onSetModel={val => model.current = val}
      onCapabilitiesChange={val => capabilities.current = val}
      onToolApproved={async (tool) => {
        await executeTool(tool);
      }} onToolRejected={async (tool) => {
        await toolRejected(tool);
      }}
      selectedCapabilities={['page_layout']}
      availabelCapabilities={['page_layout', 'sites', 'assets', 'personalization']}
    />
  );
}

const ChatBotDemo = () => {
  if (toolExecution === 'frontend' as ToolExecution) {
    return <ChatBotClientTools />;
  }
  return <ChatBotServerTools />;
};
export default ChatBotDemo;
