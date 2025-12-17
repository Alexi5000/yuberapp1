import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { AlertCircle, Clock, MessageCircle, Phone, Wrench } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Provider {
  id: number;
  name: string;
  imageUrl?: string | null;
}

interface JobInProgressProps {
  provider: Provider;
  serviceName: string;
  startTime: Date;
  estimatedDuration: number; // minutes
  onComplete: () => void;
  onReportProblem: () => void;
  onCall: () => void;
  onMessage: () => void;
}

export default function JobInProgress(
  { provider, serviceName, startTime, estimatedDuration, onComplete, onReportProblem, onCall, onMessage }: JobInProgressProps
) {
  const [elapsedMinutes, setElapsedMinutes] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime.getTime()) / 60000);
      setElapsedMinutes(elapsed);
      setProgress(Math.min(100, (elapsed / estimatedDuration) * 100));
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime, estimatedDuration]);

  // Auto-complete after estimated duration (for demo)
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 5000); // 5 seconds for demo
    return () => clearTimeout(timer);
  }, [onComplete]);

  const formatDuration = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className='min-h-screen bg-background'>
      {/* Header */}
      <div className='bg-primary p-6 pb-16'>
        <div className='flex items-center justify-between mb-4'>
          <h1 className='text-xl font-semibold text-primary-foreground'>Service in Progress</h1>
          <Button
            variant='ghost'
            size='sm'
            className='text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10'
            onClick={onReportProblem}>
            <AlertCircle className='w-4 h-4 mr-1' />
            Report Issue
          </Button>
        </div>

        {/* Timer */}
        <div className='text-center'>
          <p className='text-primary-foreground/80 text-sm mb-1'>Time elapsed</p>
          <p className='text-4xl font-bold text-primary-foreground'>{formatDuration(elapsedMinutes)}</p>
        </div>
      </div>

      {/* Provider Card - Overlapping */}
      <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className='mx-4 -mt-10'>
        <Card className='shadow-lg'>
          <CardContent className='p-4'>
            <div className='flex items-center gap-4 mb-4'>
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
              <div className='flex gap-2'>
                <Button variant='outline' size='icon' onClick={onCall}>
                  <Phone className='w-4 h-4' />
                </Button>
                <Button variant='outline' size='icon' onClick={onMessage}>
                  <MessageCircle className='w-4 h-4' />
                </Button>
              </div>
            </div>

            {/* Progress */}
            <div className='space-y-2'>
              <div className='flex justify-between text-sm'>
                <span className='text-muted-foreground'>Progress</span>
                <span className='text-foreground font-medium'>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className='h-2' />
              <div className='flex justify-between text-xs text-muted-foreground'>
                <span>Started</span>
                <span>Est. {formatDuration(estimatedDuration)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Status Updates */}
      <div className='p-4 mt-4'>
        <h3 className='font-semibold text-foreground mb-4'>Status Updates</h3>
        <div className='space-y-4'>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className='flex gap-3'>
            <div className='w-8 h-8 bg-accent rounded-full flex items-center justify-center shrink-0'>
              <Clock className='w-4 h-4 text-accent-foreground' />
            </div>
            <div>
              <p className='font-medium text-foreground'>Service started</p>
              <p className='text-sm text-muted-foreground'>{startTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className='flex gap-3'>
            <div className='w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0'>
              <Wrench className='w-4 h-4 text-primary' />
            </div>
            <div>
              <p className='font-medium text-foreground'>Work in progress</p>
              <p className='text-sm text-muted-foreground'>{provider.name.split(' ')[0]} is working on your request</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Tip: You can leave */}
      <div className='p-4'>
        <Card className='bg-muted/50 border-dashed'>
          <CardContent className='p-4 text-center'>
            <p className='text-sm text-muted-foreground'>Feel free to step away. We'll notify you when the job is complete.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
