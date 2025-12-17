'use client';

import { useState, useRef, useEffect } from 'react';
import { Icon } from '@/components/ui';
import { trpc } from '@/lib/trpc';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send } from 'lucide-react';

interface S30Props {
  onBack: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function S30HelpSupport({ onBack }: S30Props) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi! I am your YUBER Support Agent. How can I help you today?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { mutate: sendMessage, isPending } = trpc.agent.chatHelp.useMutation({
    onSuccess: (data) => {
      setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
    },
    onError: (error) => {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    }
  });

  const handleSend = () => {
    if (!inputValue.trim()) return;
    
    const userMsg: Message = { role: 'user', content: inputValue };
    setMessages(prev => [...prev, userMsg]);
    sendMessage({ 
      message: inputValue, 
      history: messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })) 
    });
    setInputValue('');
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex h-full flex-col bg-[#F7FAFC]">
      <div className="flex items-center justify-between px-4 pt-14 pb-4 bg-white border-b border-gray-100 shadow-sm z-10">
        <button onClick={onBack} className="p-2 text-gray-400 hover:text-[#0A2540]">
          <Icon name="arrow-left" size="md" />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-sm font-semibold text-[#0A2540]">Help & Support</span>
          <span className="text-xs text-green-500 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            AI Agent Active
          </span>
        </div>
        <div className="w-10" />
      </div>

      <ScrollArea className="flex-1 px-4 py-4" ref={scrollRef}>
        <div className="space-y-4 pb-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={cn(
                "flex w-max max-w-[80%] flex-col gap-2 rounded-2xl px-4 py-3 text-sm shadow-sm",
                msg.role === 'user'
                  ? "ml-auto bg-[#0A2540] text-white rounded-br-none"
                  : "bg-white text-gray-800 rounded-bl-none"
              )}
            >
              {msg.content}
            </div>
          ))}
          {isPending && (
            <div className="flex w-max max-w-[80%] bg-white text-gray-800 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask for help..."
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={isPending}
            className="rounded-full bg-gray-50 border-gray-200 focus-visible:ring-[#0A2540]"
          />
          <Button 
            onClick={handleSend} 
            disabled={isPending || !inputValue.trim()}
            size="icon"
            className="rounded-full bg-[#0A2540] hover:bg-[#0A2540]/90"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
