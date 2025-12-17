'use client';

import { useCallback, useState } from 'react';
import { SCREENS, type ScreenId } from '@shared/lib/brand';

export function useScreenNavigation(initialScreen: ScreenId = SCREENS.S01_SPLASH) {
  const [screen, setScreen] = useState<ScreenId>(initialScreen);

  const navigate = useCallback((next: ScreenId) => {
    setScreen(next);
  }, []);

  return { screen, navigate, setScreen };
}

export default useScreenNavigation;

