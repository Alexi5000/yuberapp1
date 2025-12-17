'use client';

import { Icon } from '@/components/ui';

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  messages: any[];
}

interface S12Props {
  conversations: Conversation[];
  onOpen: (conversation: Conversation) => void;
  onBack: () => void;
}

export default function S12ConversationHistory({ conversations, onOpen, onBack }: S12Props) {
  return (
    <div className="flex h-full flex-col bg-[#F7FAFC]">
      <div className="flex items-center justify-between px-4 pt-14 pb-4 bg-white border-b border-gray-100">
        <button onClick={onBack} className="p-2 text-gray-400 hover:text-[#0A2540]">
          <Icon name="arrow-left" size="md" />
        </button>
        <span className="text-sm font-semibold text-[#0A2540]">Conversation History</span>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-3">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onOpen(conv)}
              className="w-full bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all text-left"
            >
              <h3 className="font-semibold text-[#0A2540] mb-1">{conv.title}</h3>
              <p className="text-sm text-gray-600 mb-2 line-clamp-1">{conv.lastMessage}</p>
              <p className="text-xs text-gray-400">{conv.timestamp}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

