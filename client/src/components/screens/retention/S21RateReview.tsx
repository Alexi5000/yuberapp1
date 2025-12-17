'use client';

import { useState } from 'react';
import type { Provider } from '@/lib/types';
import { Icon, Button, Avatar } from '@/components/ui';

interface S21Props {
  provider: Provider;
  onSubmit: () => void;
  onSkip: () => void;
}

export default function S21RateReview({ provider, onSubmit, onSkip }: S21Props) {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [tip, setTip] = useState<number | null>(null);
  const [customTip, setCustomTip] = useState('');

  const handleTipSelect = (amount: number | 'custom') => {
    if (amount === 'custom') {
      setTip(null);
      setCustomTip('');
    } else {
      setTip(amount);
      setCustomTip('');
    }
  };

  return (
    <div className="flex h-full flex-col bg-[#F7FAFC]">
      <div className="flex items-center justify-between px-4 pt-14 pb-4 bg-white border-b border-gray-100">
        <h2 className="text-lg font-bold text-[#0A2540]">How was your experience?</h2>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center gap-3">
            <Avatar src={provider.photo} name={provider.name} size="md" />
            <div>
              <h3 className="font-semibold text-[#0A2540]">{provider.name}</h3>
              <div className="flex items-center gap-1">
                <Icon name="star" size="xs" className="text-yellow-400" />
                <span className="text-xs text-gray-600">{provider.rating}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-center gap-3 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className="transition-transform active:scale-95"
              >
                <Icon 
                  name="star" 
                  size="xl" 
                  className={star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'} 
                />
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <textarea
            placeholder="Share more details (optional)"
            value={review}
            onChange={(e) => setReview(e.target.value)}
            className="w-full rounded-xl border border-gray-200 p-4 text-sm min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-[#0A2540]/20"
          />
        </div>

        <div className="mb-6">
          <p className="text-sm font-medium text-[#0A2540] mb-3">Add a tip (optional)</p>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[5, 10, 15].map((amount) => (
              <button
                key={amount}
                onClick={() => handleTipSelect(amount)}
                className={`py-2 rounded-xl text-sm font-medium transition-all ${
                  tip === amount ? 'bg-[#FF4742] text-white' : 'bg-white border border-gray-200 text-[#FF4742]'
                }`}
              >
                ${amount}
              </button>
            ))}
            <button
              onClick={() => handleTipSelect('custom')}
                className={`py-2 rounded-xl text-sm font-medium transition-all ${
                  tip === null && customTip ? 'bg-[#FF4742] text-white' : 'bg-white border border-gray-200 text-[#FF4742]'
                }`}
            >
              Custom
            </button>
          </div>
          {tip === null && (
            <input
              type="text"
              placeholder="$0.00"
              value={customTip}
              onChange={(e) => setCustomTip(e.target.value)}
              className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2540]/20"
            />
          )}
        </div>
      </div>

      <div className="p-4 border-t border-gray-100 bg-white space-y-3">
        <Button variant="primary" size="lg" fullWidth onClick={onSubmit} disabled={rating === 0}>
          Submit Review
        </Button>
        <button onClick={onSkip} className="w-full py-2 text-sm text-gray-500 hover:text-[#0A2540]">
          Skip
        </button>
      </div>
    </div>
  );
}

