// file: client/src/components/screens/onboarding/S02ValueCarousel.tsx
// description: Onboarding value carousel shown early in the app flow
// reference: client/src/components/ui/button.tsx, app/layout.tsx (Iconify script)

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';

interface S02Props {
  onComplete: () => void;
  onSkip: () => void;
}

const slides = [
  {
    icon: 'message-circle',
    title: "Just ask, we'll find it.",
    description: "No more scrolling through endless listings. Ask what you need in your own words.",
  },
  {
    icon: 'sparkles',
    title: "Get the perfect match.",
    description: "Our AI finds the best pro for you and explains exactly why they're the right choice.",
  },
  {
    icon: 'zap',
    title: "Book or dispatch instantly.",
    description: "No phone calls, no waiting. Help is on the way in seconds.",
  },
];

export default function S02ValueCarousel({ onComplete, onSkip }: S02Props) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const fallbackSlide = { icon: 'message-circle', title: '', description: '' } as const;
  const activeSlide = slides[currentSlide] ?? slides[0] ?? fallbackSlide;

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex justify-end p-6">
        <button onClick={onSkip} className="text-sm text-gray-400 hover:text-[#0A2540]">
          Skip
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FF4742]/10">
            <iconify-icon icon={`lucide:${activeSlide.icon}`} width="32" className="text-[#FF4742]"></iconify-icon>
          </div>
          <h1 className="mb-4 text-2xl font-bold text-[#0A2540]">{activeSlide.title}</h1>
          <p className="text-sm text-gray-600 leading-relaxed">{activeSlide.description}</p>
        </div>
      </div>

      <div className="px-6 pb-8">
        <div className="flex justify-center gap-2 mb-6">
          {slides.map((_, index) => (
            <div
              key={index}
                className={`h-1.5 rounded-full transition-all ${
                index === currentSlide ? 'w-8 bg-[#FF4742]' : 'w-1.5 bg-gray-300'
              }`}
            />
          ))}
        </div>
        <Button variant="primary" size="lg" fullWidth onClick={handleNext}>
          {currentSlide < slides.length - 1 ? 'Next' : 'Get Started'}
        </Button>
      </div>
    </div>
  );
}

