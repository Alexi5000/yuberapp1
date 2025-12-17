'use client';

import { useState, useEffect } from 'react';
import type { Provider } from '@/lib/types';
import { Icon, Button } from '@/components/ui';

interface S18Props {
  provider: Provider;
  serviceType: string;
  onComplete: () => void;
  onReportIssue: () => void;
  onCall: () => void;
}

export default function S18JobInProgress({ provider, serviceType, onComplete, onReportIssue, onCall }: S18Props) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="flex h-full flex-col bg-[#0A2540] items-center justify-center text-white p-6">
      <div className="w-56 h-56 rounded-full border border-white/10 flex items-center justify-center relative mb-8">
        <div className="absolute inset-0 rounded-full border-4 border-[#FF4742] border-t-transparent animate-spin duration-[3000ms]"></div>
        <div className="text-center">
          <div className="text-5xl font-mono font-medium tracking-tighter">{formatTime(elapsed)}</div>
          <div className="text-xs text-white/40 uppercase tracking-widest mt-2 font-medium">Elapsed</div>
        </div>
      </div>
      
      <h2 className="text-xl font-medium tracking-tight">Work in Progress</h2>
      <p className="text-white/60 text-sm mt-2">{provider.name} is currently working.</p>

      <div className="absolute bottom-0 w-full p-6 bg-white/5 backdrop-blur-md border-t border-white/10">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-white/70">Current Rate</span>
          <span className="text-sm font-semibold">${provider.hourlyRate}/hr</span>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="md" fullWidth onClick={onCall} className="bg-white text-[#0A2540]">
            <Icon name="phone" size="sm" className="mr-2" />
            Call
          </Button>
          <Button variant="outline" size="md" fullWidth onClick={onReportIssue} className="bg-white/10 text-white border-white/20">
            Report Issue
          </Button>
        </div>
      </div>
    </div>
  );
}

