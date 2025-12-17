'use client';

interface ProviderResult {
  id: number;
  name: string;
  category?: string;
  description?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
  imageUrl?: string | null;
  bannerUrl?: string | null;
  specialties?: string | null;
}

interface ProviderProfileScreenProps {
  provider: ProviderResult;
  onBook: () => void;
  onBack: () => void;
}

export default function ProviderProfileScreen({ provider, onBook, onBack }: ProviderProfileScreenProps) {
  return (
    <div className="w-full h-full bg-[#F6F9FC] rounded-[40px] overflow-hidden relative overflow-y-auto">
      <div className="relative h-64 bg-gray-900">
        <img src={provider.bannerUrl || provider.imageUrl || 'https://images.unsplash.com/photo-1581578731117-104f2a417954?w=500&auto=format&fit=crop&q=60'} className="w-full h-full object-cover opacity-60" alt={provider.name} />
        <button onClick={onBack} className="absolute top-12 left-6 w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white">
          <iconify-icon icon="lucide:x" width="20"></iconify-icon>
        </button>
      </div>
      
      <div className="px-6 -mt-16 relative z-10">
        <div className="bg-white rounded-2xl p-6 shadow-soft mb-6">
          <h1 className="text-2xl font-bold text-[#0A2540] tracking-tight">{provider.name}</h1>
          <p className="text-[#64748B] text-sm font-medium">{provider.category || 'Professional'}</p>
          <div className="flex gap-2 mt-4">
            <span className="px-3 py-1 bg-[#2ECC71]/10 text-[#2ECC71] text-xs font-bold rounded-lg uppercase tracking-wide">Insured</span>
            <span className="px-3 py-1 bg-[#0A2540]/5 text-[#0A2540] text-xs font-bold rounded-lg uppercase tracking-wide">Background Checked</span>
          </div>
        </div>

        <h3 className="text-sm font-bold text-[#0A2540] uppercase tracking-wide mb-3">About</h3>
        <p className="text-sm text-[#64748B] leading-relaxed mb-6">
          {provider.description || 'Over 15 years of experience handling residential and commercial services. Specializing in quality work and customer satisfaction.'}
        </p>

        <h3 className="text-sm font-bold text-[#0A2540] uppercase tracking-wide mb-3">Reviews</h3>
        <div className="space-y-4 mb-8">
          <div className="bg-white p-4 rounded-xl shadow-card">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold text-[#0A2540]">Sarah J.</span>
              <div className="flex text-yellow-400 text-xs">
                {[1,2,3,4,5].map(i => (
                  <iconify-icon key={i} icon="lucide:star" width="12" fill="currentColor"></iconify-icon>
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-500">Fast, professional and clean work.</p>
          </div>
        </div>

        <button
          onClick={onBook}
          className="w-full bg-[#0A2540] text-white py-4 rounded-xl font-medium shadow-lg mb-8">
          Book Now
        </button>
      </div>
    </div>
  );
}

