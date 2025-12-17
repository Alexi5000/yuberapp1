'use client';

import { useState, useRef, useEffect } from 'react';
import type { Message } from '@/lib/types';
import { Icon } from '@/components/ui';
import { ChatBubble } from '@/components/shared';

interface S06Props {
  messages: Message[];
  onSendMessage: (content: string) => void;
  onQuickReply: (reply: string) => void;
  quickReplies?: string[];
  isTyping: boolean;
  onBack: () => void;
  onMenu: () => void;
}

export default function S06ConversationActive({
  messages,
  onSendMessage,
  onQuickReply,
  quickReplies = [],
  isTyping,
  onBack,
  onMenu,
}: S06Props) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage(input.trim());
    setInput('');
  };

  return (
    <div className="flex h-full flex-col bg-[#F7FAFC]">
      <div className="flex items-center justify-between px-4 pt-14 pb-4 bg-white border-b border-gray-100">
        <button onClick={onBack} className="p-2 text-gray-400 hover:text-[#0A2540]">
          <Icon name="arrow-left" size="md" />
        </button>
        <span className="text-sm font-semibold text-[#0A2540]">Conversation</span>
        <button onClick={onMenu} className="p-2 text-gray-400 hover:text-[#0A2540]">
          <Icon name="menu" size="md" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-4">
          {messages.map((msg) => (
            <ChatBubble key={msg.id} role={msg.role === 'user' ? 'user' : 'ai'} content={msg.content} isTyping={msg.isTyping} />
          ))}
          {isTyping && <ChatBubble role="ai" content="" isTyping={true} />}
        </div>
        {quickReplies.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {quickReplies.map((reply) => (
              <button
                key={reply}
                onClick={() => onQuickReply(reply)}
                className="rounded-full bg-white px-4 py-2 text-xs font-medium text-[#FF4742] border border-gray-200 hover:bg-[#FF4742] hover:text-white transition-all"
              >
                {reply}
              </button>
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-100 bg-white p-4">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 rounded-2xl bg-[#F7FAFC] px-4 py-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..."
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

