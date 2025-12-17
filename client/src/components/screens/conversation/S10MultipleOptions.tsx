'use client';

import { useState } from 'react';
import type { Provider } from '@/lib/types';
import { Icon, Avatar } from '@/components/ui';

interface S10Props {
  providers: Provider[];
  onSelectProvider: (provider: Provider) => void;
  onBack: () => void;
}

export default function S10MultipleOptions({ providers, onSelectProvider, onBack }: S10Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="flex h-full flex-col bg-[#F7FAFC]">
      <div className="flex items-center justify-between px-4 pt-14 pb-4 bg-white border-b border-gray-100">
        <button onClick={onBack} className="p-2 text-gray-400 hover:text-[#0A2540]">
          <Icon name="arrow-left" size="md" />
        </button>
        <span className="text-sm font-semibold text-[#0A2540]">Other great options for you</span>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-3">
          {providers.map((provider) => {
            const isExpanded = expandedId === provider.id;
            return (
              <div
                key={provider.id}
                onClick={() => {
                  if (isExpanded) {
                    onSelectProvider(provider);
                  } else {
                    setExpandedId(provider.id);
                  }
                }}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-4">
                  <Avatar src={provider.photo} name={provider.name} size="lg" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-[#0A2540] truncate">{provider.name}</h3>
                      <span className="bg-[#2ECC71] text-white px-2 py-0.5 rounded-full text-xs font-medium">{provider.rating} ⭐</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{provider.distance} mi away</p>
                    {!isExpanded && (
                      <p className="text-xs text-gray-600 line-clamp-1">
                        {provider.whyChosen?.[0] || `${provider.specialties[0]} specialist`}
                      </p>
                    )}
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <ul className="space-y-1">
                          {provider.whyChosen?.slice(0, 3).map((reason, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-gray-700">
                              <Icon name="check" size="xs" className="text-[#2ECC71] mt-0.5 flex-shrink-0" />
                              <span>{reason}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="mt-3 flex items-center justify-between text-xs">
                          <span className="text-gray-600">${provider.hourlyRate}/hr</span>
                          <span className="text-[#2ECC71] font-medium">{provider.eta} min ETA</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

