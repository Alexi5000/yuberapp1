import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Check, MapPin, MessageCircle, Phone } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Provider {
  id: number;
  name: string;
  imageUrl?: string | null;
  rating?: number | null;
}

interface DispatchInProgressProps {
  provider: Provider;
  eta: number; // minutes
  onViewMap: () => void;
  onCall: () => void;
  onMessage: () => void;
}

export default function DispatchInProgress({ provider, eta, onViewMap, onCall, onMessage }: DispatchInProgressProps) {
  const [currentEta, setCurrentEta] = useState(eta);

  // Calculate arrival time
  const arrivalTime = new Date();
  arrivalTime.setMinutes(arrivalTime.getMinutes() + currentEta);
  const formattedArrivalTime = arrivalTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  // Simulate ETA countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentEta(prev => Math.max(0, prev - 1));
    }, 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  // Auto-advance to map after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onViewMap();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onViewMap]);

  return (
    <div className='min-h-screen bg-background flex flex-col items-center justify-center p-6'>
      {/* Success Animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className='w-24 h-24 bg-accent rounded-full flex items-center justify-center mb-6'>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}>
          <Check className='w-12 h-12 text-accent-foreground' strokeWidth={3} />
        </motion.div>
      </motion.div>

      {/* Message */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className='text-2xl font-bold text-foreground mb-2 text-center'>
        Help is on the way!
      </motion.h1>

      {/* Provider Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className='w-full max-w-sm mt-6'>
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-4 mb-4'>
              <Avatar className='w-16 h-16'>
                <AvatarImage src={provider.imageUrl || undefined} />
                <AvatarFallback className='bg-primary text-primary-foreground text-xl'>
                  {provider.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className='font-semibold text-foreground text-lg'>{provider.name}</h3>
                <p className='text-muted-foreground'>
                  will arrive by <span className='font-medium text-foreground'>{formattedArrivalTime}</span>
                </p>
                <p className='text-sm text-accent-foreground'>Arriving in {currentEta} minutes</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className='flex gap-3'>
              <Button variant='outline' className='flex-1' onClick={onCall}>
                <Phone className='w-4 h-4 mr-2' />
                Call {provider.name.split(' ')[0]}
              </Button>
              <Button variant='outline' className='flex-1' onClick={onMessage}>
                <MessageCircle className='w-4 h-4 mr-2' />
                Message
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* View on Map */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className='mt-4'>
        <Button variant='ghost' onClick={onViewMap} className='text-primary'>
          <MapPin className='w-4 h-4 mr-2' />
          View on map
        </Button>
      </motion.div>
    </div>
  );
}
