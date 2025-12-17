'use client';

import type { Provider } from '@/lib/types';
import { Icon, Button, Avatar } from '@/components/ui';

interface S13Props {
  provider: Provider;
  serviceType: string;
  estimatedCost: { min: number; max: number };
  onConfirm: () => void;
  onCancel: () => void;
  onBack: () => void;
}

export default function S13BookingConfirm({
  provider,
  serviceType,
  estimatedCost,
  onConfirm,
  onCancel,
  onBack,
}: S13Props) {
  return (
    <div className="flex h-full flex-col bg-[#F7FAFC]">
      <div className="flex items-center justify-between px-4 pt-14 pb-4 bg-white border-b border-gray-100">
        <button onClick={onBack} className="p-2 text-gray-400 hover:text-[#0A2540]">
          <Icon name="arrow-left" size="md" />
        </button>
        <span className="text-sm font-semibold text-[#0A2540]">Confirm Booking</span>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-4">
          <div className="flex items-start gap-4">
            <Avatar src={provider.photo} name={provider.name} size="lg" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-bold text-[#0A2540]">{provider.name}</h2>
                <span className="bg-[#2ECC71] text-white px-2 py-0.5 rounded-full text-xs font-medium">{provider.rating} ⭐</span>
                <span className="ml-auto bg-[#2ECC71] text-white px-2 py-0.5 rounded-full text-xs font-medium">
                  {provider.eta} min
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Icon name="wrench" size="sm" className="text-gray-400" />
                <span>{serviceType}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">BOOKING DETAILS</h3>
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <Icon name="clock" size="sm" className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-[#0A2540] mb-1">When</p>
                  <p className="text-sm text-gray-700">ASAP - Today</p>
                </div>
              </div>
              <button className="text-sm text-[#FF4742] hover:text-[#FF4742]/80 font-medium">
                Change
              </button>
            </div>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <Icon name="map-pin" size="sm" className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-[#0A2540] mb-1">Location</p>
                  <p className="text-sm text-gray-700">Current location</p>
                </div>
              </div>
              <button className="text-sm text-[#FF4742] hover:text-[#FF4742]/80 font-medium">
                Change
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">ESTIMATED COST</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Service</span>
              <span className="font-medium text-[#0A2540]">${estimatedCost.min}-${estimatedCost.max}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Service Fee</span>
              <span className="font-medium text-[#0A2540]">$5.00</span>
            </div>
            <div className="border-t border-gray-200 pt-2 mt-2">
              <div className="flex justify-between">
                <span className="font-semibold text-[#0A2540]">Total</span>
                <span className="font-bold text-[#0A2540]">${estimatedCost.min + 5}-${estimatedCost.max + 5}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-gray-100 bg-white space-y-3">
        <Button variant="primary" size="lg" fullWidth onClick={onConfirm}>
          Confirm & Continue
        </Button>
        <button onClick={onCancel} className="w-full py-2 text-sm text-gray-500 hover:text-[#0A2540]">
          Cancel
        </button>
      </div>
    </div>
  );
}

