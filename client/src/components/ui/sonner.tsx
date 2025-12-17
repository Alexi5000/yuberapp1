// file: client/src/components/ui/sonner.tsx
// description: Themed toaster wrapper using Sonner configured for next-themes
// reference: client/src/components/ui/tooltip.tsx

import { useTheme } from 'next-themes';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

const Toaster = ({ theme: incomingTheme, ...props }: ToasterProps) => {
  type ThemeOption = 'light' | 'dark' | 'system';
  const themeValue = incomingTheme ?? useTheme().theme ?? 'system';
  const resolvedTheme: ThemeOption = themeValue as ThemeOption;

  return (
    <Sonner
      theme={resolvedTheme}
      className='toaster group'
      style={{
        '--normal-bg': 'var(--popover)',
        '--normal-text': 'var(--popover-foreground)',
        '--normal-border': 'var(--border)'
      } as React.CSSProperties}
      {...props} />
  );
};

export { Toaster };
