// file: client/src/components/screens/conversation/S11ProviderDetails.tsx
// description: Provider details screen fetching Yelp business info, reviews, services, and photos via tRPC
// reference: server/routers.ts, client/src/lib/trpc.ts, client/src/components/ui/avatar.tsx

'use client';

import { useState } from 'react';
import type { Provider } from '@/lib/types';
import { Icon, Button, Avatar } from '@/components/ui';
import { trpc } from '@/lib/trpc';

interface S11Props {
  provider: Provider;
  onBook: () => void;
  onBack: () => void;
}

const tabs = ['Overview', 'Reviews', 'Services', 'Photos'];

export default function S11ProviderDetails({ provider, onBook, onBack }: S11Props) {
  const [activeTab, setActiveTab] = useState(0);
  const [photoIndex, setPhotoIndex] = useState(0);

  // Fetch real data from API
  const { data: yelpDetails, isLoading: yelpLoading } = trpc.provider.getYelpBusiness.useQuery(
    { yelpBusinessId: provider.yelpId || '' },
    { enabled: Boolean(provider.yelpId) }
  );

  const { data: reviewsData, isLoading: reviewsLoading } = trpc.provider.getReviews.useQuery(
    provider.yelpId 
      ? { yelpBusinessId: provider.yelpId }
      : { providerId: parseInt(provider.id) },
    { enabled: Boolean(provider.yelpId) || (!isNaN(parseInt(provider.id)) && provider.id !== 'provider-0') }
  );

  // Use real photos from Yelp API, fallback to provider photo.
  const photos: string[] = (() => {
    const candidate = (yelpDetails as { photos?: unknown } | undefined)?.photos;
    if (Array.isArray(candidate) && candidate.every((photo): photo is string => typeof photo === 'string') && candidate.length > 0) {
      return candidate;
    }

    if (provider.photo) return [provider.photo];
    return [];
  })();

  // Use real reviews from API (Yelp reviews include `authorName`; DB reviews do not).
  const reviews = (reviewsData ?? []).map(review => {
    const authorName = ('authorName' in review ? review.authorName : undefined) ?? 'Anonymous';

    return {
      author: authorName || 'Anonymous',
      rating: review.rating || 5,
      text: review.comment || '',
      date: review.createdAt ? new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently',
    };
  });

  // Use real services/categories from Yelp, fallback to specialties
  const services = yelpDetails?.servicesOffered && yelpDetails.servicesOffered.length > 0
    ? yelpDetails.servicesOffered.map(service => ({
        name: service,
        price: provider.hourlyRate > 0 ? `$${provider.hourlyRate}/hr` : 'Contact for pricing',
        duration: 'Varies'
      }))
    : provider.specialties && provider.specialties.length > 0
      ? provider.specialties.map(specialty => ({
          name: specialty,
          price: provider.hourlyRate > 0 ? `$${provider.hourlyRate}/hr` : 'Contact for pricing',
          duration: 'Varies'
        }))
      : [];

  // Use real description from Yelp, fallback to specialties
  const description = yelpDetails?.description || 
    (provider.specialties && provider.specialties.length > 0 
      ? `Specializing in ${provider.specialties.join(', ')}.`
      : 'Local service provider.');

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="relative h-64 bg-gray-200">
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          <img src={photos[photoIndex]} alt={provider.name} className="w-full h-full object-cover" />
        </div>
        {photos.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {photos.map((_photo, idx) => (
              <button
                key={idx}
                onClick={() => setPhotoIndex(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  idx === photoIndex ? 'w-8 bg-white' : 'w-1.5 bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
        <button
          onClick={onBack}
          className="absolute top-14 left-4 h-9 w-9 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm"
        >
          <Icon name="x" size="md" className="text-[#0A2540]" />
        </button>
      </div>

      <div className="px-4 pt-4 pb-2 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-[#0A2540] mb-1">{provider.name}</h1>
        <div className="flex items-center gap-2 mb-2">
          <Icon name="star" size="sm" className="text-yellow-400" />
          <span className="text-sm text-gray-700">{provider.rating} ({provider.reviewCount} reviews)</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="flex gap-2 mb-4 border-b border-gray-100">
          {tabs.map((tab, idx) => (
            <button
              key={tab}
              onClick={() => setActiveTab(idx)}
              className={`pb-2 px-3 text-sm font-medium transition-colors ${
                activeTab === idx ? 'text-[#0A2540] border-b-2 border-[#0A2540]' : 'text-gray-400'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 0 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-[#0A2540] mb-2">About</h3>
              <p className="text-sm text-gray-600">{description}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#0A2540] mb-2">Specialties</h3>
              <div className="flex flex-wrap gap-2">
                {provider.specialties.map((spec, idx) => (
                  <span key={idx} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs">
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 1 && (
          <div className="space-y-4">
            {reviewsLoading ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500">Loading reviews...</p>
              </div>
            ) : reviews.length > 0 ? (
              reviews.map((review, idx) => (
                <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-[#0A2540]">{review.author}</span>
                    <div className="flex text-yellow-400 text-xs">
                      {[...Array(Math.min(review.rating, 5))].map((_, i) => (
                        <Icon key={i} name="star" size="xs" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">{review.text}</p>
                  <p className="text-xs text-gray-400 mt-1">{review.date}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500">No reviews available yet.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 2 && (
          <div className="space-y-3">
            {services.length > 0 ? (
              services.map((service, idx) => (
                <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-semibold text-[#0A2540]">{service.name}</h4>
                      <p className="text-xs text-gray-500 mt-1">{service.duration}</p>
                    </div>
                    <span className="text-sm font-bold text-[#0A2540]">{service.price}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500">No services listed.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 3 && (
          <div className="grid grid-cols-2 gap-3">
            {photos.length > 0 ? (
              photos.map((photo, idx) => (
                <div key={idx} className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                  <img 
                    src={photo} 
                    alt={`${provider.name} - Photo ${idx + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = provider.photo || '';
                    }}
                  />
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-8">
                <p className="text-sm text-gray-500">No photos available.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-100 bg-white">
        <Button variant="primary" size="lg" fullWidth onClick={onBook}>
          Book Now
        </Button>
      </div>
    </div>
  );
}

