'use client';

import AiChat from '@/components/custom/ai-chat';
import { useChatBot } from '@/lib/hooks/use-chat-bot';

const ChatBot = () => {
  const { chat, model, capabilities, needsApproval, executeTool, toolRejected } =
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
      selectedCapabilities={['sites', 'websearch']}
      availabelCapabilities={[
        'sites',
        'assets',
        'personalization',
        'websearch',
      ]}
      needsApprovalRef={needsApproval}
    />
  );
};

export default ChatBot;
