// file: client/src/pages/AIRecommendationCard.tsx
// description: Renders the AI recommendation detail card with provider data and actions
// reference: client/src/App.tsx, client/src/lib/trpc.ts

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Sparkles, Star, Zap } from 'lucide-react';

interface Provider {
  id: number;
  name: string;
  category: string;
  description?: string | null;
  imageUrl?: string | null;
  bannerUrl?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
  hourlyRate?: number | null;
  callOutFee?: number | null;
  distance?: number | null;
  address?: string | null;
  isAvailable?: boolean | null;
  availableIn?: number | null;
  specialties?: string | null;
  servicesOffered?: string[] | null;
  ecoFriendly?: boolean | null;
}

interface AIRecommendationCardProps {
  provider: Provider;
  reasons: string[];
  estimatedCost: { min: number, max: number };
  onBook: () => void;
  onSeeOthers: () => void;
  onViewDetails: () => void;
  onBack: () => void;
}

export default function AIRecommendationCard(
  { provider, reasons, estimatedCost, onBook, onSeeOthers, onViewDetails, onBack }: AIRecommendationCardProps
) {
  const rating = provider.rating ? (provider.rating / 10).toFixed(1) : null;
  const callOutFee = provider.callOutFee;
  const distance = provider.distance !== undefined && provider.distance !== null ? provider.distance.toFixed(1) : null;
  const hourlyRate = provider.hourlyRate;

  return (
    <div className='min-h-screen bg-muted/30'>
      {/* Header with back button */}
      <div className='sticky top-0 z-10 bg-background/80 backdrop-blur-sm'>
        <div className='flex items-center p-4'>
          <Button variant='ghost' size='icon' onClick={onBack} className='mr-2'>
            <ArrowLeft className='w-5 h-5' />
          </Button>
        </div>
      </div>

      {/* Provider Banner/Image Area */}
      <div className='relative h-48 bg-muted overflow-hidden'>
        {provider.bannerUrl ?
          <img src={provider.bannerUrl} alt={provider.name} className='w-full h-full object-cover' /> :
          (
            <div className='w-full h-full bg-linear-to-br from-muted to-muted-foreground/10 flex items-center justify-center'>
              <div className='w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center'>
                <Zap className='w-10 h-10 text-primary' />
              </div>
            </div>
          )}

        {/* Dot pattern overlay */}
        <div
          className='absolute inset-0 opacity-30'
          style={{ backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`, backgroundSize: '20px 20px' }} />
      </div>

      {/* Main Card */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className='relative -mt-6 mx-4'>
        <Card className='shadow-xl'>
          <CardContent className='p-6'>
            {/* Availability Badge */}
            {provider.isAvailable && (
              <Badge variant='outline' className='mb-4 bg-accent/50 text-accent-foreground border-accent'>
                <span className='w-2 h-2 bg-green-500 rounded-full mr-2'></span>
                {provider.availableIn ? `Available in ${provider.availableIn} mins` : 'Available now'}
              </Badge>
            )}

            {/* Provider Info */}
            <div className='flex items-start justify-between mb-4'>
              <div>
                <h1 className='text-2xl font-bold text-foreground mb-1'>{provider.name}</h1>
                <div className='flex items-center gap-1 text-muted-foreground'>
                  <Star className='w-4 h-4 text-yellow-500 fill-yellow-500' />
                  <span className='font-medium text-foreground'>{rating ?? 'N/A'}</span>
                  <span>({provider.reviewCount ?? 0} reviews)</span>
                </div>
              </div>
              <Avatar className='w-14 h-14 border-2 border-background shadow-md'>
                <AvatarImage src={provider.imageUrl || undefined} />
                <AvatarFallback className='bg-primary text-primary-foreground'>
                  {provider.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Quick Stats */}
            <div className='grid grid-cols-3 gap-4 py-4 border-y border-border mb-4'>
              <div>
                <p className='text-xs text-muted-foreground uppercase tracking-wide'>Rate</p>
                <p className='text-lg font-bold text-foreground'>
                  {hourlyRate !== null && hourlyRate !== undefined ? `$${hourlyRate}` : '—'}
                  {hourlyRate !== null && hourlyRate !== undefined && <span className='text-sm font-normal text-muted-foreground'>/hr
                  </span>}
                </p>
              </div>
              <div>
                <p className='text-xs text-muted-foreground uppercase tracking-wide'>Call-out</p>
                <p className='text-lg font-bold text-accent-foreground'>
                  {callOutFee === 0 ? 'Free' : callOutFee ? `$${callOutFee}` : '—'}
                </p>
              </div>
              <div>
                <p className='text-xs text-muted-foreground uppercase tracking-wide'>Distance</p>
                <p className='text-lg font-bold text-foreground'>{distance ? `${distance} mi` : '—'}</p>
              </div>
            </div>

            {/* Why I Chose Section - THE KEY DIFFERENTIATOR */}
            <div className='bg-accent/30 rounded-xl p-4 mb-6'>
              <div className='flex items-center gap-2 mb-3'>
                <Sparkles className='w-5 h-5 text-accent-foreground' />
                <h3 className='font-semibold text-accent-foreground uppercase text-sm tracking-wide'>
                  Why I chose {provider.name.split(' ')[0]} for you
                </h3>
              </div>
              <ul className='space-y-2'>
                {reasons.map((reason, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className='flex items-start gap-2'>
                    <Check className='w-4 h-4 text-green-600 mt-0.5 shrink-0' />
                    <span className='text-sm text-foreground'>{reason}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Book Now Button */}
            <Button className='w-full h-14 text-lg font-semibold mb-3' onClick={onBook}>
              <Zap className='w-5 h-5 mr-2' />
              Book Now
            </Button>

            {/* Secondary Actions */}
            <div className='flex gap-3'>
              <Button variant='outline' className='flex-1' onClick={onSeeOthers}>See other options</Button>
              <Button variant='outline' className='flex-1' onClick={onViewDetails}>View full details</Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Bottom padding */}
      <div className='h-8' />
    </div>
  );
}

// Wrapper component that fetches provider data
interface AIRecommendationWrapperProps {
  providerId: number;
  serviceType: string;
  onBook: (provider: Provider) => void;
  onSeeOthers: () => void;
  onViewDetails: (providerId: number) => void;
  onBack: () => void;
}

export function AIRecommendationWrapper(
  { providerId, serviceType, onBook, onSeeOthers, onViewDetails, onBack }: AIRecommendationWrapperProps
) {
  const { data: provider, isLoading } = trpc.provider.get.useQuery({ id: providerId });

  // Generate reasons based on provider data
  const generateReasons = (p: Provider): string[] => {
    const reasons: string[] = [];

    if (p.rating) {
      reasons.push(`Highest-rated ${p.category} provider within 5 miles with ${(p.rating / 10).toFixed(1)} stars`);
    }

    if (p.isAvailable) {
      reasons.push(`Available now with ${p.availableIn || 5}-minute ETA`);
    }

    if (p.specialties) {
      reasons.push(`Specializes in ${p.specialties}`);
    }

    if (p.reviewCount) {
      reasons.push(`${p.reviewCount} verified reviews averaging ${((p.rating || 49) / 10).toFixed(1)} stars`);
    }

    if (p.callOutFee === 0) {
      reasons.push('No call-out fee for your area');
    }

    if (p.ecoFriendly) {
      reasons.push('Eco-friendly products and practices');
    }

    // Ensure at least 3 reasons
    while (reasons.length < 3) {
      reasons.push('Highly recommended by local customers');
    }

    return reasons.slice(0, 5);
  };

  if (isLoading || !provider) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <div className='animate-pulse text-muted-foreground'>Loading recommendation...</div>
      </div>
    );
  }

  return (
    <AIRecommendationCard
      provider={provider}
      reasons={generateReasons(provider)}
      estimatedCost={{ min: provider.hourlyRate || 50, max: (provider.hourlyRate || 50) * 2 }}
      onBook={() => onBook(provider)}
      onSeeOthers={onSeeOthers}
      onViewDetails={() => onViewDetails(provider.id)}
      onBack={onBack} />
  );
}
