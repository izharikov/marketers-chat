'use client';

import React, { useEffect, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { ToolUIPart, UIMessage } from 'ai';
import {
  CheckIcon,
  CopyIcon,
  Ellipsis,
  RefreshCcwIcon,
  Settings,
  Wrench,
} from 'lucide-react';
import {
  AttachmentItem,
  Attachments,
} from '@/components/ai-elements/attachments';
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import { Loader } from '@/components/ai-elements/loader';
import {
  Message,
  MessageAction,
  MessageActions,
  MessageAttachments,
} from '@/components/ai-elements/message';
import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorLogo,
  ModelSelectorLogoGroup,
  ModelSelectorName,
  ModelSelectorTrigger,
} from '@/components/ai-elements/model-selector';
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuItem,
  PromptInputActionMenuTrigger,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  PromptInputHeader,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from '@/components/ai-elements/prompt-input';
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from '@/components/ai-elements/sources';
import { ChatMessagePart } from '@/components/custom/chat-message-parts';
import { useAppSettings } from '@/components/providers/app-settings-provider';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Toaster } from '@/components/ui/sonner';
import { allCapabilities } from '@/lib/ai/capability-definitions';
import { models, modelProviders } from '@/lib/ai/models';
import { useChatStatus } from '@/lib/hooks/use-chat-status';
import { useModelSelection } from '@/lib/hooks/use-model-selection';
import { AgentApiSettings } from '@/components/providers/app-settings-provider';
import { Capability } from '@/lib/tools/capabilities';

const initialMessages: UIMessage[] = [];

type AiChatProps = {
  chat: ReturnType<typeof useChat>;
  onSetModel: (model: string) => void;
  onCapabilitiesChange?: (capabilities: Capability[]) => void;
  onToolApproved?: (tool: ToolUIPart) => Promise<void>;
  onToolRejected?: (tool: ToolUIPart) => Promise<void>;
  selectedCapabilities: Capability[];
  availabelCapabilities: Capability[];
  agentApiRef: React.RefObject<AgentApiSettings>;
};

