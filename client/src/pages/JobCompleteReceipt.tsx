import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import { AlertCircle, Check, Clock, CreditCard, Download, Share2, Star, Wrench } from 'lucide-react';

interface Provider {
  id: number;
  name: string;
  imageUrl?: string | null;
}

interface JobCompleteReceiptProps {
  provider: Provider;
  serviceName: string;
  bookingId: string;
  startTime: Date;
  endTime: Date;
  laborCost: number;
  materialsCost: number;
  tipAmount: number;
  totalAmount: number;
  paymentMethod: string;
  onRateReview: () => void;
  onReportProblem: () => void;
  onGoHome: () => void;
}

export default function JobCompleteReceipt(
  {
    provider,
    serviceName,
    bookingId,
    startTime,
    endTime,
    laborCost,
    materialsCost,
    tipAmount,
    totalAmount,
    paymentMethod,
    onRateReview,
    onReportProblem,
    onGoHome
  }: JobCompleteReceiptProps
) {
  const duration = Math.round((endTime.getTime() - startTime.getTime()) / 60000);
  const formatDuration = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    return `${mins} minutes`;
  };

  return (
    <div className='min-h-screen bg-background pb-8'>
      {/* Success Header */}
      <div className='bg-accent p-6 text-center'>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className='w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg'>
          <Check className='w-8 h-8 text-green-600' strokeWidth={3} />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className='text-2xl font-bold text-accent-foreground'>
          Job Complete!
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className='text-accent-foreground/80'>
          Thanks for using YUBER
        </motion.p>
      </div>

      <div className='p-4 space-y-4'>
        {/* Provider Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
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
                  <h3 className='font-semibold text-foreground'>{provider.name}</h3>
                  <div className='flex items-center gap-1 text-sm text-muted-foreground'>
                    <Wrench className='w-3.5 h-3.5' />
                    <span>{serviceName}</span>
                  </div>
                </div>
                <Button onClick={onRateReview} className='gap-2'>
                  <Star className='w-4 h-4' />
                  Rate
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Receipt */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between mb-4'>
                <h3 className='font-semibold text-foreground'>Receipt</h3>
                <div className='flex gap-2'>
                  <Button variant='ghost' size='icon'>
                    <Download className='w-4 h-4' />
                  </Button>
                  <Button variant='ghost' size='icon'>
                    <Share2 className='w-4 h-4' />
                  </Button>
                </div>
              </div>

              <div className='space-y-3 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Booking ID</span>
                  <span className='text-foreground font-mono'>{bookingId}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground flex items-center gap-1'>
                    <Clock className='w-3.5 h-3.5' />
                    Duration
                  </span>
                  <span className='text-foreground'>{formatDuration(duration)}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Start time</span>
                  <span className='text-foreground'>{startTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>End time</span>
                  <span className='text-foreground'>{endTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
                </div>

                <Separator className='my-3' />

                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Labor</span>
                  <span className='text-foreground'>${laborCost.toFixed(2)}</span>
                </div>
                {materialsCost > 0 && (
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Materials</span>
                    <span className='text-foreground'>${materialsCost.toFixed(2)}</span>
                  </div>
                )}
                {tipAmount > 0 && (
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Tip</span>
                    <span className='text-foreground'>${tipAmount.toFixed(2)}</span>
                  </div>
                )}

                <Separator className='my-3' />

                <div className='flex justify-between text-base'>
                  <span className='font-semibold text-foreground'>Total</span>
                  <span className='font-bold text-foreground'>${totalAmount.toFixed(2)}</span>
                </div>

                <div className='flex justify-between text-sm pt-2'>
                  <span className='text-muted-foreground flex items-center gap-1'>
                    <CreditCard className='w-3.5 h-3.5' />
                    Payment
                  </span>
                  <span className='text-foreground'>{paymentMethod}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className='space-y-3'>
          <Button className='w-full h-12' onClick={onRateReview}>
            <Star className='w-5 h-5 mr-2' />
            Rate & Review {provider.name.split(' ')[0]}
          </Button>

          <Button variant='outline' className='w-full' onClick={onReportProblem}>
            <AlertCircle className='w-4 h-4 mr-2' />
            Report a Problem
          </Button>

          <Button variant='ghost' className='w-full' onClick={onGoHome}>Back to Home</Button>
        </motion.div>
      </div>
    </div>
  );
}
