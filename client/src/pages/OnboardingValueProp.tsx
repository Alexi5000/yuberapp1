'use client';

interface OnboardingValuePropProps {
  onNext: () => void;
  onSkip: () => void;
}

export default function OnboardingValueProp({ onNext, onSkip }: OnboardingValuePropProps) {
  return (
    <div className="w-full h-full bg-white rounded-[40px] overflow-hidden relative flex flex-col">
      <div className="flex-1 bg-[#F6F9FC] flex items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{backgroundImage: 'radial-gradient(#0A2540 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
        <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-soft z-10 text-[#0A2540]">
          <iconify-icon icon="lucide:shield-check" width="64" stroke-width="1"></iconify-icon>
        </div>
      </div>
      <div className="h-[40%] p-8 flex flex-col justify-between bg-white">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-[#0A2540] mb-3">Trusted Professionals</h2>
          <p className="text-[#64748B] text-sm leading-relaxed">Every plumber, locksmith, and electrician is background checked and insured.</p>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <div className="w-2 h-2 rounded-full bg-[#0A2540]"></div>
            <div className="w-2 h-2 rounded-full bg-gray-200"></div>
            <div className="w-2 h-2 rounded-full bg-gray-200"></div>
          </div>
          <button onClick={onNext} className="text-[#0A2540] font-semibold text-sm">Next</button>
        </div>
      </div>
    </div>
  );
}

