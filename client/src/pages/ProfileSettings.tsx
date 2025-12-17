// file: client/src/pages/ProfileSettings.tsx
// description: Profile and settings screen with navigation shortcuts and logout
// reference: client/src/App.tsx

import { useAuth } from '@/_core/hooks/useAuth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import { ArrowLeft, Bell, ChevronRight, Clock, CreditCard, Gift, Heart, HelpCircle, LogOut, Settings, Shield, User } from 'lucide-react';
import { SCREENS, type ScreenId } from '@shared/lib/brand';

interface ProfileSettingsProps {
  onNavigate: (screen: ScreenId) => void;
  onBack: () => void;
}

export default function ProfileSettings({ onNavigate, onBack }: ProfileSettingsProps) {
  const { user, logout, isAuthenticated } = useAuth();

  const menuItems = [
    {
      section: 'Account',
      items: [
        { icon: User, label: 'Edit Profile', screen: SCREENS.S26_PROFILE_SETTINGS }, // Placeholder
        { icon: CreditCard, label: 'Payment Methods', screen: SCREENS.S28_MANAGE_PAYMENTS },
        { icon: Heart, label: 'Favorite Providers', screen: SCREENS.S24_FAVORITE_PROVIDERS },
        { icon: Clock, label: 'Booking History', screen: SCREENS.S27_BOOKING_HISTORY }
      ]
    },
    {
      section: 'Preferences',
      items: [{ icon: Bell, label: 'Notification Settings', screen: SCREENS.S29_NOTIFICATION_SETTINGS }, {
        icon: Settings,
        label: 'App Settings',
        screen: SCREENS.S26_PROFILE_SETTINGS // Placeholder
      }]
    },
    { section: 'Rewards', items: [{ icon: Gift, label: 'Referral & Rewards', screen: SCREENS.S23_REFERRAL_REWARDS }] },
    {
      section: 'Support',
      items: [{ icon: HelpCircle, label: 'Help & Support', screen: SCREENS.S30_HELP_SUPPORT }, {
        icon: Shield,
        label: 'Privacy & Security',
        screen: SCREENS.S26_PROFILE_SETTINGS // Placeholder
      }]
    }
  ];

  const handleLogout = async () => {
    await logout();
    onBack();
  };

  return (
    <div className='min-h-screen bg-background pb-8'>
      {/* Header */}
      <div className='sticky top-0 z-10 bg-background border-b border-border'>
        <div className='flex items-center p-4'>
          <Button variant='ghost' size='icon' onClick={onBack} className='mr-3'>
            <ArrowLeft className='w-5 h-5' />
          </Button>
          <h1 className='text-xl font-semibold text-foreground'>Profile & Settings</h1>
        </div>
      </div>

      <div className='p-4 space-y-6'>
        {/* User Profile Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardContent className='p-4'>
              <div className='flex items-center gap-4'>
                <Avatar className='w-16 h-16'>
                  <AvatarFallback className='bg-primary text-primary-foreground text-xl'>
                    {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className='flex-1'>
                  <h2 className='text-lg font-semibold text-foreground'>{user?.name || 'Guest User'}</h2>
                  <p className='text-sm text-muted-foreground'>{user?.email || 'Not signed in'}</p>
                </div>
                <Button variant='outline' size='sm' onClick={() => onNavigate(SCREENS.S26_PROFILE_SETTINGS as ScreenId)}>Edit</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Menu Sections */}
        {menuItems.map((section, sectionIndex) => (
          <motion.div
            key={section.section}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (sectionIndex + 1) * 0.1 }}>
            <h3 className='text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2 px-1'>{section.section}</h3>
            <Card>
              <CardContent className='p-0'>
                {section.items.map((item, itemIndex) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label}>
                      <button
                        className='w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors text-left'
                        onClick={() => onNavigate(item.screen as ScreenId)}>
                        <div className='w-10 h-10 bg-muted rounded-full flex items-center justify-center'>
                          <Icon className='w-5 h-5 text-muted-foreground' />
                        </div>
                        <span className='flex-1 font-medium text-foreground'>{item.label}</span>
                        <ChevronRight className='w-5 h-5 text-muted-foreground' />
                      </button>
                      {itemIndex < section.items.length - 1 && <Separator className='ml-18 mr-4' />}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {/* Logout Button */}
        {isAuthenticated && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Button
              variant='outline'
              className='w-full h-12 text-destructive hover:text-destructive hover:bg-destructive/10'
              onClick={handleLogout}>
              <LogOut className='w-5 h-5 mr-2' />
              Sign Out
            </Button>
          </motion.div>
        )}

        {/* App Version */}
        <p className='text-center text-xs text-muted-foreground'>YUBER v1.0.0</p>
      </div>
    </div>
  );
}
