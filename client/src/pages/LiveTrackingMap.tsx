import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { MessageCircle, Phone } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Provider {
  id: number;
  name: string;
  imageUrl?: string | null;
}

interface LiveTrackingMapProps {
  provider: Provider;
  initialEta: number;
  onProviderArrived: () => void;
  onCall: () => void;
  onMessage: () => void;
}

export default function LiveTrackingMap({ provider, initialEta, onProviderArrived, onCall, onMessage }: LiveTrackingMapProps) {
  const [eta, setEta] = useState(initialEta);
  const [providerPosition, setProviderPosition] = useState({ x: 30, y: 70 });
  const userPosition = { x: 50, y: 30 };

  // Simulate provider movement
  useEffect(() => {
    const moveInterval = setInterval(() => {
      setProviderPosition(prev => {
        const dx = (userPosition.x - prev.x) * 0.1;
        const dy = (userPosition.y - prev.y) * 0.1;
        const newX = prev.x + dx;
        const newY = prev.y + dy;

        // Check if arrived
        const distance = Math.sqrt(Math.pow(userPosition.x - newX, 2) + Math.pow(userPosition.y - newY, 2));
        if (distance < 3) {
          clearInterval(moveInterval);
          setTimeout(onProviderArrived, 1000);
        }

        return { x: newX, y: newY };
      });

      setEta(prev => Math.max(0, prev - 1));
    }, 2000);

    return () => clearInterval(moveInterval);
  }, [onProviderArrived]);

  return (
    <div className='min-h-screen bg-muted relative'>
      {/* Map Container */}
      <div className='absolute inset-0 bg-linear-to-b from-blue-50 to-green-50'>
        {/* Grid pattern to simulate map */}
        <div
          className='absolute inset-0 opacity-20'
          style={{
            backgroundImage: `
              linear-gradient(to right, #888 1px, transparent 1px),
              linear-gradient(to bottom, #888 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }} />

        {/* Simulated streets */}
        <div className='absolute top-1/4 left-0 right-0 h-2 bg-gray-300' />
        <div className='absolute top-1/2 left-0 right-0 h-3 bg-gray-400' />
        <div className='absolute top-3/4 left-0 right-0 h-2 bg-gray-300' />
        <div className='absolute left-1/4 top-0 bottom-0 w-2 bg-gray-300' />
        <div className='absolute left-1/2 top-0 bottom-0 w-3 bg-gray-400' />
        <div className='absolute left-3/4 top-0 bottom-0 w-2 bg-gray-300' />

        {/* Route line */}
        <svg className='absolute inset-0 w-full h-full'>
          <line
            x1={`${providerPosition.x}%`}
            y1={`${providerPosition.y}%`}
            x2={`${userPosition.x}%`}
            y2={`${userPosition.y}%`}
            stroke='#FF6B6B'
            strokeWidth='3'
            strokeDasharray='8 4' />
        </svg>

        {/* User Location Pin */}
        <motion.div
          className='absolute'
          style={{ left: `${userPosition.x}%`, top: `${userPosition.y}%`, transform: 'translate(-50%, -100%)' }}>
          <div className='relative'>
            <div className='w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg'>
              <div className='w-3 h-3 bg-white rounded-full' />
            </div>
            <div className='absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-8 border-l-transparent border-r-transparent border-t-blue-500' />
          </div>
          <p className='text-xs font-medium text-center mt-1 bg-white px-2 py-0.5 rounded shadow'>You</p>
        </motion.div>

        {/* Provider Location Pin */}
        <motion.div
          className='absolute'
          style={{ left: `${providerPosition.x}%`, top: `${providerPosition.y}%`, transform: 'translate(-50%, -100%)' }}
          animate={{ left: `${providerPosition.x}%`, top: `${providerPosition.y}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}>
          <div className='relative'>
            <div className='w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg border-2 border-white overflow-hidden'>
              {provider.imageUrl ?
                <img src={provider.imageUrl} alt={provider.name} className='w-full h-full object-cover' /> :
                <span className='text-white font-bold'>{provider.name.split(' ').map(n => n[0]).join('')}</span>}
            </div>
            <div className='absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-8 border-l-transparent border-r-transparent border-t-primary' />
          </div>
        </motion.div>
      </div>

      {/* Top Info Bar */}
      <div className='absolute top-0 left-0 right-0 p-4 bg-linear-to-b from-background/90 to-transparent'>
        <Card className='shadow-lg'>
          <CardContent className='p-3'>
            <div className='flex items-center gap-3'>
              <Avatar className='w-12 h-12'>
                <AvatarImage src={provider.imageUrl || undefined} />
                <AvatarFallback className='bg-primary text-primary-foreground'>
                  {provider.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className='flex-1'>
                <h3 className='font-semibold text-foreground'>{provider.name}</h3>
                <p className='text-sm text-muted-foreground'>On the way</p>
              </div>
              <div className='text-right'>
                <p className='text-2xl font-bold text-foreground'>{eta}</p>
                <p className='text-xs text-muted-foreground'>min away</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Action Bar */}
      <div className='absolute bottom-0 left-0 right-0 p-4 bg-linear-to-t from-background to-transparent'>
        <Card className='shadow-lg'>
          <CardContent className='p-4'>
            <div className='flex gap-3'>
              <Button variant='outline' className='flex-1 h-12' onClick={onCall}>
                <Phone className='w-5 h-5 mr-2' />
                Call
              </Button>
              <Button variant='outline' className='flex-1 h-12' onClick={onMessage}>
                <MessageCircle className='w-5 h-5 mr-2' />
                Message
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
