import { ToolUIPart, UIMessage } from 'ai';

/**
 * Chat status logic:
 * - `idle`: stream finished, no tools executing, no approval dialog → show copy/regenerate
 * - `awaitingApproval`: approval dialog is shown → no spinner, no copy/regenerate
 * - `busy`: everything else (streaming, submitted, tools executing) → show spinner
 */
export type ComputedStatus = 'idle' | 'awaitingApproval' | 'busy';

const terminalToolStates: ToolUIPart['state'][] = [
  'output-available',
  'output-error',
  'output-denied',
];

export function useChatStatus(
  messages: UIMessage[],
  status: string,
  inputLength: number
) {
  const lastMessage = messages[messages.length - 1];
  const lastAssistantMessage = messages.findLast(
    (msg) => msg.role === 'assistant'
  );

  const toolParts = lastAssistantMessage?.parts.filter((part) =>
    part.type.startsWith('tool')
  );

  const hasApprovalRequested = !!toolParts?.some(
    (part) => (part as ToolUIPart).state === 'approval-requested'
  );

  const allToolsDone =
    !toolParts?.length ||
    toolParts.every((part) =>
      terminalToolStates.includes((part as ToolUIPart).state)
    );

  const serverDone = status === 'ready';

  let computedStatus: ComputedStatus;
  if (hasApprovalRequested) {
    computedStatus = 'awaitingApproval';
  } else if (serverDone && allToolsDone) {
    computedStatus = 'idle';
  } else {
    computedStatus = 'busy';
  }

  const revertInProgress =
    lastMessage?.role === 'assistant' &&
    lastMessage?.parts.some((part) => part.type === 'tool-revert_operation') &&
    !lastMessage?.parts.some((part) => part.type === 'text');

  const submitEnabled =
    !revertInProgress &&
    computedStatus === 'idle' &&
    inputLength > 0;

  return {
    computedStatus,
    revertInProgress,
    submitEnabled,
  };
}
