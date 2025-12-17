'use client';

import { Icon } from '@/components/ui';

interface S01SplashProps {
  onContinue: () => void;
}

export default function S01Splash({ onContinue }: S01SplashProps) {
  return (
    <div
      className="flex h-full flex-col items-center justify-center bg-[#FF4742] text-white p-8 cursor-pointer"
      onClick={onContinue}
    >
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-white/20 backdrop-blur-sm">
        <Icon name="zap" size="xl" className="text-white" />
      </div>
      <h1 className="mb-2 text-4xl font-bold tracking-tighter text-white">YUBER</h1>
      <p className="mb-12 text-center text-sm text-white/80">Your AI Agent for local services</p>
      <p className="animate-pulse text-xs text-white/60">Tap to continue</p>
    </div>
  );
}