const AiChat = ({
  chat,
  onSetModel,
  onCapabilitiesChange,
  onToolApproved,
  onToolRejected,
  selectedCapabilities,
  availabelCapabilities,
  agentApiRef,
}: AiChatProps) => {
  const { setModalOpen } = useAppSettings();
  const [input, setInput] = useState('');

  const {
    model,
    setModel,
    modelSelectorOpen,
    setModelSelectorOpen,
    selectedModelData,
    capabilities,
    toggleCapability,
  } = useModelSelection(selectedCapabilities, onSetModel, onCapabilitiesChange);

  const { messages, setMessages, regenerate, status, sendMessage } = chat;

  const { computedStatus, submitEnabled } = useChatStatus(
    messages,
    status,
    input.length
  );

  useEffect(() => {
    setMessages(initialMessages);
  }, [setMessages]);

  const handleRevert = (jobId: string) => {
    sendMessage({
      role: 'user',
      parts: [
        {
          type: 'text',
          text: "`revert_operation('" + jobId + "')`",
        },
        {
          type: 'data-revert',
          data: {
            jobId,
          },
        },
      ],
    });
  };

  return (
    <div className='max-w-4xl mx-auto px-6 pb-4 relative size-full h-screen'>
      <div className='flex flex-col h-full'>
        <div className='flex flex-col mb-2 border-b'>
          <div className='flex justify-end'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' size='icon-sm'>
                  <Ellipsis />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => setModalOpen?.(true)}>
                    <Settings />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setMessages(initialMessages)}
                  >
                    <RefreshCcwIcon />
                    Restart chat
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <Toaster />
        <Conversation className='h-full'>
          <ConversationContent>
            {messages.map((message, messagesIndex) => (
              <Message key={`${message.id}`} from={message.role}>
                {message.role === 'assistant' &&
                  message.parts.filter((part) => part.type === 'source-url')
                    .length > 0 && (
                    <Sources>
                      <SourcesTrigger
                        count={
                          message.parts.filter(
                            (part) => part.type === 'source-url'
                          ).length
                        }
                      />
                      {message.parts
                        .filter((part) => part.type === 'source-url')
                        .map((part, i) => (
                          <SourcesContent key={`${message.id}-${i}`}>
                            <Source
                              key={`${message.id}-${i}`}
                              href={part.url}
                              title={part.url}
                            />
                          </SourcesContent>
                        ))}
                    </Sources>
                  )}
                {message.parts.filter((part) => part.type === 'file').length >
                  0 && (
                  <MessageAttachments>
                    <Attachments variant='inline'>
                      {message.parts
                        .filter((part) => part.type === 'file')
                        .map((part, i) => (
                          <AttachmentItem
                            key={`${message.id}-${i}`}
                            data={{ id: `${message.id}-${i}`, ...part }}
                          />
                        ))}
                    </Attachments>
                  </MessageAttachments>
                )}
                {message.parts.map((part, i) => (
                  <ChatMessagePart
                    key={`${message.id}-part-${i}`}
                    part={part}
                    partIndex={i}
                    messageId={message.id}
                    isLastPart={i === message.parts.length - 1}
                    isLastMessage={message.id === messages.at(-1)?.id}
                    status={status}
                    chat={chat}
                    onToolApproved={onToolApproved}
                    onToolRejected={onToolRejected}
                    agentApiRef={agentApiRef}
                    onRevert={handleRevert}
                  />
                ))}
                {computedStatus === 'idle' &&
                  message.role === 'assistant' &&
                  messagesIndex === messages.length - 1 &&
                  !message.parts.some(
                    (part) => part.type === 'tool-revert'
                  ) && (
                    <MessageActions>
                      <MessageAction onClick={() => regenerate()} label='Retry'>
                        <RefreshCcwIcon className='size-3' />
                      </MessageAction>
                      <MessageAction
                        onClick={() =>
                          navigator.clipboard.writeText(
                            message.parts
                              .map((part) =>
                                part.type === 'text' ? part.text : ''
                              )
                              .join('')
                          )
                        }
                        label='Copy'
                      >
                        <CopyIcon className='size-3' />
                      </MessageAction>
                    </MessageActions>
                  )}
              </Message>
            ))}
            {computedStatus === 'busy' && (
              <div className='relative mx-auto h-[20px]'>
                <Loader className='absolute bottom-0 left-0' />
              </div>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
        <PromptInput
          onSubmit={(message) => {
            chat.sendMessage(message);
            setInput('');
          }}
          className='mt-4'
          globalDrop
          multiple
        >
          <PromptInputHeader>
            <PromptInputAttachments>
              {(attachment) => <PromptInputAttachment data={attachment} />}
            </PromptInputAttachments>
          </PromptInputHeader>
          <PromptInputBody>
            <PromptInputTextarea
              onChange={(e) => {
                setInput(e.target.value);
              }}
              value={input}
            />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools>
              <PromptInputActionMenu>
                <PromptInputActionMenuTrigger />
                <PromptInputActionMenuContent>
                  <PromptInputActionAddAttachments />
                </PromptInputActionMenuContent>
              </PromptInputActionMenu>
              <PromptInputActionMenu>
                <PromptInputActionMenuTrigger>
                  <Wrench />
                  <span className='text-xs font-semibold whitespace-nowrap max-w-24 truncate'>
                    {capabilities
                      .map(
                        (cap) =>
                          allCapabilities.find((c) => c.id === cap)?.label
                      )
                      .join(', ')}
                  </span>
                </PromptInputActionMenuTrigger>
                <PromptInputActionMenuContent>
                  {allCapabilities
                    .filter((cap) => availabelCapabilities.includes(cap.id))
                    .map((cap) => (
                      <PromptInputActionMenuItem
                        key={cap.id}
                        onSelect={(e) => {
                          e.preventDefault();
                          toggleCapability(cap.id);
                        }}
                      >
                        {cap.icon}
                        <span className='ml-2 flex-1'>{cap.label}</span>
                        {capabilities.includes(cap.id) && (
                          <CheckIcon className='ml-auto size-4' />
                        )}
                      </PromptInputActionMenuItem>
                    ))}
                </PromptInputActionMenuContent>
              </PromptInputActionMenu>
              <ModelSelector
                onOpenChange={setModelSelectorOpen}
                open={modelSelectorOpen}
              >
                <ModelSelectorTrigger asChild>
                  <PromptInputButton>
                    {selectedModelData?.chefSlug && (
                      <ModelSelectorLogo
                        provider={selectedModelData.chefSlug}
                        className='size-6'
                      />
                    )}
                    {selectedModelData?.name && (
                      <ModelSelectorName>
                        {selectedModelData.name}
                      </ModelSelectorName>
                    )}
                  </PromptInputButton>
                </ModelSelectorTrigger>
                <ModelSelectorContent>
                  <ModelSelectorInput placeholder='Search models...' />
                  <ModelSelectorList>
                    <ModelSelectorEmpty>No models found.</ModelSelectorEmpty>
                    {modelProviders.map((chef) => (
                      <ModelSelectorGroup heading={chef} key={chef}>
                        {models
                          .filter((m) => m.chef === chef)
                          .map((m) => (
                            <ModelSelectorItem
                              key={m.id}
                              onSelect={() => {
                                setModel(m.id);
                                setModelSelectorOpen(false);
                              }}
                              value={m.id}
                            >
                              <ModelSelectorLogo provider={m.chefSlug} />
                              <ModelSelectorName>{m.name}</ModelSelectorName>
                              <span className='text-xs text-muted-foreground tabular-nums'>
                                ${m.pricing.input} / ${m.pricing.output}
                              </span>
                              <ModelSelectorLogoGroup>
                                <ModelSelectorLogo provider='vercel' />
                              </ModelSelectorLogoGroup>
                              {model === m.id ? (
                                <CheckIcon className='ml-auto size-4' />
                              ) : (
                                <div className='ml-auto size-4' />
                              )}
                            </ModelSelectorItem>
                          ))}
                      </ModelSelectorGroup>
                    ))}
                  </ModelSelectorList>
                </ModelSelectorContent>
              </ModelSelector>
            </PromptInputTools>
            <PromptInputSubmit
              disabled={!submitEnabled}
              status={computedStatus === 'busy' ? 'submitted' : 'ready'}
              onClick={(event) => {
                if (status === 'streaming' || status === 'submitted') {
                  chat.stop();
                  event.preventDefault();
                }
              }}
            />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
};
export default AiChat;
