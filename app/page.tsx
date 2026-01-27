'use client';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithApprovalResponses, lastAssistantMessageIsCompleteWithToolCalls, ToolCallPart, ToolUIPart } from 'ai';
import { useAuth } from '@/components/providers/auth';
import { useAppContext, useMarketplaceClient } from '@/components/providers/marketplace';
import { runClientTool } from '@/lib/tools/client';

import AiChat from '@/components/custom/AiChat';
import { useRef } from 'react';

type ToolExecution = 'frontend' | 'backend';

const toolExecution: ToolExecution = 'frontend';

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

  const executeTool = async (toolPart: ToolUIPart) => {
    const toolName = toolPart.type.substring('tool-'.length);
    const sitecoreContextId = appContext?.resourceAccess?.[0]?.context?.preview;
    const res = await runClientTool(client, sitecoreContextId, { toolName, input: toolPart.input });
    if (!res) {
      return;
    }
    chat.addToolOutput({
      tool: toolName,
      toolCallId: toolPart.toolCallId,
      output: res,
    });
  }

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
    onFinish: async ({ message, finishReason }) => {
      // if tool was finished because of tool call
      if (finishReason === 'tool-calls') {
        const toolPart = message.parts.reverse()[0] as ToolUIPart;
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
    },
  });
  const appContext = useAppContext();
  return (
    <AiChat chat={chat} onSetModel={val => model.current = val} onToolApproved={async (tool) => {
      await executeTool(tool);
    }}
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
