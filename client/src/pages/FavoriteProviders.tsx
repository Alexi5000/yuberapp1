import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, MessageCircle, Star, Zap } from 'lucide-react';

type FavoriteProvider = {
  id: number;
  name?: string | null;
  category?: string | null;
  imageUrl?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
};

interface FavoriteProvidersProps {
  onSelectProvider: (provider: FavoriteProvider) => void;
  onBookProvider: (provider: FavoriteProvider) => void;
  onBack: () => void;
}

export default function FavoriteProviders({ onSelectProvider, onBookProvider, onBack }: FavoriteProvidersProps) {
  // favorites.list returns providers directly (not favorites with nested provider)
  const { data: favorites, isLoading } = trpc.favorites.list.useQuery();
  const removeFavorite = trpc.favorites.remove.useMutation();
  const utils = trpc.useUtils();

  const handleRemoveFavorite = async (providerId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    await removeFavorite.mutateAsync({ providerId });
    utils.favorites.list.invalidate();
  };

  return (
    <div className='min-h-screen bg-background'>
      {/* Header */}
      <div className='sticky top-0 z-10 bg-background border-b border-border'>
        <div className='flex items-center p-4'>
          <Button variant='ghost' size='icon' onClick={onBack} className='mr-3'>
            <ArrowLeft className='w-5 h-5' />
          </Button>
          <div>
            <h1 className='text-xl font-semibold text-foreground'>Favorite Providers</h1>
            <p className='text-sm text-muted-foreground'>{favorites?.length || 0} saved</p>
          </div>
        </div>
      </div>

      <div className='p-4'>
        {isLoading ?
          (
            <div className='space-y-3'>
              {[1, 2, 3].map((i) => (
                <Card key={i} className='animate-pulse'>
                  <CardContent className='p-4'>
                    <div className='flex gap-4'>
                      <div className='w-16 h-16 bg-muted rounded-lg' />
                      <div className='flex-1 space-y-2'>
                        <div className='h-4 bg-muted rounded w-3/4' />
                        <div className='h-3 bg-muted rounded w-1/2' />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) :
          favorites && favorites.length > 0 ?
          (
            <div className='space-y-3'>
              {favorites.map((provider, index) => (
                <motion.div
                  key={provider.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}>
                  <Card
                    className='cursor-pointer hover:shadow-md transition-shadow'
                    onClick={() => onSelectProvider(provider)}>
                    <CardContent className='p-4'>
                      <div className='flex gap-4'>
                        {/* Provider Image */}
                        <Avatar className='w-16 h-16 rounded-lg'>
                          <AvatarImage src={provider.imageUrl || undefined} className='object-cover' />
                          <AvatarFallback className='rounded-lg bg-primary/10 text-primary'>
                            {provider.name?.split(' ').map(n => n[0]).join('') || '?'}
                          </AvatarFallback>
                        </Avatar>

                        {/* Provider Info */}
                        <div className='flex-1 min-w-0'>
                          <div className='flex items-start justify-between mb-1'>
                            <h3 className='font-semibold text-foreground truncate'>{provider.name || 'Unknown Provider'}</h3>
                            <Button
                              variant='ghost'
                              size='icon'
                              className='text-primary -mt-1 -mr-2'
                              onClick={(e) => handleRemoveFavorite(provider.id, e)}>
                              <Heart className='w-5 h-5 fill-current' />
                            </Button>
                          </div>

                          <p className='text-sm text-muted-foreground capitalize mb-2'>{provider.category || 'Service Provider'}</p>

                          <div className='flex items-center gap-3 text-sm text-muted-foreground'>
                            <span className='flex items-center gap-1'>
                              <Star className='w-3.5 h-3.5 text-yellow-500 fill-yellow-500' />
                              {provider.rating ? (provider.rating / 10).toFixed(1) : '4.5'}
                            </span>
                            <span>({provider.reviewCount || 0} reviews)</span>
                          </div>

                          {/* Quick Actions */}
                          <div className='flex gap-2 mt-3'>
                            <Button
                              size='sm'
                              className='flex-1'
                              onClick={(e) => {
                                e.stopPropagation();
                                onBookProvider(provider);
                              }}>
                              <Zap className='w-4 h-4 mr-1' />
                              Book Now
                            </Button>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={(e) => {
                                e.stopPropagation();
                                // Message functionality
                              }}>
                              <MessageCircle className='w-4 h-4' />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) :
          (
            <div className='text-center py-12'>
              <div className='w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4'>
                <Heart className='w-8 h-8 text-muted-foreground' />
              </div>
              <h3 className='text-lg font-medium text-foreground mb-2'>No favorites yet</h3>
              <p className='text-muted-foreground mb-6'>Save your favorite providers for quick access</p>
              <Button variant='outline' onClick={onBack}>Find Providers</Button>
            </div>
          )}
      </div>
    </div>
  );
}
