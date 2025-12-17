'use client';

interface SearchingScreenProps {
  providerName?: string;
  onCancel: () => void;
}

export default function SearchingScreen({ providerName = 'Mike', onCancel }: SearchingScreenProps) {
  return (
    <div className="w-full h-full bg-[#F6F9FC] rounded-[40px] overflow-hidden relative flex flex-col items-center justify-center">
      <div className="relative">
        <div className="absolute inset-0 bg-[#FF4742]/10 rounded-full animate-ping duration-[2000ms]"></div>
        <div className="absolute inset-0 bg-[#FF4742]/20 rounded-full animate-ping duration-[3000ms] delay-75"></div>
        <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-soft relative z-10">
          <div className="w-20 h-20 bg-[#FF4742] rounded-full flex items-center justify-center text-white">
            <iconify-icon icon="lucide:search" width="32"></iconify-icon>
          </div>
        </div>
      </div>
      <h3 className="mt-8 text-lg font-semibold text-[#0A2540]">Contacting {providerName}...</h3>
      <p className="text-xs text-[#64748B] mt-2">Connecting you to the professional</p>
      <button
        onClick={onCancel}
        className="mt-12 text-xs font-medium text-gray-400 uppercase tracking-widest border border-gray-200 px-6 py-2 rounded-full hover:bg-gray-100">
        Cancel Request
      </button>
    </div>
  );
}

