// file: client/src/pages/ProviderDetailsPage.tsx
// description: Provider detail screen showing services, reviews, and booking actions
// reference: client/src/lib/trpc.ts, client/src/App.tsx

import { useAuth } from '@/_core/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { trpc } from '@/lib/trpc';
import { ArrowLeft, Clock, Globe, Heart, Leaf, MapPin, Phone, Share2, Star, Zap } from 'lucide-react';
import { useMemo, useState } from 'react';

interface ProviderDetailsPageProps {
  providerId?: number;
  provider?: {
    id: number,
    yelpId?: string | null,
    source?: 'yelp' | 'internal',
    name: string,
    category: string,
    description?: string | null,
    imageUrl?: string | null,
    rating?: number | null,
    reviewCount?: number | null,
    hourlyRate?: number | null,
    callOutFee?: number | null,
    address?: string | null,
    isAvailable?: boolean | null,
    availableIn?: number | null,
    specialties?: string | null,
    servicesOffered?: string[] | null,
    ecoFriendly?: boolean | null,
    bannerUrl?: string | null,
    phone?: string | null,
    website?: string | null
  };
  onBook: () => void;
  onBack: () => void;
}

export default function ProviderDetailsPage({ providerId, provider, onBook, onBack }: ProviderDetailsPageProps) {
  const { isAuthenticated } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);

  const hasProvidedProvider = Boolean(provider);
  const { data: providerFromApi, isLoading } = trpc.provider.get.useQuery({ id: providerId ?? 0 }, {
    enabled: Boolean(providerId) && !hasProvidedProvider
  });
  const { data: yelpDetails } = trpc.provider.getYelpBusiness.useQuery(
    { yelpBusinessId: provider?.yelpId || '' },
    { enabled: Boolean(provider?.yelpId) }
  );
  const currentProvider = useMemo(() => {
    const base = provider ?? providerFromApi;
    if (!base) return null;
    if (!yelpDetails) return base;

    const baseYelpId = (base as { yelpId?: string | null }).yelpId;

    return {
      ...base,
      yelpId: baseYelpId ?? yelpDetails.yelpId,
      rating: yelpDetails.rating ?? base.rating,
      reviewCount: yelpDetails.reviewCount ?? base.reviewCount,
      phone: yelpDetails.phone ?? base.phone,
      website: yelpDetails.website ?? base.website,
      address: yelpDetails.address ?? base.address,
      bannerUrl: base.bannerUrl ?? yelpDetails.bannerUrl ?? base.imageUrl ?? null,
      imageUrl: base.imageUrl ?? yelpDetails.imageUrl ?? null,
      specialties: base.specialties ?? yelpDetails.specialties,
      servicesOffered: (base as { servicesOffered?: string[] | null }).servicesOffered ?? yelpDetails.servicesOffered ?? null
    };
  }, [provider, providerFromApi, yelpDetails]);

  const currentYelpId = (currentProvider as { yelpId?: string | null } | null)?.yelpId;
  const reviewQueryInput = currentYelpId
    ? { yelpBusinessId: currentYelpId }
    : providerId
      ? { providerId }
      : null;
  const { data: reviews } = trpc.provider.getReviews.useQuery(
    reviewQueryInput as { providerId?: number, yelpBusinessId?: string },
    { enabled: Boolean(reviewQueryInput) }
  );

  const addFavorite = trpc.favorites.add.useMutation();
  const removeFavorite = trpc.favorites.remove.useMutation();

  const handleToggleFavorite = async () => {
    if (!isAuthenticated || !providerId) return;

    if (isFavorite) {
      await removeFavorite.mutateAsync({ providerId });
    } else {
      await addFavorite.mutateAsync({ providerId });
    }
    setIsFavorite(!isFavorite);
  };

  if ((!currentProvider && isLoading) || !currentProvider) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <div className='animate-pulse text-muted-foreground'>Loading provider details...</div>
      </div>
    );
  }

  const rating = currentProvider.rating ? (currentProvider.rating / 10).toFixed(1) : 'N/A';
  const hasPricingDetails = currentProvider.hourlyRate !== null && currentProvider.hourlyRate !== undefined;
  const hasCallOutFee = currentProvider.callOutFee !== null && currentProvider.callOutFee !== undefined;
  const servicesOffered = (currentProvider as { servicesOffered?: string[] | null }).servicesOffered ?? null;

  return (
    <div className='min-h-screen bg-background pb-24'>
      {/* Header with Image */}
      <div className='relative'>
        {/* Banner Image */}
        <div className='h-56 bg-muted overflow-hidden'>
          {currentProvider.bannerUrl ?
            <img src={currentProvider.bannerUrl} alt={currentProvider.name} className='w-full h-full object-cover' /> :
            <div className='w-full h-full bg-linear-to-br from-primary/20 to-primary/5' />}
        </div>

        {/* Back Button */}
        <Button
          variant='secondary'
          size='icon'
          onClick={onBack}
          className='absolute top-4 left-4 rounded-full bg-background/80 backdrop-blur-sm'>
          <ArrowLeft className='w-5 h-5' />
        </Button>

        {/* Action Buttons */}
        <div className='absolute top-4 right-4 flex gap-2'>
          <Button variant='secondary' size='icon' className='rounded-full bg-background/80 backdrop-blur-sm' onClick={handleToggleFavorite}>
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-primary text-primary' : ''}`} />
          </Button>
          <Button variant='secondary' size='icon' className='rounded-full bg-background/80 backdrop-blur-sm'>
            <Share2 className='w-5 h-5' />
          </Button>
        </div>

        {/* Provider Avatar */}
        <Avatar className='absolute -bottom-10 left-6 w-20 h-20 border-4 border-background shadow-lg'>
          <AvatarImage src={currentProvider.imageUrl || undefined} />
          <AvatarFallback className='text-xl bg-primary text-primary-foreground'>
            {currentProvider.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Provider Info */}
      <div className='pt-14 px-6'>
        <div className='flex items-start justify-between mb-2'>
          <div>
            <h1 className='text-2xl font-bold text-foreground'>{currentProvider.name}</h1>
            <p className='text-muted-foreground capitalize'>{currentProvider.category}</p>
          </div>
          {currentProvider.isAvailable && (
            <Badge variant='outline' className='bg-accent/50 text-accent-foreground border-accent'>Available Now</Badge>
          )}
        </div>

        {/* Rating and Reviews */}
        <div className='flex items-center gap-4 mb-4'>
          <div className='flex items-center gap-1'>
            <Star className='w-5 h-5 text-yellow-500 fill-yellow-500' />
            <span className='font-semibold text-foreground'>{rating}</span>
            <span className='text-muted-foreground'>({currentProvider.reviewCount || 0} reviews)</span>
          </div>
          {currentProvider.ecoFriendly && (
            <Badge variant='outline' className='bg-green-50 text-green-700 border-green-200'>
              <Leaf className='w-3 h-3 mr-1' />
              Eco-friendly
            </Badge>
          )}
        </div>

        {/* Contact Info */}
        <div className='flex flex-wrap gap-4 text-sm text-muted-foreground mb-6'>
          {currentProvider.address && (
            <span className='flex items-center gap-1'>
              <MapPin className='w-4 h-4' />
              {currentProvider.address}
            </span>
          )}
          {currentProvider.phone && (
            <a href={`tel:${currentProvider.phone}`} className='flex items-center gap-1 text-primary'>
              <Phone className='w-4 h-4' />
              {currentProvider.phone}
            </a>
          )}
          {currentProvider.website && (
            <a href={currentProvider.website} className='flex items-center gap-1 text-primary'>
              <Globe className='w-4 h-4' />
              Website
            </a>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue='overview' className='px-6'>
        <TabsList className='w-full grid grid-cols-4 mb-4'>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='reviews'>Reviews</TabsTrigger>
          <TabsTrigger value='services'>Services</TabsTrigger>
          <TabsTrigger value='photos'>Photos</TabsTrigger>
        </TabsList>

        <TabsContent value='overview' className='space-y-4'>
          {/* Description */}
          {currentProvider.description && (
            <Card>
              <CardContent className='p-4'>
                <h3 className='font-semibold mb-2'>About</h3>
                <p className='text-muted-foreground text-sm'>{currentProvider.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Specialties */}
          {currentProvider.specialties && (
            <Card>
              <CardContent className='p-4'>
                <h3 className='font-semibold mb-2'>Specialties</h3>
                <div className='flex flex-wrap gap-2'>
                  {currentProvider.specialties.split(',').map((specialty, i) => (
                    <Badge key={i} variant='secondary' className='capitalize'>{specialty.trim()}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className='p-4'>
              <h3 className='font-semibold mb-2 flex items-center gap-2'>
                <Clock className='w-4 h-4' />
                Availability
              </h3>
              {currentProvider.availableIn ? (
                <p className='text-sm text-foreground'>Usually available within {currentProvider.availableIn} minutes</p>
              ) : (
                <p className='text-sm text-muted-foreground'>Availability details not provided by this provider.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='reviews' className='space-y-4'>
          {reviews && reviews.length > 0 ?
            (reviews.map((review, index) => (
              <Card key={review.id}>
                <CardContent className='p-4'>
                  <div className='flex items-center gap-2 mb-2'>
                    <div className='flex'>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-muted'}`} />
                      ))}
                    </div>
                    <span className='text-sm text-muted-foreground'>{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                  {review.comment && <p className='text-sm text-foreground'>{review.comment}</p>}
                </CardContent>
              </Card>
            ))) :
            <div className='text-center py-8 text-muted-foreground'>No reviews yet. Be the first to review!</div>}
        </TabsContent>

        <TabsContent value='services' className='space-y-3'>
          {(hasPricingDetails || hasCallOutFee || currentProvider.specialties || servicesOffered?.length) ? (
            <Card>
              <CardContent className='p-4 space-y-3'>
                {hasPricingDetails && (
                  <div className='flex justify-between items-center'>
                    <span className='text-muted-foreground'>Hourly rate</span>
                    <span className='text-lg font-semibold text-foreground'>${currentProvider.hourlyRate}</span>
                  </div>
                )}
                {hasCallOutFee && (
                  <div className='flex justify-between items-center'>
                    <span className='text-muted-foreground'>Call-out fee</span>
                    <span className='text-foreground'>{currentProvider.callOutFee === 0 ? 'Free' : `$${currentProvider.callOutFee}`}</span>
                  </div>
                )}
                {currentProvider.specialties && (
                  <p className='text-sm text-muted-foreground'>Specialties: {currentProvider.specialties}</p>
                )}
                {servicesOffered?.length ? (
                  <div>
                    <p className='text-sm font-medium text-foreground mb-1'>Services</p>
                    <div className='flex flex-wrap gap-2'>
                      {servicesOffered.map((service: string, idx: number) => (
                        <Badge key={service + idx} variant='secondary' className='capitalize'>{service.replace(/_/g, ' ')}</Badge>
                      ))}
                    </div>
                  </div>
                ) : null}
                {!hasPricingDetails && !hasCallOutFee && !currentProvider.specialties && (
                  <p className='text-sm text-muted-foreground'>No service details provided. Contact the provider for pricing.</p>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className='text-center py-8 text-muted-foreground'>No service details provided. Contact the provider for pricing.</div>
          )}
        </TabsContent>

        <TabsContent value='photos'>
          <div className='grid grid-cols-2 gap-2'>
            {currentProvider.bannerUrl && (
              <img src={currentProvider.bannerUrl} alt='Provider' className='w-full h-32 object-cover rounded-lg' />
            )}
            {!currentProvider.bannerUrl && (
              <div className='w-full h-32 bg-muted rounded-lg flex items-center justify-center text-muted-foreground text-sm'>
                No additional photos provided
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Fixed Bottom CTA */}
      <div className='fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4'>
        <div className='max-w-md mx-auto flex gap-3'>
          <div className='flex-1'>
            <p className='text-sm text-muted-foreground'>Starting at</p>
            <p className='text-xl font-bold text-foreground'>
              {currentProvider.hourlyRate ? `$${currentProvider.hourlyRate}/hr` : 'Rate not provided'}
            </p>
          </div>
          <Button className='flex-1 h-12' onClick={onBook}>
            <Zap className='w-5 h-5 mr-2' />
            Book Now
          </Button>
        </div>
      </div>
    </div>
  );
}
