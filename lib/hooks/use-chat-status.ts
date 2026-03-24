import { ChatStatus, ToolUIPart, UIMessage } from 'ai';

export function useChatStatus(
  messages: UIMessage[],
  status: string,
  inputLength: number
) {
  const lastMessage = messages[messages.length - 1];

  const toolRunningOrApproval = !!lastMessage?.parts
    .filter((part) => part.type.startsWith('tool'))
    .some(
      (part) =>
        (part as ToolUIPart).state === 'approval-requested' ||
        (part as ToolUIPart).state === 'input-available'
    );

  const statusComputed: ChatStatus =
    status === 'ready' && toolRunningOrApproval ? 'streaming' : (status as ChatStatus);

  const revertInProgress =
    lastMessage?.role === 'assistant' &&
    lastMessage?.parts.some((part) => part.type === 'tool-revert_operation') &&
    !lastMessage?.parts.some((part) => part.type === 'text');

  const submitEnabled =
    !revertInProgress &&
    !toolRunningOrApproval &&
    ((status === 'ready' && inputLength > 0) ||
      status === 'streaming' ||
      status === 'submitted');

  return {
    statusComputed,
    toolRunningOrApproval,
    revertInProgress,
    submitEnabled,
  };
}
