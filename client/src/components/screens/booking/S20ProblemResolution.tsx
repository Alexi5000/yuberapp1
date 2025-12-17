'use client';

import { useState } from 'react';
import { Icon, Button } from '@/components/ui';

interface S20Props {
  onSelectIssue: (issue: string) => void;
  onBack: () => void;
}

const issues = [
  { id: 'quality', label: 'Quality of work', icon: 'alert-circle' },
  { id: 'behavior', label: 'Provider behavior', icon: 'user' },
  { id: 'pricing', label: 'Pricing dispute', icon: 'credit-card' },
  { id: 'other', label: 'Other issue', icon: 'info' },
];

export default function S20ProblemResolution({ onSelectIssue, onBack }: S20Props) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="flex h-full flex-col bg-[#F7FAFC]">
      <div className="flex items-center justify-between px-4 pt-14 pb-4 bg-white border-b border-gray-100">
        <button onClick={onBack} className="p-2 text-gray-400 hover:text-[#0A2540]">
          <Icon name="arrow-left" size="md" />
        </button>
        <span className="text-sm font-semibold text-[#0A2540]">Report Issue</span>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <p className="text-sm text-gray-600 mb-6">What issue are you experiencing?</p>

        <div className="space-y-3">
          {issues.map((issue) => (
            <button
              key={issue.id}
              onClick={() => {
                setSelected(issue.id);
                onSelectIssue(issue.id);
              }}
              className={`w-full bg-white p-4 rounded-2xl shadow-sm border transition-all text-left ${
                selected === issue.id ? 'border-[#0A2540] bg-[#0A2540]/5' : 'border-gray-100 hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon name={issue.icon as any} size="md" className={selected === issue.id ? 'text-[#0A2540]' : 'text-gray-400'} />
                <span className={`font-medium ${selected === issue.id ? 'text-[#0A2540]' : 'text-gray-700'}`}>
                  {issue.label}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

