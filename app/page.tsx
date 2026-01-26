'use client';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithApprovalResponses, lastAssistantMessageIsCompleteWithToolCalls } from 'ai';
import { useAuth } from '@/components/providers/auth';
import { useAppContext, useMarketplaceClient } from '@/components/providers/marketplace';
import { runClientTool } from '@/lib/tools/client';

import AiChat from '@/components/custom/AiChat';
import { useEffect, useRef, useState } from 'react';

type ToolExecution = 'frontend' | 'backend';

const toolExecution: ToolExecution = 'backend';

const ChatBotServerTools = () => {
  const model = useRef<string | undefined>(undefined);
  const appContext = useAppContext();
  const chat = useChat({
    transport: new DefaultChatTransport({
      api: '/api/agents',
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
        }
      },
    }),
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithApprovalResponses,
  });
  const { getAccessTokenSilently } = useAuth();
  return (
    <AiChat chat={chat} onSetModel={val => model.current = val} />
  );
}

const ChatBotClientTools = () => {
  const client = useMarketplaceClient();
  const model = useRef<string | undefined>(undefined);
  const chat = useChat({
    transport: new DefaultChatTransport({
      api: '/api/agents-client',
      body: () => {
        return {
          model: model.current,
        }
      }
    }),
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    async onToolCall({ toolCall }) {
      if (toolCall.dynamic) {
        return;
      }
      const { toolName, toolCallId } = toolCall;
      const sitecoreContextId = appContext?.resourceAccess?.[0]?.context?.preview;
      const res = await runClientTool(client, sitecoreContextId, toolCall);
      if (!res) {
        return;
      }
      chat.addToolOutput({
        tool: toolName,
        toolCallId: toolCallId,
        output: res,
      });
    },
  });
  const appContext = useAppContext();
  return (
    <AiChat chat={chat} onSetModel={val => model.current = val} />
  );
}

const ChatBotDemo = () => {
  if (toolExecution === 'frontend' as ToolExecution) {
    return <ChatBotClientTools />;
  }
  return <ChatBotServerTools />;
};
export default ChatBotDemo;
