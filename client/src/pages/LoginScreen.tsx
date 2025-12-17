'use client';

import { useState } from 'react';

interface LoginScreenProps {
  onComplete: (phone: string) => void;
  onSkip: () => void;
}

export default function LoginScreen({ onComplete, onSkip }: LoginScreenProps) {
  const [phone, setPhone] = useState('');

  const handleContinue = () => {
    if (phone.length >= 10) {
      onComplete(`+1 ${phone.slice(0, 3)}-${phone.slice(3, 6)}-${phone.slice(6)}`);
    }
  };

  return (
    <div className="w-full h-full bg-white rounded-[40px] overflow-hidden relative flex flex-col p-8 pt-20">
      <div className="mb-10">
        <div className="w-12 h-12 bg-[#0A2540] rounded-xl flex items-center justify-center text-white mb-4">
          <iconify-icon icon="lucide:log-in" width="24"></iconify-icon>
        </div>
        <h1 className="text-3xl font-semibold text-[#0A2540] tracking-tight">Let's get started</h1>
        <p className="text-[#64748B] text-sm mt-2">Enter your number to continue.</p>
      </div>

      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="bg-[#F6F9FC] w-20 p-4 rounded-xl text-sm font-medium border border-gray-100 flex items-center justify-center text-[#0A2540]">+1</div>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
            placeholder="555-019-2834"
            className="bg-[#F6F9FC] flex-1 p-4 rounded-xl text-sm text-[#0A2540] border border-gray-100 font-medium outline-none focus:ring-2 focus:ring-[#FF4742]/20"
          />
        </div>
      </div>
      
      <button
        onClick={handleContinue}
        disabled={phone.length < 10}
        className="w-full bg-[#0A2540] text-white py-4 rounded-xl font-medium shadow-lg hover:bg-opacity-90 mt-8 disabled:opacity-50 disabled:cursor-not-allowed">
        Continue
      </button>
      
      <div className="mt-auto">
        <div className="relative flex py-5 items-center">
          <div className="flex-grow border-t border-gray-100"></div>
          <span className="flex-shrink-0 mx-4 text-gray-300 text-xs font-medium uppercase">Or continue with</span>
          <div className="flex-grow border-t border-gray-100"></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <button className="py-3 border border-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-50">
            <iconify-icon icon="lucide:apple" width="20"></iconify-icon>
          </button>
          <button className="py-3 border border-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-50 text-[#FF4742]">
            <iconify-icon icon="lucide:chrome" width="20"></iconify-icon>
          </button>
        </div>
      </div>
    </div>
  );
}

