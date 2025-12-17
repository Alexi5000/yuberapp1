// file: client/src/components/screens/conversation/S09AIRecommendation.tsx
// description: AI recommendation screen showing the top provider and rationale for selection
// reference: client/src/lib/types.ts, client/src/components/ui/avatar.tsx

'use client';

import type { Provider } from '@/lib/types';
import { Icon, Button, Avatar } from '@/components/ui';

interface S09Props {
  provider: Provider;
  onBook: () => void;
  onSeeOthers: () => void;
  onViewDetails: () => void;
  onBack: () => void;
}

export default function S09AIRecommendation({ provider, onBook, onSeeOthers, onViewDetails, onBack }: S09Props) {
  const provider_first_name = provider.name.trim().split(/\s+/)[0] ?? provider.name;

  return (
    <div className="flex h-full flex-col bg-[#F7FAFC]">
      <div className="flex items-center justify-between px-4 pt-14 pb-4 bg-white border-b border-gray-100">
        <button onClick={onBack} className="p-2 text-gray-400 hover:text-[#0A2540]">
          <Icon name="arrow-left" size="md" />
        </button>
        <span className="text-sm font-semibold text-[#0A2540]">AI Recommendation</span>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mx-4 mb-4">
          <div className="mb-4">
            <span className="inline-flex items-center gap-1 bg-[#2ECC71] text-white px-3 py-1 rounded-full text-xs font-medium">
              <span>•</span> Available in {provider.eta} mins
            </span>
          </div>

          <div className="flex items-start gap-4 mb-6">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-[#0A2540] mb-1">{provider.name}</h1>
              <div className="flex items-center gap-2 mb-2">
                <Icon name="star" size="sm" className="text-yellow-400" />
                <span className="text-sm text-gray-700">{provider.rating} ({provider.reviewCount} reviews)</span>
              </div>
            </div>
            <Avatar src={provider.photo} name={provider.name} size="lg" />
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-1">RATE</p>
              <p className="text-sm font-bold text-[#0A2540]">${provider.hourlyRate}/hr</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-1">CALL-OUT</p>
              <p className="text-sm font-bold text-[#2ECC71]">{provider.callOutFee === 0 ? 'Free' : `$${provider.callOutFee}`}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-1">DISTANCE</p>
              <p className="text-sm font-bold text-[#0A2540]">{provider.distance} mi</p>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Icon name="zap" size="sm" className="text-[#2ECC71]" />
              <h3 className="text-xs font-semibold text-[#2ECC71] uppercase tracking-wide">WHY I CHOSE {provider_first_name.toUpperCase()} FOR YOU</h3>
            </div>
            <ul className="space-y-2">
              {provider.whyChosen.map((reason, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                  <Icon name="check" size="xs" className="text-[#2ECC71] mt-0.5 flex-shrink-0" />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pb-6 space-y-3">
          <Button variant="danger" size="lg" fullWidth onClick={onBook} leftIcon="zap">
            Book Now
          </Button>
          <div className="flex gap-3">
            <button
              onClick={onSeeOthers}
              className="flex-1 py-3 text-sm text-center text-gray-600 hover:text-[#FF4742]"
            >
              See other options
            </button>
            <button
              onClick={onViewDetails}
              className="flex-1 py-3 text-sm text-center text-gray-600 hover:text-[#FF4742]"
            >
              View full details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

