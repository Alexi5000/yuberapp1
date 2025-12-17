// file: client/src/pages/BookingConfirmation.tsx
// description: Booking confirmation flow for selecting schedule and location details
// reference: client/src/App.tsx

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Clock, MapPin, Star, Wrench } from 'lucide-react';
import { useState } from 'react';

interface Provider {
  id: number;
  name: string;
  category: string;
  imageUrl?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
  hourlyRate?: number | null;
  callOutFee?: number | null;
  availableIn?: number | null;
}

interface BookingConfirmationProps {
  provider: Provider;
  serviceType: string;
  onConfirm: (bookingDetails: {
    scheduledAt?: string,
    isAsap: boolean,
    locationAddress: string,
    specialInstructions: string,
    estimatedCostMin: number,
    estimatedCostMax: number
  }) => void;
  onCancel: () => void;
  onBack: () => void;
}

export default function BookingConfirmation({ provider, serviceType, onConfirm, onCancel, onBack }: BookingConfirmationProps) {
  const [isAsap, setIsAsap] = useState(true);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [locationAddress, setLocationAddress] = useState('Current location');
  const [specialInstructions, setSpecialInstructions] = useState('');

  const rating = provider.rating ? (provider.rating / 10).toFixed(1) : '4.9';
  const hourlyRate = provider.hourlyRate || 85;
  const callOutFee = provider.callOutFee || 0;
  const estimatedMin = hourlyRate;
  const estimatedMax = hourlyRate * 2;

  const handleConfirm = () => {
    const basePayload = { isAsap, locationAddress, specialInstructions };
    const scheduledAt = !isAsap && scheduledDate && scheduledTime ? `${scheduledDate}T${scheduledTime}` : null;

    const payload = { ...basePayload, estimatedCostMin: estimatedMin, estimatedCostMax: estimatedMax };
    onConfirm(scheduledAt ? { ...payload, scheduledAt } : payload);
  };

  return (
    <div className='min-h-screen bg-background pb-32'>
      {/* Header */}
      <div className='sticky top-0 z-10 bg-background border-b border-border'>
        <div className='flex items-center p-4'>
          <Button variant='ghost' size='icon' onClick={onBack} className='mr-3'>
            <ArrowLeft className='w-5 h-5' />
          </Button>
          <h1 className='text-xl font-semibold text-foreground'>Confirm Booking</h1>
        </div>
      </div>

      <div className='p-4 space-y-4'>
        {/* Provider Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardContent className='p-4'>
              <div className='flex items-center gap-4'>
                <Avatar className='w-14 h-14'>
                  <AvatarImage src={provider.imageUrl || undefined} />
                  <AvatarFallback className='bg-primary text-primary-foreground'>
                    {provider.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className='flex-1'>
                  <div className='flex items-center justify-between'>
                    <h3 className='font-semibold text-foreground'>{provider.name}</h3>
                    <Badge variant='outline' className='bg-accent/50 text-accent-foreground border-accent'>
                      <span className='w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5'></span>
                      {provider.availableIn || 5} min
                    </Badge>
                  </div>
                  <div className='flex items-center gap-1 text-sm text-muted-foreground'>
                    <Star className='w-3.5 h-3.5 text-yellow-500 fill-yellow-500' />
                    <span>{rating}</span>
                    <span>({provider.reviewCount || 152} reviews)</span>
                  </div>
                </div>
              </div>
              <div className='flex items-center gap-2 mt-3 text-sm text-muted-foreground'>
                <Wrench className='w-4 h-4' />
                <span className='capitalize'>{serviceType}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Booking Details */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardContent className='p-4'>
              <h3 className='text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4'>Booking Details</h3>

              {/* When */}
              <div className='flex items-center justify-between py-3 border-b border-border'>
                <div className='flex items-center gap-3'>
                  <div className='w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center'>
                    <Clock className='w-5 h-5 text-primary' />
                  </div>
                  <div>
                    <p className='font-medium text-foreground'>When</p>
                    <p className='text-sm text-muted-foreground'>{isAsap ? 'ASAP - Today' : scheduledDate || 'Select date'}</p>
                  </div>
                </div>
                <Button variant='ghost' className='text-primary' onClick={() => setIsAsap(!isAsap)}>{isAsap ? 'Schedule' : 'ASAP'}</Button>
              </div>

              {/* Date/Time picker when not ASAP */}
              {!isAsap && (
                <div className='py-3 border-b border-border space-y-3'>
                  <div className='flex gap-3'>
                    <Input type='date' value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} className='flex-1' />
                    <Input type='time' value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} className='flex-1' />
                  </div>
                </div>
              )}

              {/* Location */}
              <div className='flex items-center justify-between py-3'>
                <div className='flex items-center gap-3'>
                  <div className='w-10 h-10 bg-accent/50 rounded-full flex items-center justify-center'>
                    <MapPin className='w-5 h-5 text-accent-foreground' />
                  </div>
                  <div>
                    <p className='font-medium text-foreground'>Location</p>
                    <p className='text-sm text-muted-foreground'>{locationAddress}</p>
                  </div>
                </div>
                <Button variant='ghost' className='text-primary'>Change</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Special Instructions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardContent className='p-4'>
              <h3 className='text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3'>Special Instructions (Optional)</h3>
              <Textarea
                placeholder='Any details the provider should know...'
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                className='min-h-20' />
            </CardContent>
          </Card>
        </motion.div>

        {/* Estimated Cost */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardContent className='p-4'>
              <h3 className='text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4'>Estimated Cost</h3>
              <div className='space-y-2'>
                <div className='flex justify-between text-sm'>
                  <span className='text-muted-foreground'>Hourly rate</span>
                  <span className='text-foreground'>${hourlyRate}/hr</span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-muted-foreground'>Call-out fee</span>
                  <span className={callOutFee === 0 ? 'text-accent-foreground' : 'text-foreground'}>
                    {callOutFee === 0 ? 'Free' : `$${callOutFee}`}
                  </span>
                </div>
                <div className='border-t border-border pt-2 mt-2'>
                  <div className='flex justify-between'>
                    <span className='font-medium text-foreground'>Estimated total</span>
                    <span className='text-xl font-bold text-foreground'>${estimatedMin} - ${estimatedMax}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Fixed Bottom CTA */}
      <div className='fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4'>
        <div className='max-w-md mx-auto space-y-3'>
          <Button className='w-full h-14 text-lg font-semibold' onClick={handleConfirm}>
            <Check className='w-5 h-5 mr-2' />
            Confirm & Book
          </Button>
          <Button variant='ghost' className='w-full' onClick={onCancel}>Cancel</Button>
        </div>
      </div>
    </div>
  );
}
