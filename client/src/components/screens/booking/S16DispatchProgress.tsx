'use client';

import { useEffect } from 'react';
import type { Provider } from '@/lib/types';
import { Icon, Button, Avatar } from '@/components/ui';

interface S16Props {
  provider: Provider;
  onViewMap: () => void;
  onCall: () => void;
  onMessage: () => void;
}

export default function S16DispatchProgress({ provider, onViewMap, onCall, onMessage }: S16Props) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onViewMap();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onViewMap]);

  const etaMinutes = provider.eta || 18;
  const now = new Date();
  const arrivalTime = new Date(now.getTime() + etaMinutes * 60000);
  const arrivalTimeStr = arrivalTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  return (
    <div className="flex h-full flex-col bg-[#F7FAFC]">
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center max-w-sm w-full">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#2ECC71]">
            <Icon name="check-circle" size="xl" className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#0A2540] mb-4">Help is on the way!</h1>
          
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <Avatar src={provider.photo} name={provider.name} size="md" />
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-[#0A2540]">{provider.name}</h3>
                <div className="flex items-center gap-1">
                  <Icon name="star" size="xs" className="text-yellow-400" />
                  <span className="text-xs text-gray-600">{provider.rating}</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-700 text-left">
              {provider.name.split(' ')[0]} will arrive by {arrivalTimeStr}
            </p>
            <p className="text-xs text-gray-500 text-left mt-1">
              (Arriving in {etaMinutes} minutes)
            </p>
          </div>

          <div className="space-y-3">
            <Button variant="primary" size="lg" fullWidth onClick={onCall} leftIcon="phone">
              Call {provider.name.split(' ')[0]}
            </Button>
            <Button variant="outline" size="md" fullWidth onClick={onMessage} leftIcon="message-circle">
              Message {provider.name.split(' ')[0]}
            </Button>
            <button
              onClick={onViewMap}
              className="w-full py-2 text-sm text-[#0A2540] hover:text-[#0A2540]/80"
            >
              View on map
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

