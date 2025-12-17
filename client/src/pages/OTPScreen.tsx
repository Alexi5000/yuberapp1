'use client';

import { useState } from 'react';

interface OTPScreenProps {
  phone: string;
  onVerify: () => void;
  onBack: () => void;
}

export default function OTPScreen({ phone, onVerify, onBack }: OTPScreenProps) {
  const [code, setCode] = useState(['', '', '', '']);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newCode = [...code];
    newCode[index] = value.replace(/\D/g, '');
    setCode(newCode);
    
    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const isComplete = code.every(digit => digit !== '');

  return (
    <div className="w-full h-full bg-white rounded-[40px] overflow-hidden relative flex flex-col p-8 pt-16">
      <button onClick={onBack} className="w-8 h-8 -ml-2 mb-6 rounded-full hover:bg-gray-50 flex items-center justify-center text-[#0A2540]">
        <iconify-icon icon="lucide:arrow-left" width="20"></iconify-icon>
      </button>
      <h1 className="text-2xl font-semibold text-[#0A2540] tracking-tight">Verify Code</h1>
      <p className="text-[#64748B] text-sm mt-2">We sent a code to <span className="text-[#0A2540] font-medium">{phone}</span></p>

      <div className="flex gap-3 mt-10 justify-between">
        {code.map((digit, index) => (
          <input
            key={index}
            id={`otp-${index}`}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleCodeChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className={`w-14 h-16 rounded-xl border-2 text-2xl font-semibold flex items-center justify-center text-center text-[#0A2540] ${
              digit ? 'border-[#0A2540]' : 'border-gray-200 bg-gray-50'
            } outline-none focus:ring-2 focus:ring-[#FF4742]/20`}
          />
        ))}
      </div>

      <p className="mt-8 text-center text-sm text-[#64748B]">Didn't receive it? <span className="text-[#FF4742] font-medium cursor-pointer">Resend</span></p>
      
      <div className="mt-auto mb-4">
        <button
          onClick={isComplete ? onVerify : undefined}
          disabled={!isComplete}
          className={`w-full py-4 rounded-xl font-medium ${
            isComplete
              ? 'bg-[#0A2540] text-white shadow-lg hover:bg-opacity-90'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}>
          Verify
        </button>
      </div>
    </div>
  );
}

