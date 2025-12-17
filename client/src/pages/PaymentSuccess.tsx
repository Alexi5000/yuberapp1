import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Check, Home, Receipt } from 'lucide-react';
import { useEffect } from 'react';

interface PaymentSuccessProps {
  serviceName: string;
  providerName: string;
  amount: number;
  cardLastFour: string;
  onViewBooking: () => void;
  onGoHome: () => void;
}

export default function PaymentSuccess({ serviceName, providerName, amount, cardLastFour, onViewBooking, onGoHome }: PaymentSuccessProps) {
  // Auto-advance after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onViewBooking();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onViewBooking]);

  return (
    <div className='min-h-screen bg-background flex flex-col items-center justify-center p-6'>
      {/* Success Animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className='w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6'>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}>
          <Check className='w-12 h-12 text-green-600' strokeWidth={3} />
        </motion.div>
      </motion.div>

      {/* Success Message */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className='text-2xl font-bold text-foreground mb-2'>
        Payment Confirmed!
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className='text-muted-foreground mb-8'>
        Your booking is complete.
      </motion.p>

      {/* Receipt Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className='w-full max-w-sm'>
        <Card>
          <CardContent className='p-4 space-y-3'>
            <div className='flex justify-between text-sm'>
              <span className='text-muted-foreground'>Service</span>
              <span className='text-foreground font-medium'>{serviceName}</span>
            </div>
            <div className='flex justify-between text-sm'>
              <span className='text-muted-foreground'>Provider</span>
              <span className='text-foreground font-medium'>{providerName}</span>
            </div>
            <div className='flex justify-between text-sm'>
              <span className='text-muted-foreground'>Amount</span>
              <span className='text-foreground font-medium'>${amount.toFixed(2)}</span>
            </div>
            <div className='flex justify-between text-sm'>
              <span className='text-muted-foreground'>Payment method</span>
              <span className='text-foreground font-medium'>···· {cardLastFour}</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className='w-full max-w-sm mt-6 space-y-3'>
        <Button className='w-full h-12' onClick={onViewBooking}>
          <Receipt className='w-5 h-5 mr-2' />
          View Booking Details
        </Button>
        <Button variant='outline' className='w-full h-12' onClick={onGoHome}>
          <Home className='w-5 h-5 mr-2' />
          Back to Home
        </Button>
      </motion.div>
    </div>
  );
}
