'use client';

import { useState, useEffect } from 'react';
import { Button, Icon } from '@/components/ui';

interface S03Props {
  onComplete: () => void;
}

const permissions = [
  {
    icon: 'map-pin',
    title: 'Enable Location',
    description: 'To find services near you and show accurate arrival times.',
    buttonText: 'Enable Location',
  },
  {
    icon: 'bell',
    title: 'Enable Notifications',
    description: 'To update you when your provider is on the way or your booking is confirmed.',
    buttonText: 'Enable Notifications',
  },
];

export default function S03Permissions({ onComplete }: S03Props) {
  const [granted, setGranted] = useState<string[]>([]);

  const handleGrant = (permissionTitle: string) => {
    if (!granted.includes(permissionTitle)) {
      const newGranted = [...granted, permissionTitle];
      setGranted(newGranted);
      
      // Auto-advance to next screen after notifications are enabled
      if (permissionTitle === 'Enable Notifications') {
        setTimeout(() => {
          onComplete();
        }, 500);
      }
    }
  };

  return (
    <div className="flex h-full flex-col bg-white px-6 py-8">
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-sm space-y-4">
          {permissions.map((permission, index) => {
            const isGranted = granted.includes(permission.title);
            return (
              <div
                key={permission.title}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
              >
                <div className="mb-4 flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FF4742]/10 flex-shrink-0">
                    <Icon name={permission.icon as any} size="lg" className="text-[#FF4742]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-1 text-lg font-bold text-[#0A2540]">{permission.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{permission.description}</p>
                  </div>
                </div>
                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                  onClick={() => handleGrant(permission.title)}
                  disabled={isGranted}
                  className={isGranted ? 'opacity-60' : ''}
                >
                  {isGranted ? (
                    <span className="flex items-center gap-2">
                      <Icon name="check" size="sm" />
                      Enabled
                    </span>
                  ) : (
                    permission.buttonText
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

