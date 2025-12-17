import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { motion } from 'framer-motion';
import { ArrowLeft, Bell, Gift, Mail, MessageCircle, Smartphone, Star, Zap } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface NotificationSettingsProps {
  onBack: () => void;
}

interface NotificationPreferences {
  pushEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
  bookingUpdates: boolean;
  providerMessages: boolean;
  promotions: boolean;
  reminders: boolean;
  reviews: boolean;
}

export default function NotificationSettings({ onBack }: NotificationSettingsProps) {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    pushEnabled: true,
    emailEnabled: true,
    smsEnabled: false,
    bookingUpdates: true,
    providerMessages: true,
    promotions: false,
    reminders: true,
    reviews: true
  });

  const [saving, setSaving] = useState(false);

  const handleToggle = (key: keyof NotificationPreferences) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    toast.success('Notification preferences saved');
  };

  const notificationChannels = [
    { key: 'pushEnabled' as const, icon: Smartphone, label: 'Push Notifications', description: 'Receive notifications on your device' },
    { key: 'emailEnabled' as const, icon: Mail, label: 'Email Notifications', description: 'Get updates in your inbox' },
    { key: 'smsEnabled' as const, icon: MessageCircle, label: 'SMS Notifications', description: 'Receive text messages' }
  ];

  const notificationTypes = [
    { key: 'bookingUpdates' as const, icon: Zap, label: 'Booking Updates', description: 'Status changes, arrivals, completions' },
    {
      key: 'providerMessages' as const,
      icon: MessageCircle,
      label: 'Provider Messages',
      description: 'Messages from your service providers'
    },
    { key: 'reminders' as const, icon: Bell, label: 'Reminders', description: 'Upcoming appointments and rebooking' },
    { key: 'reviews' as const, icon: Star, label: 'Review Requests', description: 'Prompts to rate your experience' },
    { key: 'promotions' as const, icon: Gift, label: 'Promotions & Offers', description: 'Deals, discounts, and special offers' }
  ];

  return (
    <div className='min-h-screen bg-background pb-24'>
      {/* Header */}
      <div className='sticky top-0 z-10 bg-background border-b border-border'>
        <div className='flex items-center p-4'>
          <Button variant='ghost' size='icon' onClick={onBack} className='mr-3'>
            <ArrowLeft className='w-5 h-5' />
          </Button>
          <h1 className='text-xl font-semibold text-foreground'>Notification Settings</h1>
        </div>
      </div>

      <div className='p-4 space-y-6'>
        {/* Notification Channels */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h3 className='text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3'>Notification Channels</h3>
          <Card>
            <CardContent className='p-0'>
              {notificationChannels.map((channel, index) => {
                const Icon = channel.icon;
                return (
                  <div key={channel.key}>
                    <div className='flex items-center justify-between p-4'>
                      <div className='flex items-center gap-4'>
                        <div className='w-10 h-10 bg-muted rounded-full flex items-center justify-center'>
                          <Icon className='w-5 h-5 text-muted-foreground' />
                        </div>
                        <div>
                          <Label htmlFor={channel.key} className='font-medium text-foreground cursor-pointer'>{channel.label}</Label>
                          <p className='text-sm text-muted-foreground'>{channel.description}</p>
                        </div>
                      </div>
                      <Switch id={channel.key} checked={preferences[channel.key]} onCheckedChange={() => handleToggle(channel.key)} />
                    </div>
                    {index < notificationChannels.length - 1 && <Separator className='ml-18' />}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>

        {/* Notification Types */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h3 className='text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3'>Notification Types</h3>
          <Card>
            <CardContent className='p-0'>
              {notificationTypes.map((type, index) => {
                const Icon = type.icon;
                return (
                  <div key={type.key}>
                    <div className='flex items-center justify-between p-4'>
                      <div className='flex items-center gap-4'>
                        <div className='w-10 h-10 bg-muted rounded-full flex items-center justify-center'>
                          <Icon className='w-5 h-5 text-muted-foreground' />
                        </div>
                        <div>
                          <Label htmlFor={type.key} className='font-medium text-foreground cursor-pointer'>{type.label}</Label>
                          <p className='text-sm text-muted-foreground'>{type.description}</p>
                        </div>
                      </div>
                      <Switch id={type.key} checked={preferences[type.key]} onCheckedChange={() => handleToggle(type.key)} />
                    </div>
                    {index < notificationTypes.length - 1 && <Separator className='ml-18' />}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>

        {/* Info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className='bg-muted/50'>
            <CardContent className='p-4'>
              <p className='text-sm text-muted-foreground'>
                You'll always receive critical notifications about your bookings and account security, regardless of these settings.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Save Button */}
      <div className='fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border'>
        <Button className='w-full h-12' onClick={handleSave} disabled={saving}>
          {saving ?
            (
              <span className='flex items-center gap-2'>
                <span className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                Saving...
              </span>
            ) :
            ('Save Preferences')}
        </Button>
      </div>
    </div>
  );
}
