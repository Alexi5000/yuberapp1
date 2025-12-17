'use client';

import { useState } from 'react';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'provider' | 'user';
  timestamp: Date;
}

interface ChatScreenProps {
  providerName: string;
  providerImage?: string;
  onBack: () => void;
  onCall: () => void;
}

export default function ChatScreen({ providerName, providerImage, onBack, onCall }: ChatScreenProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', text: "Hi, I'm just turning onto your street.", sender: 'provider', timestamp: new Date() }
  ]);
  const [inputValue, setInputValue] = useState('');

  const handleSend = () => {
    if (!inputValue.trim()) return;
    setMessages([...messages, {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    }]);
    setInputValue('');
  };

  return (
    <div className="w-full h-full bg-white rounded-[40px] overflow-hidden relative flex flex-col">
      <div className="p-4 pt-12 border-b border-gray-100 flex items-center gap-3 bg-white z-10">
        <button onClick={onBack}>
          <iconify-icon icon="lucide:chevron-left" width="24" className="text-gray-400"></iconify-icon>
        </button>
        <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
          <img src={providerImage || 'https://i.pravatar.cc/150?img=11'} className="w-full h-full object-cover" alt={providerName} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-[#0A2540]">{providerName}</h3>
          <p className="text-[10px] text-green-500 font-medium">Active now</p>
        </div>
        <button onClick={onCall} className="ml-auto">
          <iconify-icon icon="lucide:phone" width="20" className="text-[#FF4742]"></iconify-icon>
        </button>
      </div>

      <div className="flex-1 bg-[#F6F9FC] p-4 space-y-3 overflow-y-auto">
        <div className="text-center text-[10px] text-gray-400 my-2">Today 10:23 AM</div>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-end gap-2 max-w-[85%] ${
              msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
            }`}>
            {msg.sender === 'provider' && (
              <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden shrink-0">
                <img src={providerImage || 'https://i.pravatar.cc/150?img=11'} className="w-full h-full object-cover" alt={providerName} />
              </div>
            )}
            <div
              className={`${
                msg.sender === 'user'
                  ? 'bg-[#0A2540] text-white rounded-2xl rounded-br-sm'
                  : 'bg-white border border-gray-100 rounded-2xl rounded-bl-sm'
              } p-3 text-sm shadow-sm`}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-white border-t border-gray-100">
        <div className="bg-gray-50 rounded-full flex items-center px-4 py-2 border border-gray-100">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="bg-transparent flex-1 text-sm outline-none"
          />
          <button onClick={handleSend} className="text-[#FF4742]">
            <iconify-icon icon="lucide:send" width="18"></iconify-icon>
          </button>
        </div>
      </div>
    </div>
  );
}

