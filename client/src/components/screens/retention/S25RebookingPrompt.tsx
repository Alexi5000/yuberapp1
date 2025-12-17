'use client';

import type { Provider } from '@/lib/types';
import { Icon, Button, Avatar } from '@/components/ui';

interface S25Props {
  provider: Provider;
  serviceType: string;
  onRebook: () => void;
  onDismiss: () => void;
}

export default function S25RebookingPrompt({ provider, serviceType, onRebook, onDismiss }: S25Props) {
  return (
    <div className="flex h-full flex-col bg-[#F7FAFC]">
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center max-w-sm w-full">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#FF4742]/10">
            <Icon name="heart" size="xl" className="text-[#FF4742]" />
          </div>
          <h2 className="text-xl font-bold text-[#0A2540] mb-2">Book {provider.name} again?</h2>
          <p className="text-sm text-gray-600 mb-6">
            You loved {provider.name.split(' ')[0]}'s work. Need {serviceType} again?
          </p>

          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3 justify-center">
              <Avatar src={provider.photo} name={provider.name} size="md" />
              <div className="text-left">
                <h3 className="font-semibold text-[#0A2540]">{provider.name}</h3>
                <div className="flex items-center gap-1">
                  <Icon name="star" size="xs" className="text-yellow-400" />
                  <span className="text-xs text-gray-600">{provider.rating}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button variant="primary" size="lg" fullWidth onClick={onRebook}>
              Rebook Now
            </Button>
            <button onClick={onDismiss} className="w-full py-2 text-sm text-gray-500 hover:text-[#0A2540]">
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

