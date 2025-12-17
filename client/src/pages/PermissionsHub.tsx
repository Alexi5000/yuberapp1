import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Bell, Check, MapPin } from 'lucide-react';
import { useState } from 'react';

interface PermissionsHubProps {
  onComplete: () => void;
}

export default function PermissionsHub({ onComplete }: PermissionsHubProps) {
  const [locationGranted, setLocationGranted] = useState<boolean | null>(null);
  const [notificationsGranted, setNotificationsGranted] = useState<boolean | null>(null);
  const [currentStep, setCurrentStep] = useState<'location' | 'notifications' | 'done'>('location');

  const handleLocationPermission = async (grant: boolean) => {
    if (grant) {
      // Request actual location permission
      try {
        await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        setLocationGranted(true);
      } catch {
        setLocationGranted(false);
      }
    } else {
      setLocationGranted(false);
    }
    setCurrentStep('notifications');
  };

  const handleNotificationPermission = async (grant: boolean) => {
    if (grant) {
      // Request actual notification permission
      try {
        const permission = await Notification.requestPermission();
        setNotificationsGranted(permission === 'granted');
      } catch {
        setNotificationsGranted(false);
      }
    } else {
      setNotificationsGranted(false);
    }
    setCurrentStep('done');
    // Auto-advance after a short delay
    setTimeout(onComplete, 500);
  };

  return (
    <div className='min-h-screen bg-background flex flex-col p-6'>
      <div className='flex-1 flex flex-col justify-center gap-6'>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className='text-center mb-8'>
          <h1 className='text-2xl font-bold text-foreground mb-2'>Quick Setup</h1>
          <p className='text-muted-foreground'>Enable these features for the best experience</p>
        </motion.div>

        {/* Location Permission Card */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <Card
            className={`transition-all duration-300 ${currentStep !== 'location' ? 'opacity-60' : ''} ${
              locationGranted === true ? 'border-accent' : ''
            }`}>
            <CardContent className='p-6'>
              <div className='flex items-start gap-4'>
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    locationGranted === true ? 'bg-accent' : 'bg-primary/10'
                  }`}>
                  {locationGranted === true ?
                    <Check className='w-6 h-6 text-accent-foreground' /> :
                    <MapPin className='w-6 h-6 text-primary' />}
                </div>
                <div className='flex-1'>
                  <h3 className='font-semibold text-foreground mb-1'>Enable Location</h3>
                  <p className='text-sm text-muted-foreground mb-4'>To find services near you and show accurate arrival times.</p>
                  {currentStep === 'location' && (
                    <div className='flex gap-3'>
                      <Button onClick={() => handleLocationPermission(true)} className='flex-1'>Enable Location</Button>
                      <Button variant='ghost' onClick={() => handleLocationPermission(false)} className='text-muted-foreground'>
                        Not now
                      </Button>
                    </div>
                  )}
                  {locationGranted !== null && currentStep !== 'location' && (
                    <p className={`text-sm ${locationGranted ? 'text-accent-foreground' : 'text-muted-foreground'}`}>
                      {locationGranted ? 'Enabled' : 'Skipped'}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notifications Permission Card */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <Card
            className={`transition-all duration-300 ${currentStep === 'location' ? 'opacity-40' : ''} ${
              notificationsGranted === true ? 'border-accent' : ''
            }`}>
            <CardContent className='p-6'>
              <div className='flex items-start gap-4'>
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    notificationsGranted === true ? 'bg-accent' : 'bg-primary/10'
                  }`}>
                  {notificationsGranted === true ?
                    <Check className='w-6 h-6 text-accent-foreground' /> :
                    <Bell className='w-6 h-6 text-primary' />}
                </div>
                <div className='flex-1'>
                  <h3 className='font-semibold text-foreground mb-1'>Enable Notifications</h3>
                  <p className='text-sm text-muted-foreground mb-4'>
                    To update you when your provider is on the way or your booking is confirmed.
                  </p>
                  {currentStep === 'notifications' && (
                    <div className='flex gap-3'>
                      <Button onClick={() => handleNotificationPermission(true)} className='flex-1'>Enable Notifications</Button>
                      <Button variant='ghost' onClick={() => handleNotificationPermission(false)} className='text-muted-foreground'>
                        Not now
                      </Button>
                    </div>
                  )}
                  {notificationsGranted !== null && currentStep === 'done' && (
                    <p className={`text-sm ${notificationsGranted ? 'text-accent-foreground' : 'text-muted-foreground'}`}>
                      {notificationsGranted ? 'Enabled' : 'Skipped'}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
