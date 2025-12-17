'use client';

import { useState } from 'react';
import { SCREENS, type ScreenId } from '@shared/lib/brand';
import { Icon, Avatar } from '@/components/ui';

interface User {
  name: string;
  email: string;
  avatar?: string;
  location?: string;
}

interface S26Props {
  user: User;
  onNavigate: (screen: ScreenId) => void;
  onLogout: () => void;
}

const menuItems = [
  { icon: 'clock', label: 'Booking History', screen: SCREENS.S27_BOOKING_HISTORY },
  { icon: 'credit-card', label: 'Payment Methods', screen: SCREENS.S28_MANAGE_PAYMENTS },
  { icon: 'bell', label: 'Notification Settings', screen: SCREENS.S29_NOTIFICATION_SETTINGS },
  { icon: 'heart', label: 'Favorites', screen: SCREENS.S24_FAVORITE_PROVIDERS },
  { icon: 'gift', label: 'Referrals & Rewards', screen: SCREENS.S23_REFERRAL_REWARDS },
  { icon: 'info', label: 'Help & Support', screen: SCREENS.S30_HELP_SUPPORT },
];

export default function S26ProfileSettings({ user, onNavigate, onLogout }: S26Props) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    if (showLogoutConfirm) {
      onLogout();
    } else {
      setShowLogoutConfirm(true);
    }
  };

  return (
    <div className="flex h-full flex-col bg-[#F7FAFC]">
      <div className="bg-white px-6 pt-14 pb-6">
        <div className="flex items-center gap-4 mb-6">
          <Avatar src={user.avatar} name={user.name} size="lg" />
          <div className="flex-1">
            <h1 className="text-xl font-bold text-[#0A2540]">{user.name}</h1>
            {user.email && <p className="text-sm text-gray-500">{user.email}</p>}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => onNavigate(item.screen)}
              className="w-full flex items-center gap-4 p-4 bg-white rounded-xl hover:bg-gray-50 transition-colors"
            >
              <Icon name={item.icon as any} size="md" className="text-gray-400" />
              <span className="flex-1 text-left font-medium text-[#0A2540]">{item.label}</span>
              <Icon name="chevron-right" size="sm" className="text-gray-400" />
            </button>
          ))}
        </div>

        <button
          onClick={handleLogout}
          className={`w-full mt-6 p-4 text-center rounded-xl transition-colors ${
            showLogoutConfirm ? 'bg-red-500 text-white' : 'text-red-500 hover:bg-red-50'
          }`}
        >
          {showLogoutConfirm ? 'Confirm Log Out' : 'Log Out'}
        </button>
        {showLogoutConfirm && (
          <button
            onClick={() => setShowLogoutConfirm(false)}
            className="w-full mt-2 p-2 text-center text-gray-500 hover:text-[#0A2540]"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

