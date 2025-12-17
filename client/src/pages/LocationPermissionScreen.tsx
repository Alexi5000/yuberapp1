'use client';

interface LocationPermissionScreenProps {
  onAllow: () => void;
  onNotNow: () => void;
}

export default function LocationPermissionScreen({ onAllow, onNotNow }: LocationPermissionScreenProps) {
  return (
    <div className="w-full h-full bg-[#0A2540] rounded-[40px] overflow-hidden relative flex flex-col items-center justify-center p-8 text-center">
      <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center text-[#2ECC71] mb-6 backdrop-blur-sm">
        <iconify-icon icon="lucide:navigation" width="40"></iconify-icon>
      </div>
      <h2 className="text-white text-xl font-semibold tracking-tight">Enable Location</h2>
      <p className="text-white/60 text-sm mt-3 leading-relaxed">We need your location to find the nearest available professionals in your area.</p>
      
      <div className="w-full mt-10 space-y-3">
        <button onClick={onAllow} className="w-full bg-[#2ECC71] text-white py-3.5 rounded-xl font-medium hover:bg-opacity-90 transition-colors">
          Allow While Using App
        </button>
        <button onClick={onNotNow} className="w-full text-white/50 text-sm font-medium py-2">
          Not Now
        </button>
      </div>
    </div>
  );
}

