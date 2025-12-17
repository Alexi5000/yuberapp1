'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { StatusBar } from './StatusBar';

interface PhoneFrameProps {
  children: React.ReactNode;
  className?: string;
  showStatusBar?: boolean;
  dark?: boolean;
}

export function PhoneFrame({ 
  children, 
  className,
  showStatusBar = true,
  dark = false,
}: PhoneFrameProps) {
  return (
    <div className={cn(
      'relative aspect-[9/19] w-full max-w-sm overflow-hidden rounded-[44px]',
      'border-[8px] border-[#0A2540] bg-white shadow-2xl',
      'transition-transform duration-500 hover:scale-[1.01]',
      className
    )}>
      {/* Status Bar */}
      {showStatusBar && (
        <div className="pointer-events-none absolute top-0 z-50 w-full bg-gradient-to-b from-white/90 to-transparent">
          <StatusBar dark={dark} />
        </div>
      )}

      {/* Screen Content */}
      <div className="relative h-full w-full overflow-hidden bg-[#F7FAFC]">
        {children}
      </div>

      {/* Home Bar */}
      <div className="pointer-events-none absolute bottom-2 left-1/2 z-50 h-1 w-32 -translate-x-1/2 rounded-full bg-black/20" />
    </div>
  );
}

export default PhoneFrame;

