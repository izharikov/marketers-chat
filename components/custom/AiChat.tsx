'use client';
import {
    Conversation,
    ConversationContent,
    ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import {
    Confirmation,
    ConfirmationAccepted,
    ConfirmationAction,
    ConfirmationActions,
    ConfirmationRejected,
    ConfirmationRequest,
    ConfirmationTitle,
} from "@/components/ai-elements/confirmation";
import {
    Message,
    MessageContent,
    MessageResponse,
    MessageActions,
    MessageAction,
} from '@/components/ai-elements/message';
import {
    PromptInput,
    PromptInputActionAddAttachments,
    PromptInputActionMenu,
    PromptInputActionMenuContent,
    PromptInputActionMenuTrigger,
    PromptInputAttachment,
    PromptInputAttachments,
    PromptInputBody,
    PromptInputHeader,
    type PromptInputMessage,
    PromptInputSelect,
    PromptInputSelectContent,
    PromptInputSelectItem,
    PromptInputSelectTrigger,
    PromptInputSelectValue,
    PromptInputSubmit,
    PromptInputTextarea,
    PromptInputFooter,
    PromptInputTools,
} from '@/components/ai-elements/prompt-input';
import {
    Tool,
    ToolContent,
    ToolHeader,
    ToolInput,
    ToolOutput,
} from '@/components/ai-elements/tool';
import { Fragment, useEffect, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { CheckIcon, CopyIcon, GlobeIcon, RefreshCcwIcon, XIcon } from 'lucide-react';
import {
    Source,
    Sources,
    SourcesContent,
    SourcesTrigger,
} from '@/components/ai-elements/sources';
import {
    Reasoning,
    ReasoningContent,
    ReasoningTrigger,
} from '@/components/ai-elements/reasoning';
import { Loader } from '@/components/ai-elements/loader';
import { ToolUIPart } from 'ai';

const models = [

    {
        name: 'GPT 5 Nano',
        value: 'openai/gpt-5-nano',
    },
    {
        name: 'GPT 5.2',
        value: 'openai/gpt-5.2',
    },
    {
        name: 'Claude Opus 4.5',
        value: 'anthropic/claude-opus-4.5',
    }
];

type AiChatProps = {
    chat: ReturnType<typeof useChat>,
    onSetModel: (model: string) => void;
    onToolApproved?: (tool: ToolUIPart) => Promise<void>;
    onToolRejected?: (tool: ToolUIPart) => Promise<void>;
};

const AiChat = ({ chat, onSetModel, onToolApproved, onToolRejected }: AiChatProps) => {
    const [input, setInput] = useState('');
    const [model, setModel] = useState<string>(models[0].value);
    useEffect(() => {
        onSetModel(model);
    }, [model]);
    useEffect(() => {
        console.log('set model', model);
    }, []);
    const { messages, regenerate, status } = chat;
    return (
        <div className="max-w-4xl mx-auto p-6 relative size-full h-screen">
            <div className="flex flex-col h-full">
                <Conversation className="h-full">
                    <ConversationContent>
                        {messages.map((message) => (
                            <div key={message.id}>
                                {message.role === 'assistant' && message.parts.filter((part) => part.type === 'source-url').length > 0 && (
                                    <Sources>
                                        <SourcesTrigger
                                            count={
                                                message.parts.filter(
                                                    (part) => part.type === 'source-url',
                                                ).length
                                            }
                                        />
                                        {message.parts.filter((part) => part.type === 'source-url').map((part, i) => (
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
                                {message.parts.map((part, i) => {
                                    switch (part.type) {
                                        case 'text':
                                            return (
                                                <Message key={`${message.id}-${i}`} from={message.role}>
                                                    <MessageContent className='text-base'>
                                                        <MessageResponse>
                                                            {part.text}
                                                        </MessageResponse>
                                                    </MessageContent>
                                                    {message.role === 'assistant' && i === messages.length - 1 && (
                                                        <MessageActions>
                                                            <MessageAction
                                                                onClick={() => regenerate()}
                                                                label="Retry"
                                                            >
                                                                <RefreshCcwIcon className="size-3" />
                                                            </MessageAction>
                                                            <MessageAction
                                                                onClick={() =>
                                                                    navigator.clipboard.writeText(part.text)
                                                                }
                                                                label="Copy"
                                                            >
                                                                <CopyIcon className="size-3" />
                                                            </MessageAction>
                                                        </MessageActions>
                                                    )}
                                                </Message>
                                            );
                                        case 'reasoning':
                                            return (
                                                <Reasoning
                                                    key={`${message.id}-${i}`}
                                                    className="w-full"
                                                    isStreaming={status === 'streaming' && i === message.parts.length - 1 && message.id === messages.at(-1)?.id}
                                                >
                                                    <ReasoningTrigger />
                                                    <ReasoningContent>{part.text}</ReasoningContent>
                                                </Reasoning>
                                            );
                                        default:
                                            if (part.type.startsWith('tool')) {
                                                const tool = part as ToolUIPart;
                                                let state = tool.state;
                                                if (tool.output && tool.output.toString().startsWith('ERROR')) {
                                                    state = 'output-error';
                                                }
                                                return <Fragment key={`${message.id}-${tool.toolCallId}`}>
                                                    <Tool defaultOpen={false}>
                                                        <ToolHeader type={tool.type} state={state} />
                                                        <ToolContent>
                                                            {!!tool.input && <ToolInput input={tool.input} />}
                                                            {tool.state === 'output-error' && !!tool.rawInput && <ToolInput input={tool.rawInput} />}
                                                            {!!(tool.output || tool.errorText) && <ToolOutput
                                                                output={tool.output}
                                                                errorText={tool.errorText}
                                                            />}
                                                        </ToolContent>
                                                    </Tool>
                                                    {state === 'approval-requested' && <Confirmation approval={tool.approval} state={tool.state} className='flex-row'>
                                                        <ConfirmationTitle>
                                                            <div className='flex'>
                                                                <ConfirmationRequest>
                                                                    Do you want to execute this tool?
                                                                </ConfirmationRequest>
                                                                <ConfirmationAccepted>
                                                                    <CheckIcon className="size-4 text-green-600 dark:text-green-400 my-auto mr-1" />
                                                                    <span>Accepted</span>
                                                                </ConfirmationAccepted>
                                                                <ConfirmationRejected>
                                                                    <XIcon className="size-4 text-destructive my-auto mr-1" />
                                                                    <span>Rejected</span>
                                                                </ConfirmationRejected>
                                                            </div>
                                                        </ConfirmationTitle>
                                                        <ConfirmationActions>
                                                            <ConfirmationAction
                                                                onClick={async () => {
                                                                    await chat.addToolApprovalResponse({
                                                                        id: tool.approval?.id!,
                                                                        approved: false,
                                                                    });
                                                                    await onToolRejected?.(tool);
                                                                }}
                                                                variant="outline"
                                                            >
                                                                Reject
                                                            </ConfirmationAction>
                                                            <ConfirmationAction
                                                                onClick={async () => {
                                                                    await chat.addToolApprovalResponse({
                                                                        id: tool.approval?.id!,
                                                                        approved: true,
                                                                    });
                                                                    await onToolApproved?.(tool);
                                                                }}
                                                                variant="default"
                                                            >
                                                                Accept
                                                            </ConfirmationAction>
                                                        </ConfirmationActions>
                                                    </Confirmation>}
                                                </Fragment>
                                            }
                                            return null;
                                    }
                                })}
                            </div>
                        ))}
                        {status === 'submitted' && <Loader />}
                    </ConversationContent>
                    <ConversationScrollButton />
                </Conversation>
                <PromptInput onSubmit={message => {
                    chat.sendMessage(message);
                    setInput('');
                }} className="mt-4" globalDrop multiple>
                    <PromptInputHeader>
                        <PromptInputAttachments>
                            {(attachment) => <PromptInputAttachment data={attachment} />}
                        </PromptInputAttachments>
                    </PromptInputHeader>
                    <PromptInputBody>
                        <PromptInputTextarea
                            onChange={(e) => setInput(e.target.value)}
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
                            <PromptInputSelect
                                onValueChange={(value) => {
                                    setModel(value);
                                }}
                                value={model}
                            >
                                <PromptInputSelectTrigger>
                                    <PromptInputSelectValue />
                                </PromptInputSelectTrigger>
                                <PromptInputSelectContent>
                                    {models.map((model) => (
                                        <PromptInputSelectItem key={model.value} value={model.value}>
                                            {model.name}
                                        </PromptInputSelectItem>
                                    ))}
                                </PromptInputSelectContent>
                            </PromptInputSelect>
                        </PromptInputTools>
                        <PromptInputSubmit disabled={!input && !status} status={status} />
                    </PromptInputFooter>
                </PromptInput>
            </div>
        </div>
    );
};
export default AiChat;
