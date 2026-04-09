'use client';

import AiChat from '@/components/custom/ai-chat';
import { useChatBot } from '@/lib/hooks/use-chat-bot';

const PageBuilder = () => {
  const { chat, model, capabilities, agentApi, executeTool, toolRejected } =
    useChatBot();

  return (
    <AiChat
      chat={chat}
      onSetModel={(val) => (model.current = val)}
      onCapabilitiesChange={(val) => (capabilities.current = val)}
      onToolApproved={async (tool) => {
        await executeTool(tool);
      }}
      onToolRejected={async (tool) => {
        await toolRejected(tool);
      }}
      selectedCapabilities={[
        'page_layout',
        'page_management',
        'sites',
        'assets',
        'personalization',
        'websearch',
      ]}
      availabelCapabilities={[
        'page_layout',
        'page_management',
        'sites',
        'assets',
        'personalization',
        'websearch',
      ]}
      agentApiRef={agentApi}
    />
  );
};

export default PageBuilder;
