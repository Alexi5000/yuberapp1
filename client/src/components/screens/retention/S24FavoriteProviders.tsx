'use client';

import type { Provider } from '@/lib/types';
import { Icon, Avatar } from '@/components/ui';

interface S24Props {
  favorites: Provider[];
  onSelect: (provider: Provider) => void;
  onBack: () => void;
}

export default function S24FavoriteProviders({ favorites, onSelect, onBack }: S24Props) {
  return (
    <div className="flex h-full flex-col bg-[#F7FAFC]">
      <div className="flex items-center justify-between px-4 pt-14 pb-4 bg-white border-b border-gray-100">
        <button onClick={onBack} className="p-2 text-gray-400 hover:text-[#0A2540]">
          <Icon name="arrow-left" size="md" />
        </button>
        <span className="text-sm font-semibold text-[#0A2540]">Favorite Providers</span>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {favorites.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="heart" size="xl" className="text-gray-300 mx-auto mb-4" />
            <p className="text-sm text-gray-500">No favorites yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {favorites.map((provider) => (
              <button
                key={provider.id}
                onClick={() => onSelect(provider)}
                className="w-full bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all text-left"
              >
                <div className="flex items-center gap-4">
                  <Avatar src={provider.photo} name={provider.name} size="lg" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#0A2540] mb-1">{provider.name}</h3>
                    <div className="flex items-center gap-2 mb-1">
                      <Icon name="star" size="xs" className="text-yellow-400" />
                      <span className="text-xs text-gray-600">{provider.rating} ({provider.reviewCount} reviews)</span>
                    </div>
                    <p className="text-xs text-gray-500">{provider.distance} mi away</p>
                  </div>
                  <Icon name="chevron-right" size="sm" className="text-gray-400" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

