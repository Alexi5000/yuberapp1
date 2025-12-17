'use client';

import { useState } from 'react';
import { Icon } from '@/components/ui';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Mic, Send, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface S29Props {
  onBack: () => void;
}

export default function S29NotificationSettings({ onBack }: S29Props) {
  const [settings, setSettings] = useState({
    bookingUpdates: true,
    providerMessages: true,
    promotions: false,
    reminders: true,
  });

  const [aiMode, setAiMode] = useState(false);
  const [aiInput, setAiInput] = useState('');
  
  const { mutate: sendToAgent, isPending } = trpc.agent.chatSettings.useMutation({
    onSuccess: (data) => {
      // Parse tool calls to update local state optimistically
      // In a real app, the tool execution on backend would update DB, and we'd invalidate queries
      // For POC, we'll try to interpret the text response or rely on the tool result if we had it
      
      // If the agent says "Done", we can assume success
      toast.success(data.text);
      setAiInput('');
      
      // Heuristic update for demo purposes based on user intent
      const text = aiInput.toLowerCase();
      if (text.includes('disable') || text.includes('off') || text.includes('stop')) {
        if (text.includes('promotion')) setSettings(p => ({ ...p, promotions: false }));
        if (text.includes('email')) setSettings(p => ({ ...p, promotions: false })); // assuming email maps to promos for demo
      } else if (text.includes('enable') || text.includes('on') || text.includes('start')) {
         if (text.includes('promotion')) setSettings(p => ({ ...p, promotions: true }));
      }
    },
    onError: () => {
      toast.error('Failed to update settings via AI');
    }
  });

  const toggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAiSubmit = () => {
    if (!aiInput.trim()) return;
    sendToAgent({ message: aiInput });
  };

  const notificationTypes = [
    { key: 'bookingUpdates' as const, label: 'Booking Updates', description: 'Get notified about booking status changes' },
    { key: 'providerMessages' as const, label: 'Provider Messages', description: 'Receive messages from your service provider' },
    { key: 'promotions' as const, label: 'Promotions & Offers', description: 'Get special deals and discounts' },
    { key: 'reminders' as const, label: 'Reminders', description: 'Get reminders for upcoming bookings' },
  ];

  return (
    <div className="flex h-full flex-col bg-[#F7FAFC]">
      <div className="flex items-center justify-between px-4 pt-14 pb-4 bg-white border-b border-gray-100">
        <button onClick={onBack} className="p-2 text-gray-400 hover:text-[#0A2540]">
          <Icon name="arrow-left" size="md" />
        </button>
        <span className="text-sm font-semibold text-[#0A2540]">Notification Settings</span>
        <button 
          onClick={() => setAiMode(!aiMode)}
          className={`p-2 transition-colors ${aiMode ? 'text-[#FF4742]' : 'text-gray-400'}`}
        >
          <Sparkles className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {aiMode && (
           <div className="mb-6 bg-white p-4 rounded-2xl shadow-sm border border-[#FF4742]/20">
             <div className="flex items-center gap-2 mb-3 text-[#FF4742]">
               <Sparkles className="w-4 h-4" />
               <span className="text-sm font-medium">AI Assistant</span>
             </div>
             <p className="text-xs text-gray-500 mb-3">
               Tell me how you want to be notified. E.g., "Turn off all promotions" or "Enable SMS for bookings".
             </p>
             <div className="flex gap-2">
               <Input 
                 value={aiInput}
                 onChange={(e) => setAiInput(e.target.value)}
                 placeholder="Type your preference..."
                 className="h-9 text-sm"
                 onKeyDown={(e) => e.key === 'Enter' && handleAiSubmit()}
               />
               <Button 
                 size="sm" 
                 onClick={handleAiSubmit} 
                 disabled={isPending}
                 className="bg-[#0A2540] h-9 w-9 p-0"
               >
                 {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
               </Button>
             </div>
           </div>
        )}

        <div className="space-y-3">
          {notificationTypes.map((type) => (
            <div
              key={type.key}
              className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-[#0A2540] mb-1">{type.label}</p>
                  <p className="text-xs text-gray-500">{type.description}</p>
                </div>
                <button
                  onClick={() => toggle(type.key)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    settings[type.key] ? 'bg-[#FF4742]' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      settings[type.key] ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
