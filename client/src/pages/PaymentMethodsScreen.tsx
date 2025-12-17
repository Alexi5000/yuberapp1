'use client';

import { useState } from 'react';

interface PaymentMethodsScreenProps {
  onBack: () => void;
  onAdd: () => void;
  onSelect: (methodId: string) => void;
}

export default function PaymentMethodsScreen({ onBack, onAdd, onSelect }: PaymentMethodsScreenProps) {
  const [selected, setSelected] = useState('visa-1');

  const methods = [
    { id: 'visa-1', type: 'Visa', lastFour: '4242', name: 'Alex Doe', expiry: '12/25' },
    { id: 'mc-1', type: 'Mastercard', lastFour: '8839', name: 'Alex Doe', expiry: '06/24' },
    { id: 'apple', type: 'Apple Pay', lastFour: '', name: '', expiry: '' },
  ];

  return (
    <div className="w-full h-full bg-white rounded-[40px] overflow-hidden relative flex flex-col">
      <div className="p-6 pt-12 flex items-center gap-4">
        <button onClick={onBack}>
          <iconify-icon icon="lucide:arrow-left" width="20" className="text-[#0A2540]"></iconify-icon>
        </button>
        <h1 className="text-lg font-bold text-[#0A2540]">Payment</h1>
        <button onClick={onAdd} className="ml-auto text-[#FF4742]">
          <iconify-icon icon="lucide:plus" width="24"></iconify-icon>
        </button>
      </div>

      <div className="p-4 space-y-4">
        {methods.map((method) => (
          method.type === 'Visa' ? (
            <div
              key={method.id}
              className="bg-[#0A2540] rounded-2xl p-6 text-white relative overflow-hidden shadow-lg">
              <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/3 -translate-y-1/3">
                <iconify-icon icon="lucide:credit-card" width="200"></iconify-icon>
              </div>
              <div className="flex justify-between items-start mb-8">
                <iconify-icon icon="lucide:nfc" width="24" className="opacity-70"></iconify-icon>
                <span className="bg-white/20 px-2 py-1 rounded text-[10px] font-bold tracking-widest">VISA</span>
              </div>
              <div className="font-mono text-lg tracking-widest mb-4">•••• {method.lastFour}</div>
              <div className="flex justify-between text-xs opacity-70 uppercase">
                <span>{method.name}</span>
                <span>{method.expiry}</span>
              </div>
            </div>
          ) : (
            <div
              key={method.id}
              onClick={() => {
                setSelected(method.id);
                onSelect(method.id);
              }}
              className={`border rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-colors ${
                selected === method.id ? 'border-[#0A2540] bg-[#0A2540]/5' : 'border-gray-200'
              }`}>
              <div className="flex items-center gap-3">
                {method.type === 'Mastercard' ? (
                  <div className="w-10 h-6 bg-gray-200 rounded flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-red-500 opacity-80 -mr-1"></div>
                    <div className="w-3 h-3 rounded-full bg-orange-500 opacity-80"></div>
                  </div>
                ) : (
                  <iconify-icon icon="lucide:apple" width="24"></iconify-icon>
                )}
                <div>
                  <p className="text-sm font-medium text-[#0A2540]">{method.type}</p>
                  {method.lastFour && <p className="text-xs text-[#64748B]">•••• {method.lastFour}</p>}
                </div>
              </div>
              <input
                type="radio"
                name="payment"
                checked={selected === method.id}
                onChange={() => {
                  setSelected(method.id);
                  onSelect(method.id);
                }}
                className="accent-[#0A2540] w-4 h-4"
              />
            </div>
          )
        ))}
      </div>
    </div>
  );
}

