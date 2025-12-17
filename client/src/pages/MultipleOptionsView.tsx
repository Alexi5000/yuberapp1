// file: client/src/pages/MultipleOptionsView.tsx
// description: Lists alternative providers for a service type and lets users pick one
// reference: client/src/lib/trpc.ts, client/src/App.tsx

import { useAuth } from '@/_core/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Star } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ProviderOption {
  id: number;
  yelpId?: string | null;
  source?: 'yelp' | 'internal';
  name: string;
  category: string;
  description?: string | null;
  imageUrl?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
  hourlyRate?: number | null;
  callOutFee?: number | null;
  availableIn?: number | null;
  specialties?: string | null;
  isAvailable?: boolean | null;
  distance?: number | null;
  servicesOffered?: string[] | null;
}

interface MultipleOptionsViewProps {
  serviceType: string;
  onSelectProvider: (provider: ProviderOption) => void;
  onBack: () => void;
}

export default function MultipleOptionsView({ serviceType, onSelectProvider, onBack }: MultipleOptionsViewProps) {
  const { user } = useAuth();
  const locationAllowed = user?.locationEnabled !== false;
  const [deviceLocation, setDeviceLocation] = useState<{ lat: number, lng: number } | null>(null);

  useEffect(() => {
    if (!locationAllowed) return;
    if (typeof window === 'undefined' || !('geolocation' in navigator)) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => setDeviceLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setDeviceLocation(null),
      { enableHighAccuracy: true, maximumAge: 60_000 }
    );
  }, [locationAllowed]);

  const { data: providers, isLoading } = trpc.provider.search.useQuery({ query: serviceType, location: deviceLocation ?? undefined });

  if (isLoading) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <div className='animate-pulse text-muted-foreground'>Loading options...</div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-background'>
      {/* Header */}
      <div className='sticky top-0 z-10 bg-background border-b border-border'>
        <div className='flex items-center p-4'>
          <Button variant='ghost' size='icon' onClick={onBack} className='mr-3'>
            <ArrowLeft className='w-5 h-5' />
          </Button>
          <div>
            <h1 className='text-lg font-semibold text-foreground'>Other great options for you</h1>
            <p className='text-sm text-muted-foreground'>{providers?.length || 0} providers found</p>
          </div>
        </div>
      </div>

      {/* Provider List */}
      <div className='p-4 space-y-3'>
        {providers?.map((provider: ProviderOption, index: number) => (
          <motion.div key={provider.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
            <Card
              className='cursor-pointer hover:shadow-md transition-shadow'
              onClick={() => onSelectProvider(provider as ProviderOption)}>
              <CardContent className='p-4'>
                <div className='flex gap-4'>
                  {/* Provider Image */}
                  <Avatar className='w-16 h-16 rounded-lg'>
                    <AvatarImage src={provider.imageUrl || undefined} className='object-cover' />
                    <AvatarFallback className='rounded-lg bg-primary/10 text-primary'>
                      {provider.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>

                  {/* Provider Info */}
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-start justify-between mb-1'>
                      <h3 className='font-semibold text-foreground truncate'>{provider.name}</h3>
                      {provider.isAvailable && (
                        <span className='text-xs text-accent-foreground bg-accent/50 px-2 py-0.5 rounded-full shrink-0 ml-2'>
                          {provider.availableIn || 5} min
                        </span>
                      )}
                    </div>

                    <div className='flex items-center gap-3 text-sm text-muted-foreground mb-2'>
                      <span className='flex items-center gap-1'>
                        <Star className='w-3.5 h-3.5 text-yellow-500 fill-yellow-500' />
                        {provider.rating ? (provider.rating / 10).toFixed(1) : 'N/A'}
                      </span>
                      <span>({provider.reviewCount || 0} reviews)</span>
                      <span className='flex items-center gap-1'>
                        <MapPin className='w-3.5 h-3.5' />
                        {(provider.distance ?? 2.3).toFixed(1)} mi
                      </span>
                    </div>

                    <p className='text-sm text-muted-foreground line-clamp-1'>
                      {provider.specialties || provider.description || `Expert ${provider.category} services`}
                    </p>

                    <div className='flex items-center gap-4 mt-2 text-sm'>
                      <span className='font-medium text-foreground'>${provider.hourlyRate || 50}/hr</span>
                      {provider.callOutFee === 0 && <span className='text-accent-foreground'>Free call-out</span>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {(!providers || providers.length === 0) && (
          <div className='text-center py-12'>
            <p className='text-muted-foreground'>No other providers found in your area.</p>
            <Button variant='outline' onClick={onBack} className='mt-4'>Go back</Button>
          </div>
        )}
      </div>
    </div>
  );
}
