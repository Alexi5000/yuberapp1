'use client';

import { useState, useEffect } from 'react';

interface JobProgressScreenProps {
  hourlyRate: number;
  onAddTask: () => void;
}

export default function JobProgressScreen({ hourlyRate, onAddTask }: JobProgressScreenProps) {
  const [elapsed, setElapsed] = useState(45); // seconds

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
    <div className="w-full h-full bg-[#0A2540] rounded-[40px] overflow-hidden relative flex flex-col items-center justify-center text-white">
      <div className="w-56 h-56 rounded-full border border-white/10 flex items-center justify-center relative mb-8">
        <div className="absolute inset-0 rounded-full border-4 border-[#FF4742] border-t-transparent animate-spin duration-[3000ms]"></div>
        <div className="text-center">
          <div className="text-5xl font-mono font-medium tracking-tighter">{formatTime(elapsed)}</div>
          <div className="text-xs text-white/40 uppercase tracking-widest mt-2 font-medium">Elapsed</div>
        </div>
      </div>
      
      <h2 className="text-xl font-medium tracking-tight">Work in Progress</h2>
      <p className="text-white/60 text-sm mt-2">Professional is currently working.</p>

      <div className="absolute bottom-0 w-full p-6 bg-white/5 backdrop-blur-md border-t border-white/10">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-white/70">Current Rate</span>
          <span className="text-sm font-semibold">${hourlyRate.toFixed(2)}/hr</span>
        </div>
        <button
          onClick={onAddTask}
          className="w-full bg-white text-[#0A2540] py-3 rounded-xl text-sm font-medium hover:bg-gray-100">
          Add Task
        </button>
      </div>
    </div>
  );
}

