'use client';

import { useState } from 'react';
import { Icon, Button, Input } from '@/components/ui';

interface S14Props {
  amount: number;
  onPaymentComplete: () => void;
  onBack: () => void;
}

const getCardType = (number: string): string | null => {
  if (number.startsWith('4')) return 'visa';
  if (number.startsWith('5')) return 'mastercard';
  if (number.startsWith('3')) return 'amex';
  return null;
};

export default function S14AddPayment({ amount, onPaymentComplete, onBack }: S14Props) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');
  const [saveCard, setSaveCard] = useState(false);

  const canSubmit = cardNumber.length >= 16 && expiry.length >= 5 && cvv.length >= 3 && name.length > 0;
  const cardType = getCardType(cardNumber);

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '').slice(0, 16);
    return cleaned.replace(/(.{4})/g, '$1 ').trim();
  };

  return (
    <div className="flex h-full flex-col bg-[#F7FAFC]">
      <div className="flex items-center justify-between px-4 pt-14 pb-4 bg-white border-b border-gray-100">
        <button onClick={onBack} className="p-2 text-gray-400 hover:text-[#0A2540]">
          <Icon name="arrow-left" size="md" />
        </button>
        <span className="text-sm font-semibold text-[#0A2540]">Add Payment Method</span>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <p className="text-sm text-gray-600 mb-6">Secure payment to complete your booking</p>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Card Number</label>
            <div className="relative">
              <Input
                type="text"
                placeholder="1234 5678 9012 3456"
                value={formatCardNumber(cardNumber)}
                onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, ''))}
                maxLength={19}
                className="pr-10"
              />
              {cardType && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <span className="text-xs font-semibold text-[#0A2540] uppercase">{cardType}</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Expiry</label>
              <Input
                type="text"
                placeholder="MM/YY"
                value={expiry}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, '');
                  if (value.length >= 2) value = value.slice(0, 2) + '/' + value.slice(2, 4);
                  setExpiry(value.slice(0, 5));
                }}
                maxLength={5}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">CVV</label>
              <Input
                type="text"
                placeholder="123"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                maxLength={3}
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Cardholder Name</label>
            <Input
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="saveCard"
              checked={saveCard}
              onChange={(e) => setSaveCard(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-[#0A2540] focus:ring-[#0A2540]"
            />
            <label htmlFor="saveCard" className="text-sm text-gray-600">
              Save card for future bookings
            </label>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-gray-100 bg-white">
        <Button variant="primary" size="lg" fullWidth onClick={onPaymentComplete} disabled={!canSubmit}>
          Pay ${amount.toFixed(2)}
        </Button>
      </div>
    </div>
  );
}

