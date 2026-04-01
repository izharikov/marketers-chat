'use client';

import { useMemo } from 'react';
import type { UIMessage } from 'ai';
import { LayersIcon } from 'lucide-react';
import type { MessageMetadata } from '@/lib/ai/types';
import type { Model } from '@/lib/ai/models';

function formatTokens(tokens: number): string {
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(1)}M`;
  if (tokens >= 1_000) return `${(tokens / 1_000).toFixed(0)}K`;
  return `${tokens}`;
}

function getStatusColor(percentage: number) {
  if (percentage >= 90) return 'text-red-500';
  if (percentage >= 50) return 'text-yellow-500';
  return 'text-green-500';
}

type ContextStatusProps = {
  messages: UIMessage[];
  model: Model | undefined;
};

export function ContextStatus({ messages, model }: ContextStatusProps) {
  const inputTokens = useMemo(() => {
    const assistantMessages = messages.filter((msg) => msg.role === 'assistant');
    for (let i = assistantMessages.length - 1; i >= 0; i--) {
      const meta = assistantMessages[i].metadata as MessageMetadata | undefined;
      if (meta?.inputTokens) return meta.inputTokens;
    }
    return 0;
  }, [messages]);

  if (!model || inputTokens === 0) return null;

  const percentage = Math.round((inputTokens / model.contextWindow) * 100);
  const color = getStatusColor(percentage);

  return (
    <div className={`flex items-center justify-end gap-1.5 px-2 py-1 text-xs ${color}`}>
      <LayersIcon className='size-3' />
      <span className='inline-block h-1.5 w-12 overflow-hidden rounded-full bg-current/20'>
        <span
          className='block h-full rounded-full bg-current'
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </span>
      <span>
        {percentage}% ({formatTokens(inputTokens)}/{formatTokens(model.contextWindow)})
      </span>
    </div>
  );
}
