// file: client/src/components/shared/ScreenNavigator.tsx
// description: Debug-only bottom navigator for jumping between app screens during development
// reference: shared/lib/brand.ts, client/src/hooks/useScreenNavigation.ts

'use client';

import { SCREENS, type ScreenId } from '@shared/lib/brand';
import { cn } from '@/lib/utils';

interface ScreenNavigatorProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
}

const SCREEN_LIST = [
  { id: SCREENS.S01_SPLASH, label: '01', name: 'Splash' },
  { id: SCREENS.S02_VALUE_CAROUSEL, label: '02', name: 'Value' },
  { id: SCREENS.S03_PERMISSIONS, label: '03', name: 'Perms' },
  { id: SCREENS.S04_SIGNUP, label: '04', name: 'Signup' },
  { id: SCREENS.S05_CONVERSATION_HUB, label: '05', name: 'Hub' },
  { id: SCREENS.S06_CONVERSATION_PROGRESS, label: '06', name: 'Progress' },
  { id: SCREENS.S07_AI_SEARCH_RADAR, label: '07', name: 'Search' },
  { id: SCREENS.S08_AI_CLARIFICATION, label: '08', name: 'Clarify' },
  { id: SCREENS.S09_AI_RECOMMENDATION, label: '09', name: 'Rec' },
  { id: SCREENS.S10_MULTIPLE_OPTIONS, label: '10', name: 'Options' },
  { id: SCREENS.S11_PROVIDER_DETAILS, label: '11', name: 'Details' },
  { id: SCREENS.S12_CONVERSATION_HISTORY, label: '12', name: 'History' },
  { id: SCREENS.S13_BOOKING_CONFIRM, label: '13', name: 'Confirm' },
  { id: SCREENS.S14_ADD_PAYMENT, label: '14', name: 'Payment' },
  { id: SCREENS.S15_PAYMENT_SUCCESS, label: '15', name: 'Success' },
  { id: SCREENS.S16_DISPATCH_PROGRESS, label: '16', name: 'Dispatch' },
  { id: SCREENS.S17_LIVE_TRACKING, label: '17', name: 'Track' },
  { id: SCREENS.S18_JOB_IN_PROGRESS, label: '18', name: 'InProgress' },
  { id: SCREENS.S19_JOB_COMPLETE, label: '19', name: 'Complete' },
  { id: SCREENS.S20_PROBLEM_RESOLUTION, label: '20', name: 'Problem' },
  { id: SCREENS.S21_RATE_REVIEW, label: '21', name: 'Rate' },
  { id: SCREENS.S22_SHARE_EXPERIENCE, label: '22', name: 'Share' },
  { id: SCREENS.S23_REFERRAL_REWARDS, label: '23', name: 'Refer' },
];

export function ScreenNavigator({ currentScreen, onNavigate }: ScreenNavigatorProps) {
  const currentIndex = SCREEN_LIST.findIndex(s => s.id === currentScreen);
  const safeCurrentIndex = currentIndex >= 0 ? currentIndex : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg">
      <div className="px-2 py-2">
        {/* Current Screen Indicator */}
        <div className="text-center mb-1">
          <span className="text-xs font-semibold text-[#0A2540]">
            Screen {safeCurrentIndex + 1}/{SCREEN_LIST.length}: {SCREEN_LIST[safeCurrentIndex]?.name ?? ''}
          </span>
        </div>
        
        {/* Scrollable Screen Buttons */}
        <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-1">
          {SCREEN_LIST.map((screen, index) => {
            const isActive = screen.id === currentScreen;
            const isNearActive = Math.abs(index - currentIndex) <= 2;
            
            return (
              <button
                key={screen.id}
                onClick={() => onNavigate(screen.id)}
                className={cn(
                  'flex-shrink-0 px-2 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap',
                  isActive
                    ? 'bg-[#FF4742] text-white shadow-md scale-105'
                    : isNearActive
                    ? 'bg-[#0A2540]/10 text-[#0A2540] hover:bg-[#0A2540]/20'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
                title={`${screen.label}: ${screen.name}`}
              >
                {screen.label}
              </button>
            );
          })}
        </div>
        
        {/* Quick Jump Buttons */}
        <div className="flex gap-1 mt-1 justify-center">
          <button
            onClick={() => {
              const prevIndex = Math.max(0, safeCurrentIndex - 1);
              const prev = SCREEN_LIST[prevIndex];
              if (prev) onNavigate(prev.id);
            }}
            className="px-2 py-1 text-xs text-gray-600 hover:text-[#0A2540]"
            disabled={safeCurrentIndex === 0}
          >
            ← Prev
          </button>
          <button
            onClick={() => {
              const nextIndex = Math.min(SCREEN_LIST.length - 1, safeCurrentIndex + 1);
              const next = SCREEN_LIST[nextIndex];
              if (next) onNavigate(next.id);
            }}
            className="px-2 py-1 text-xs text-gray-600 hover:text-[#0A2540]"
            disabled={safeCurrentIndex === SCREEN_LIST.length - 1}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}

export default ScreenNavigator;

