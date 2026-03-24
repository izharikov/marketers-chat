'use client';

import React, { Fragment } from 'react';
import { useChat } from '@ai-sdk/react';
import { ToolUIPart } from 'ai';
import { CheckIcon, Undo, XIcon } from 'lucide-react';
import {
  Confirmation,
  ConfirmationAccepted,
  ConfirmationAction,
  ConfirmationActions,
  ConfirmationRejected,
  ConfirmationRequest,
  ConfirmationTitle,
} from '@/components/ai-elements/confirmation';
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from '@/components/ai-elements/reasoning';
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from '@/components/ai-elements/tool';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  MessageContent,
  MessageResponse,
} from '@/components/ai-elements/message';

type ChatMessagePartProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  part: any;
  partIndex: number;
  messageId: string;
  isLastPart: boolean;
  isLastMessage: boolean;
  status: string;
  chat: ReturnType<typeof useChat>;
  onToolApproved?: (tool: ToolUIPart) => Promise<void>;
  onToolRejected?: (tool: ToolUIPart) => Promise<void>;
  needsApprovalRef: React.RefObject<boolean>;
  onRevert: (jobId: string) => void;
};

export const ChatMessagePart = ({
  part,
  partIndex,
  messageId,
  isLastPart,
  isLastMessage,
  status,
  chat,
  onToolApproved,
  onToolRejected,
  needsApprovalRef,
  onRevert,
}: ChatMessagePartProps) => {
  switch (part.type) {
    case 'text':
      return (
        <React.Fragment key={`${messageId}-${partIndex}`}>
          <MessageContent className='text-base'>
            <MessageResponse>{part.text}</MessageResponse>
          </MessageContent>
        </React.Fragment>
      );
    case 'reasoning':
      return (
        <Reasoning
          key={`${messageId}-${partIndex}`}
          className='w-full'
          isStreaming={status === 'streaming' && isLastPart && isLastMessage}
        >
          <ReasoningTrigger />
          <ReasoningContent>{part.text}</ReasoningContent>
        </Reasoning>
      );
    default:
      if (part.type.startsWith('tool')) {
        return (
          <ToolPartRenderer
            key={`${messageId}-${(part as ToolUIPart).toolCallId}`}
            tool={part as ToolUIPart}
            messageId={messageId}
            chat={chat}
            onToolApproved={onToolApproved}
            onToolRejected={onToolRejected}
            needsApprovalRef={needsApprovalRef}
            onRevert={onRevert}
          />
        );
      }
      return null;
  }
};

type ToolPartRendererProps = {
  tool: ToolUIPart;
  messageId: string;
  chat: ReturnType<typeof useChat>;
  onToolApproved?: (tool: ToolUIPart) => Promise<void>;
  onToolRejected?: (tool: ToolUIPart) => Promise<void>;
  needsApprovalRef: React.RefObject<boolean>;
  onRevert: (jobId: string) => void;
};

const ToolPartRenderer = ({
  tool,
  messageId,
  chat,
  onToolApproved,
  onToolRejected,
  needsApprovalRef,
  onRevert,
}: ToolPartRendererProps) => {
  let state = tool.state;
  if (tool.output && tool.output.toString().startsWith('ERROR')) {
    state = 'output-error';
  }
  const jobId = (tool.output as { jobId: string })?.jobId;
  const approval = tool.approval;

  return (
    <Fragment key={`${messageId}-${tool.toolCallId}`}>
      <Tool defaultOpen={false}>
        <ToolHeader type={tool.type} state={state}>
          {jobId && state === 'output-available' && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant={'outline'}
                  size={'icon-xs'}
                  className='px-4'
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <Undo className='size-4' />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Are you sure you want to revert this?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={(e) => e.stopPropagation()}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={(e) => {
                      e.stopPropagation();
                      onRevert(jobId);
                    }}
                  >
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </ToolHeader>
        <ToolContent>
          {!!tool.input && <ToolInput input={tool.input} />}
          {tool.state === 'output-error' && !!tool.rawInput && (
            <ToolInput input={tool.rawInput} />
          )}
          {!!(tool.output || tool.errorText) && (
            <ToolOutput output={tool.output} errorText={tool.errorText} />
          )}
        </ToolContent>
      </Tool>
      {state === 'approval-requested' && approval && (
        <Confirmation
          approval={approval}
          state={tool.state}
          className='flex-col relative [&>svg]:absolute [&>svg]:top-3.5 [&>svg]:left-4 [&>svg]:size-4'
        >
          <ConfirmationTitle className='w-full pl-6'>
            <div className='flex'>
              <ConfirmationRequest>
                Do you want to execute this tool?
              </ConfirmationRequest>
              <ConfirmationAccepted>
                <CheckIcon className='size-4 text-green-600 dark:text-green-400 my-auto mr-1' />
                <span>Accepted</span>
              </ConfirmationAccepted>
              <ConfirmationRejected>
                <XIcon className='size-4 text-destructive my-auto mr-1' />
                <span>Rejected</span>
              </ConfirmationRejected>
            </div>
          </ConfirmationTitle>
          <ConfirmationActions className='flex items-start'>
            <ConfirmationAction
              onClick={async () => {
                await chat.addToolApprovalResponse({
                  id: approval.id,
                  approved: false,
                });
                await onToolRejected?.(tool);
              }}
              variant='outline'
            >
              Reject
            </ConfirmationAction>
            <ConfirmationAction
              onClick={async () => {
                await chat.addToolApprovalResponse({
                  id: approval.id,
                  approved: true,
                });
                await onToolApproved?.(tool);
              }}
              variant='default'
            >
              Accept
            </ConfirmationAction>
            <ConfirmationAction
              onClick={async () => {
                needsApprovalRef.current = true;
                await chat.addToolApprovalResponse({
                  id: approval.id,
                  approved: true,
                });
                await onToolApproved?.(tool);
              }}
              variant='default'
            >
              Accept all in current section
            </ConfirmationAction>
          </ConfirmationActions>
        </Confirmation>
      )}
    </Fragment>
  );
};
