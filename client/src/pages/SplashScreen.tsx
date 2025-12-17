'use client';

import { useEffect } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="w-full h-full bg-[#FF4742] rounded-[40px] overflow-hidden relative flex flex-col items-center justify-center text-white">
      <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center text-[#FF4742] mb-6 shadow-soft transform rotate-3">
        <iconify-icon icon="lucide:zap" width="48" stroke-width="1.5"></iconify-icon>
      </div>
      <h1 className="text-4xl font-semibold tracking-tighter">YUBER</h1>
      <p className="text-white/80 mt-2 font-medium tracking-wide">Your AI Agent for local services</p>
      <div className="absolute bottom-12 w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
    </div>
  );
}
