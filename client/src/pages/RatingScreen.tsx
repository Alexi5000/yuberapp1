'use client';

import { useState } from 'react';

interface RatingScreenProps {
  providerName: string;
  providerImage?: string;
  onSubmit: (rating: number, comment: string) => void;
  onSkip: () => void;
}

export default function RatingScreen({ providerName, providerImage, onSubmit, onSkip }: RatingScreenProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  return (
    <div className="w-full h-full bg-white rounded-[40px] overflow-hidden relative flex flex-col p-6 pt-12 items-center text-center">
      <h2 className="text-2xl font-semibold tracking-tight text-[#0A2540] mb-2">Rate your experience</h2>
      <p className="text-[#64748B] text-sm mb-8">How was your service with {providerName}?</p>
      
      <div className="w-24 h-24 rounded-full p-1 border-2 border-[#0A2540] mb-6">
        <img src={providerImage || `https://i.pravatar.cc/150?img=11`} className="w-full h-full object-cover rounded-full" alt={providerName} />
      </div>

      <div className="flex gap-2 mb-8">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setRating(star)}
            className="focus:outline-none">
            <iconify-icon
              icon="lucide:star"
              className={star <= rating ? 'text-yellow-400' : 'text-gray-200'}
              width="32"
              fill={star <= rating ? 'currentColor' : 'none'}
            ></iconify-icon>
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="w-full h-32 bg-gray-50 rounded-xl p-4 text-sm text-[#0A2540] outline-none focus:ring-2 ring-[#0A2540]/10 resize-none mb-6"
        placeholder="Write a comment (optional)..."
      />

      <button
        onClick={() => onSubmit(rating, comment)}
        disabled={rating === 0}
        className="w-full bg-[#0A2540] text-white py-4 rounded-xl font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
        Submit Review
      </button>
    </div>
  );
}

