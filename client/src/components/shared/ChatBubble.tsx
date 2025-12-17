// file: client/src/components/shared/ChatBubble.tsx
// description: Chat bubble UI component for user/AI messages with optional typing indicator
// reference: client/src/components/ui/avatar.tsx, client/src/lib/types.ts

'use client';

import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui';

interface ChatBubbleProps {
  role: 'user' | 'ai';
  content: string;
  // With `exactOptionalPropertyTypes: true`, optional props do not accept `undefined` when explicitly passed.
  // Many call sites pass `T | undefined`, so we accept `undefined` explicitly.
  timestamp?: Date | undefined;
  isTyping?: boolean | undefined;
  avatar?: string | undefined;
}

export function ChatBubble({ 
  role, 
  content, 
  timestamp,
  isTyping = false,
  avatar,
}: ChatBubbleProps) {
  const isUser = role === 'user';

  return (
    <div className={cn(
      'flex gap-2',
      isUser ? 'flex-row-reverse' : 'flex-row'
    )}>
      {/* Avatar for AI */}
      {!isUser && (
        <div className="flex-shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FF4742] text-white">
            <span className="text-xs font-bold">Y</span>
          </div>
        </div>
      )}

      {/* Message Bubble */}
      <div className={cn(
        'max-w-[80%] rounded-2xl px-4 py-3',
        isUser 
          ? 'bg-[#FF4742] text-white rounded-br-md' 
          : 'bg-white text-[#1A202C] rounded-bl-md shadow-sm border border-gray-100'
      )}>
        {isTyping ? (
          <div className="flex items-center gap-1 py-1">
            <div className="h-2 w-2 rounded-full bg-current opacity-40 animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="h-2 w-2 rounded-full bg-current opacity-40 animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="h-2 w-2 rounded-full bg-current opacity-40 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        ) : (
          <p className="text-sm leading-relaxed">{content}</p>
        )}
      </div>

      {/* Avatar for User */}
      {isUser && avatar && (
        <div className="flex-shrink-0">
          <Avatar src={avatar} size="sm" />
        </div>
      )}
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FF4742] text-white flex-shrink-0">
        <span className="text-xs font-bold">Y</span>
      </div>
      <div className="rounded-2xl rounded-bl-md bg-white px-4 py-3 shadow-sm border border-gray-100">
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

export default ChatBubble;

