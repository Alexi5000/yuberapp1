'use client';

interface ProviderResult {
  id: number;
  name: string;
  rating?: number | null;
  reviewCount?: number | null;
  hourlyRate?: number | null;
  availableIn?: number | null;
  imageUrl?: string | null;
}

interface ProviderFoundScreenProps {
  provider: ProviderResult;
  onConfirm: () => void;
  onBack: () => void;
}

export default function ProviderFoundScreen({ provider, onConfirm, onBack }: ProviderFoundScreenProps) {
  return (
    <div className="w-full h-full bg-gray-800 rounded-[40px] overflow-hidden relative flex flex-col">
      {/* Simulated Map Background */}
      <div className="absolute inset-0 opacity-40 mix-blend-overlay" style={{backgroundImage: 'url(https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/World_map_blank_without_borders.svg/2000px-World_map_blank_without_borders.svg.png)', backgroundSize: 'cover', backgroundPosition: 'center'}}></div>
      
      <div className="mt-auto bg-white rounded-t-[32px] p-6 relative z-10">
        <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-6"></div>
        <div className="text-center">
          <div className="w-20 h-20 rounded-full p-1 bg-white border-2 border-[#2ECC71] mx-auto relative -mt-16 mb-3 shadow-lg">
            <img src={provider.imageUrl || `https://i.pravatar.cc/150?img=${provider.id}`} className="w-full h-full object-cover rounded-full" alt={provider.name} />
            <div className="absolute bottom-0 right-0 w-6 h-6 bg-[#2ECC71] rounded-full border-2 border-white flex items-center justify-center text-white text-[10px]">
              <iconify-icon icon="lucide:check"></iconify-icon>
            </div>
          </div>
          <h2 className="text-xl font-bold text-[#0A2540] tracking-tight">{provider.name} accepted!</h2>
          <p className="text-[#64748B] text-sm mt-1">He can arrive in <span className="text-[#0A2540] font-semibold">{provider.availableIn || 12} mins</span></p>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-8">
          <div className="bg-gray-50 p-3 rounded-xl text-center">
            <span className="block text-xs text-gray-400 uppercase font-bold">Rate</span>
            <span className="block text-lg font-semibold text-[#0A2540]">${provider.hourlyRate || 85}<span className="text-xs font-normal text-gray-400">/hr</span></span>
          </div>
          <div className="bg-gray-50 p-3 rounded-xl text-center">
            <span className="block text-xs text-gray-400 uppercase font-bold">Rating</span>
            <div className="flex items-center justify-center gap-1">
              <span className="block text-lg font-semibold text-[#0A2540]">{(provider.rating || 49) / 10}</span>
              <iconify-icon icon="lucide:star" className="text-yellow-400" width="14"></iconify-icon>
            </div>
          </div>
        </div>

        <button
          onClick={onConfirm}
          className="w-full bg-[#FF4742] text-white py-4 rounded-xl font-medium shadow-lg shadow-red-500/20 mt-6">
          Confirm Booking
        </button>
      </div>
    </div>
  );
}

