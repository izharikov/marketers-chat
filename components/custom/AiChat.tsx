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
    MessageAttachments,
    MessageAttachment,
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
    PromptInputSubmit,
    PromptInputTextarea,
    PromptInputFooter,
    PromptInputTools,
    PromptInputButton,
    PromptInputActionMenuItem,
} from '@/components/ai-elements/prompt-input';
import { type Capability } from '@/lib/tools/xmc';
import {
    Tool,
    ToolContent,
    ToolHeader,
    ToolInput,
    ToolOutput,
} from '@/components/ai-elements/tool';
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
import React, { Fragment, useEffect, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import {
    CheckIcon,
    CopyIcon,
    GlobeIcon,
    RefreshCcwIcon,
    XIcon,
    LayoutIcon,
    ImageIcon,
    UsersIcon,
    ZapIcon,
    Wrench
} from 'lucide-react';
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
import { Attachment, AttachmentItem, AttachmentPreview, Attachments } from '../ai-elements/attachments';

const models = [
    {
        id: 'openai/gpt-5-nano',
        name: 'GPT 5 Nano',
        chef: 'OpenAI',
        chefSlug: 'openai',
    },
    {
        id: 'openai/gpt-5.2',
        name: 'GPT 5.2',
        chef: 'OpenAI',
        chefSlug: 'openai',
    },
    {
        id: 'anthropic/claude-opus-4.5',
        name: 'Claude Opus 4.5',
        chef: 'Anthropic',
        chefSlug: 'anthropic',
    },
    {
        id: 'google/gemini-2.0-pro',
        name: 'Gemini 2.0 Pro',
        chef: 'Google',
        chefSlug: 'google',
    },
];

const allCapabilities: { id: Capability; label: string; icon: React.ReactNode }[] = [
    {
        id: 'page_layout',
        label: 'Page Layout',
        icon: <LayoutIcon className="size-4" />
    },
    {
        id: 'assets',
        label: 'Assets',
        icon: <ImageIcon className="size-4" />
    },
    {
        id: 'personalization',
        label: 'Personalization',
        icon: <UsersIcon className="size-4" />
    },
];

type AiChatProps = {
    chat: ReturnType<typeof useChat>,
    onSetModel: (model: string) => void;
    onCapabilitiesChange?: (capabilities: Capability[]) => void;
    onToolApproved?: (tool: ToolUIPart) => Promise<void>;
    onToolRejected?: (tool: ToolUIPart) => Promise<void>;
};

const AiChat = ({ chat, onSetModel, onCapabilitiesChange, onToolApproved, onToolRejected }: AiChatProps) => {
    const [input, setInput] = useState('');
    const [model, setModel] = useState<string>(models[0].id);
    const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
    const selectedModelData = models.find((m) => m.id === model);

    const [capabilities, setCapabilities] = useState<Capability[]>(['page_layout']);
    const toggleCapability = (cap: Capability) => {
        setCapabilities(prev =>
            prev.includes(cap) ? prev.filter(c => c !== cap) : [...prev, cap]
        );
    };
    useEffect(() => {
        onSetModel(model);
    }, [model]);
    useEffect(() => {
        onCapabilitiesChange?.(capabilities);
    }, [capabilities]);
    useEffect(() => {
        console.log('set model', model);
    }, []);
    const { messages, regenerate, status } = chat;
    return (
        <div className="max-w-4xl mx-auto p-6 relative size-full h-screen">
            <div className="flex flex-col h-full">
                <Conversation className="h-full">
                    <ConversationContent>
                        {messages.map((message, messagesIndex) => (
                            <div key={message.id}>
                                <Message key={`${message.id}`} from={message.role}>
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
                                    {
                                        message.parts.filter((part) => part.type === 'file').length > 0 && (
                                            <MessageAttachments>
                                                <Attachments variant="inline">
                                                    {message.parts.filter((part) => part.type === 'file').map((part, i) => (
                                                        <AttachmentItem
                                                            key={`${message.id}-${i}`}
                                                            data={{ id: `${message.id}-${i}`, ...part }}
                                                        />
                                                    ))}
                                                </Attachments>
                                            </MessageAttachments>
                                        )}
                                    {message.parts.map((part, i) => {
                                        switch (part.type) {
                                            case 'text':
                                                return (
                                                    <React.Fragment key={`${message.id}-${i}`}>
                                                        <MessageContent className='text-base'>
                                                            <MessageResponse>
                                                                {part.text}
                                                            </MessageResponse>
                                                        </MessageContent>
                                                        {message.role === 'assistant' && messagesIndex === messages.length - 1 && i === message.parts.length - 1 && (
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
                                                    </React.Fragment>
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
                                </Message>
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
                            <PromptInputActionMenu>
                                <PromptInputActionMenuTrigger>
                                    <Wrench />
                                    <span className="text-xs font-semibold whitespace-nowrap max-w-24 truncate">
                                        {capabilities.map(cap => allCapabilities.find(c => c.id === cap)?.label).join(', ')}
                                    </span>
                                </PromptInputActionMenuTrigger>
                                <PromptInputActionMenuContent>
                                    {allCapabilities.map((cap) => (
                                        <PromptInputActionMenuItem
                                            key={cap.id}
                                            onSelect={(e) => {
                                                e.preventDefault();
                                                toggleCapability(cap.id);
                                            }}
                                        >
                                            {cap.icon}
                                            <span className="ml-2 flex-1">{cap.label}</span>
                                            {capabilities.includes(cap.id) && (
                                                <CheckIcon className="ml-auto size-4" />
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
                                                className="size-6"
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
                                    <ModelSelectorInput placeholder="Search models..." />
                                    <ModelSelectorList>
                                        <ModelSelectorEmpty>No models found.</ModelSelectorEmpty>
                                        {["OpenAI", "Anthropic", "Google"].map((chef) => (
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
                                                            <ModelSelectorLogoGroup>
                                                                <ModelSelectorLogo
                                                                    provider='vercel'
                                                                />
                                                            </ModelSelectorLogoGroup>
                                                            {model === m.id ? (
                                                                <CheckIcon className="ml-auto size-4" />
                                                            ) : (
                                                                <div className="ml-auto size-4" />
                                                            )}
                                                        </ModelSelectorItem>
                                                    ))}
                                            </ModelSelectorGroup>
                                        ))}
                                    </ModelSelectorList>
                                </ModelSelectorContent>
                            </ModelSelector>
                        </PromptInputTools>
                        <PromptInputSubmit disabled={!input && !status} status={status} />
                    </PromptInputFooter>
                </PromptInput>
            </div>
        </div>
    );
};
export default AiChat;
