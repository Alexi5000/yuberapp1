// file: client/src/components/screens/conversation/S05ConversationHub.tsx
// description: Conversation hub screen rendering the chat log, quick replies, and input composer
// reference: client/src/components/shared/ChatBubble.tsx, shared/lib/brand.ts

'use client';

import { useState, useEffect, useRef } from 'react';
import { SCREENS, type ScreenId } from '@shared/lib/brand';
import type { Message } from '@/lib/types';
import { Icon } from '@/components/ui';
import { ChatBubble } from '@/components/shared';

interface S05Props {
  onNavigate: (screen: ScreenId) => void;
  onSendMessage: (content: string) => void;
  messages: Message[];
  quickReplies?: string[];
  onQuickReply?: (reply: string) => void;
}

export default function S05ConversationHub({ 
  onNavigate, 
  onSendMessage, 
  messages, 
  quickReplies = [],
  onQuickReply 
}: S05Props) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const suggestedPrompts = ['Find a plumber 🔧', 'I need a locksmith 🔑', 'Best car wash nearby 🚗', 'Book a haircut 💇'];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage(input.trim());
    setInput('');
  };

  return (
    <div className="flex h-full flex-col bg-[#F7FAFC]">
      <div className="flex items-center justify-between px-6 pt-14 pb-4 bg-white border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF4742] text-white">
            <Icon name="zap" size="sm" />
          </div>
          <span className="text-sm font-bold tracking-tight text-[#0A2540]">YUBER</span>
        </div>
        <button onClick={() => onNavigate(SCREENS.S26_PROFILE_SETTINGS)} className="p-2 text-gray-400 hover:text-[#0A2540]">
          <Icon name="menu" size="md" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <>
            <div className="flex gap-2 mb-6">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FF4742] text-white flex-shrink-0">
                <span className="text-xs font-bold">Y</span>
              </div>
              <div className="rounded-2xl rounded-bl-md bg-white px-4 py-3 shadow-sm border border-gray-100 max-w-[85%]">
                <p className="text-sm text-[#1A202C]">Hey! 👋 I'm your AI Agent for local services. What are you looking for today?</p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-gray-400 ml-10 mb-2">Try asking:</p>
              <div className="flex flex-wrap gap-2 ml-10">
                {suggestedPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => onSendMessage(prompt.replace(/\s*[\u{1F300}-\u{1F9FF}]\s*$/u, '').trim())}
                    className="rounded-full bg-white px-4 py-2 text-xs font-medium text-[#0A2540] border border-gray-200 shadow-sm hover:bg-[#FF4742] hover:text-white hover:shadow-md transition-all active:scale-95"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <ChatBubble key={msg.id} role={msg.role === 'user' ? 'user' : 'ai'} content={msg.content} isTyping={msg.isTyping ?? false} />
            ))}
            
            {/* Show quick reply buttons if available */}
            {quickReplies.length > 0 && onQuickReply && (
              <div className="flex flex-wrap gap-2 mt-4">
                {quickReplies.map((reply) => (
                  <button
                    key={reply}
                    onClick={() => onQuickReply(reply)}
                    className="rounded-full bg-white px-4 py-2 text-xs font-medium text-[#0A2540] border border-gray-200 shadow-sm hover:bg-[#FF4742] hover:text-white hover:shadow-md transition-all active:scale-95"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="border-t border-gray-100 bg-white p-4">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 rounded-2xl bg-[#F7FAFC] px-4 py-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="What do you need help with?"
              className="flex-1 bg-transparent outline-none text-sm text-[#1A202C] placeholder:text-gray-400"
            />
            <button onClick={handleSend} className="text-[#FF4742] hover:text-[#FF4742]/80">
              <Icon name="send" size="sm" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

