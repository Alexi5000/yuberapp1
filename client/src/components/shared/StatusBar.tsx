'use client';

interface StatusBarProps {
  time?: string;
  dark?: boolean;
}

export function StatusBar({ time = '9:41', dark = false }: StatusBarProps) {
  const textColor = dark ? 'text-white' : 'text-black';
  
  return (
    <div className={`flex h-12 w-full items-end justify-between px-6 pb-2 ${textColor}`}>
      <span className="text-[10px] font-semibold">{time}</span>
      <div className="flex items-center gap-1.5">
        <iconify-icon icon="lucide:signal" width="12"></iconify-icon>
        <iconify-icon icon="lucide:wifi" width="12"></iconify-icon>
        <iconify-icon icon="lucide:battery-medium" width="16"></iconify-icon>
      </div>
    </div>
  );
}

export default StatusBar;

