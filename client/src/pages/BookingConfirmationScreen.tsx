'use client';

import { useState } from 'react';

interface BookingConfirmationScreenProps {
  providerName: string;
  location: string;
  paymentMethod: string;
  hourlyRate: number;
  serviceFee: number;
  onConfirm: () => void;
  onBack: () => void;
}

export default function BookingConfirmationScreen({
  providerName,
  location,
  paymentMethod,
  hourlyRate,
  serviceFee,
  onConfirm,
  onBack
}: BookingConfirmationScreenProps) {
  const [isHolding, setIsHolding] = useState(false);

  const handleHoldStart = () => setIsHolding(true);
  const handleHoldEnd = () => {
    setIsHolding(false);
    if (isHolding) {
      onConfirm();
    }
  };

  return (
    <div className="w-full h-full bg-white rounded-[40px] overflow-hidden relative flex flex-col p-6 pt-12">
      <h2 className="text-2xl font-semibold text-[#0A2540] tracking-tight mb-6">Confirm Details</h2>
      
      <div className="bg-[#F6F9FC] rounded-2xl p-4 mb-4 border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-[#0A2540] shadow-sm">
            <iconify-icon icon="lucide:map-pin" width="20"></iconify-icon>
          </div>
          <div>
            <p className="text-xs text-[#64748B] uppercase font-semibold">Location</p>
            <p className="text-sm font-medium text-[#0A2540]">{location}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-[#0A2540] shadow-sm">
            <iconify-icon icon="lucide:credit-card" width="20"></iconify-icon>
          </div>
          <div>
            <p className="text-xs text-[#64748B] uppercase font-semibold">Payment</p>
            <p className="text-sm font-medium text-[#0A2540]">{paymentMethod}</p>
          </div>
        </div>
      </div>

      <div className="bg-[#F6F9FC] rounded-2xl p-4 mb-auto border border-gray-100">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-gray-500">Hourly Rate</span>
          <span className="text-sm font-medium text-[#0A2540]">${hourlyRate.toFixed(2)}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-sm text-gray-500">Service Fee</span>
          <span className="text-sm font-medium text-[#0A2540]">${serviceFee.toFixed(2)}</span>
        </div>
        <div className="border-t border-gray-200 my-2"></div>
        <div className="flex justify-between">
          <span className="text-sm font-bold text-[#0A2540]">Est. Total</span>
          <span className="text-sm font-bold text-[#0A2540]">${(hourlyRate + serviceFee).toFixed(2)}+</span>
        </div>
      </div>

      <button
        onMouseDown={handleHoldStart}
        onMouseUp={handleHoldEnd}
        onTouchStart={handleHoldStart}
        onTouchEnd={handleHoldEnd}
        className={`w-full bg-[#0A2540] text-white h-14 rounded-xl font-medium shadow-lg flex items-center justify-center gap-2 transition-all ${
          isHolding ? 'scale-95 bg-opacity-90' : ''
        }`}>
        <span>Hold to Confirm</span>
        <iconify-icon icon="lucide:arrow-right" width="18"></iconify-icon>
      </button>
    </div>
  );
}

