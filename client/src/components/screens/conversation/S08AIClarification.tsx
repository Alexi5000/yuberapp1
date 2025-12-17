'use client';

import { Icon } from '@/components/ui';
import { ChatBubble } from '@/components/shared';

interface S08Props {
  question: string;
  options: string[];
  onSelectOption: (option: string) => void;
  onBack: () => void;
}

const getOptionIcon = (option: string): string | null => {
  const lower = option.toLowerCase();
  if (lower.includes('full service') || lower.includes('service')) return 'sparkles';
  if (lower.includes('self')) return 'car';
  if (lower.includes('detail')) return 'sparkles';
  return null;
};

export default function S08AIClarification({ question, options, onSelectOption, onBack }: S08Props) {
  return (
    <div className="flex h-full flex-col bg-[#F7FAFC]">
      <div className="flex items-center justify-between px-4 pt-14 pb-4 bg-white border-b border-gray-100">
        <button onClick={onBack} className="p-2 text-gray-400 hover:text-[#0A2540]">
          <Icon name="arrow-left" size="md" />
        </button>
        <span className="text-sm font-semibold text-[#0A2540]">Conversation</span>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="mb-4">
          <ChatBubble role="ai" content={question} isTyping={false} />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {options.map((option) => {
            const iconName = getOptionIcon(option);
            return (
              <button
                key={option}
                onClick={() => onSelectOption(option)}
                className="flex-shrink-0 flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-medium text-[#FF4742] border border-gray-200 hover:bg-[#FF4742] hover:text-white transition-all"
              >
                {iconName && <Icon name={iconName as any} size="xs" />}
                <span>{option}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

