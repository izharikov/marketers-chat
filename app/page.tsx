'use client';
import {
  type PromptInputMessage,
} from '@/components/ai-elements/prompt-input';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls } from 'ai';
import { useAuth } from '@/components/providers/auth';
import { useAppContext, useMarketplaceClient } from '@/components/providers/marketplace';
import { runClientTool } from '@/lib/agents/client';

import AiChat from '@/components/custom/AiChat';

type ToolExecution = 'frontend' | 'backend';

const toolExecution: ToolExecution = 'frontend';

const ChatBotServerTools = () => {
  const chat = useChat({
    transport: new DefaultChatTransport({
      api: '/api/agents',
    }),
  });
  const { getAccessTokenSilently } = useAuth();
  const appContext = useAppContext();
  const handleSubmit = async ({ message, model }: { message: PromptInputMessage, model: string }) => {
    const hasText = Boolean(message.text);
    const hasAttachments = Boolean(message.files?.length);
    if (!(hasText || hasAttachments)) {
      return;
    }
    const accessToken = await getAccessTokenSilently();
    chat.sendMessage(
      {
        text: message.text || 'Sent with attachments',
        files: message.files
      },
      {
        body: {
          model: model,
          contextId: appContext?.resourceAccess?.[0]?.context?.preview,
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
  };
  return (
    <AiChat chat={chat} handleSubmit={handleSubmit} />
  );
}

const ChatBotClientTools = () => {
  const client = useMarketplaceClient();
  const chat = useChat({
    transport: new DefaultChatTransport({
      api: '/api/agents-client',
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
    }
  });
  const appContext = useAppContext();
  const handleSubmit = async ({ message, model }: { message: PromptInputMessage, model: string }) => {
    const hasText = Boolean(message.text);
    const hasAttachments = Boolean(message.files?.length);
    if (!(hasText || hasAttachments)) {
      return;
    }
    chat.sendMessage(
      {
        text: message.text || 'Sent with attachments',
        files: message.files
      },
      {
        body: {
          model: model,
        },
      },
    );
  };
  return (
    <AiChat chat={chat} handleSubmit={handleSubmit} />
  );
}

const ChatBotDemo = () => {
  if (toolExecution === 'frontend') {
    return <ChatBotClientTools />;
  }
  return <ChatBotServerTools />;
};
export default ChatBotDemo;
