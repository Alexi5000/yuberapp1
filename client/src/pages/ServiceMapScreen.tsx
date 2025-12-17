'use client';

import { trpc } from '@/lib/trpc';
import { useEffect, useState } from 'react';

interface ProviderResult {
  id: number;
  name: string;
  category: string;
  rating?: number | null;
  reviewCount?: number | null;
  hourlyRate?: number | null;
  distance?: number | null;
  imageUrl?: string | null;
}

interface ServiceMapScreenProps {
  query: string;
  onProviderSelect: (provider: ProviderResult) => void;
  onBack: () => void;
  location?: { lat: number; lng: number };
}

export default function ServiceMapScreen({ query, onProviderSelect, onBack, location }: ServiceMapScreenProps) {
  const [deviceLocation, setDeviceLocation] = useState<{ lat: number; lng: number } | null>(location || null);
  
  useEffect(() => {
    if (!location && typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setDeviceLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setDeviceLocation({ lat: 37.7749, lng: -122.4194 })
      );
    }
  }, [location]);

  const { data: providers, isLoading } = trpc.provider.search.useQuery({
    query,
    location: deviceLocation ?? undefined
  });

  const topProvider = providers && providers.length > 0 ? providers[0] : null;

  return (
    <div className="w-full h-full bg-white rounded-[40px] overflow-hidden relative flex flex-col">
      {/* Map Layer */}
      <div className="absolute inset-0 bg-gray-100">
        <div className="absolute inset-0 opacity-20" style={{backgroundImage: `url('data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.2\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E')`}}></div>
        {/* Provider Pins */}
        {providers?.slice(0, 3).map((provider, index) => (
          <div
            key={provider.id}
            className={`absolute top-[${150 + index * 100}px] left-[${100 + index * 120}px] ${
              index === 0 ? 'bg-[#0A2540] text-white' : 'bg-white text-[#0A2540]'
            } text-[10px] font-bold px-2 py-1 rounded-lg shadow-lg border border-gray-200`}>
            ${provider.hourlyRate || 85}
          </div>
        ))}
      </div>

      {/* Header Overlay */}
      <div className="relative z-10 pt-12 px-4">
        <div className="flex gap-2 items-center">
          <button onClick={onBack} className="w-10 h-10 bg-white rounded-full shadow-soft flex items-center justify-center text-[#0A2540]">
            <iconify-icon icon="lucide:arrow-left" width="20"></iconify-icon>
          </button>
          <div className="flex-1 bg-white h-10 rounded-full shadow-soft flex items-center px-4 text-sm font-medium text-[#0A2540]">
            {query} nearby
          </div>
        </div>
      </div>

      {/* Bottom Sheet Preview */}
      {topProvider && (
        <div className="mt-auto relative z-10 bg-white m-4 p-4 rounded-2xl shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden">
              <img src={topProvider.imageUrl || `https://i.pravatar.cc/150?img=${topProvider.id}`} className="w-full h-full object-cover" alt={topProvider.name} />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-[#0A2540]">{topProvider.name}</h4>
              <div className="flex items-center gap-1 text-xs text-[#64748B]">
                <iconify-icon icon="lucide:star" className="text-yellow-400" width="12"></iconify-icon>
                <span>{(topProvider.rating || 49) / 10} ({topProvider.reviewCount || 0}+)</span> • <span>${topProvider.hourlyRate || 85}/hr</span>
              </div>
            </div>
            <button
              onClick={() => onProviderSelect(topProvider)}
              className="bg-[#0A2540] text-white px-4 py-2 rounded-lg text-sm font-medium">
              View
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

