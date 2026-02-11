'use client';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, FinishReason, lastAssistantMessageIsCompleteWithApprovalResponses, lastAssistantMessageIsCompleteWithToolCalls, tool, ToolCallPart, ToolUIPart } from 'ai';
import { useAuth } from '@/components/providers/auth';
import { useAppContext, useMarketplaceClient } from '@/components/providers/marketplace';
import { runClientTool } from '@/lib/tools/xmc/client';

import AiChat from '@/components/custom/AiChat';
import { useRef, useState } from 'react';
import { useApiKey } from '@/components/providers/api-key-provider';
import { executeClientSideTool } from '@/lib/tools/client-side';
import { Capability } from '@/lib/tools/xmc';

type ToolExecution = 'frontend' | 'backend';

const toolExecution: ToolExecution = 'frontend';

const ChatBotServerTools = () => {
  const model = useRef<string | undefined>(undefined);
  const appContext = useAppContext();
  const apiKey = useApiKey('vercel');
  const chat = useChat({
    transport: new DefaultChatTransport({
      api: '/api/editors-agent',
      body: () => {
        return {
          model: model.current,
          contextId: appContext?.resourceAccess?.[0]?.context?.preview,
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
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithApprovalResponses,
  });
  const { getAccessTokenSilently } = useAuth();
  return (
    <AiChat
      chat={chat}
      onSetModel={val => model.current = val}
      selectedCapabilities={['page_layout']}
      availabelCapabilities={['page_layout', 'sites', 'assets', 'personalization']}
    />
  );
}

const ChatBotClientTools = () => {
  const client = useMarketplaceClient();
  const model = useRef<string | undefined>(undefined);
  const capabilities = useRef<Capability[]>([]);
  const apiKey = useApiKey('vercel');

  const executeTool = async (toolPart: ToolUIPart) => {
    const toolName = toolPart.type.substring('tool-'.length);
    const sitecoreContextId = appContext?.resourceAccess?.[0]?.context?.preview;
    try {
      let res = await runClientTool(client, sitecoreContextId, { toolName, input: toolPart.input });
      if (!res) {
        res = await executeClientSideTool(client, toolName, toolPart.input);
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
          needsApproval: true,
        }
      }
    }),
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
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
        // ensure it is a tool call
        if (toolPart.type.startsWith('tool')) {
          // if approve was requested - should be handled in Confirmation section
          if (toolPart.state === 'approval-requested') {
            return;
          }
          // if input is available - run tests
          if (toolPart.state === 'input-available') {
            await executeTool(toolPart);
          }
        }
      }
    }
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
      selectedCapabilities={['sites']}
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
