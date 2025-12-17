// file: client/src/types/iconify.d.ts
// description: TypeScript JSX intrinsic element typing for Iconify web component usage
// reference: app/layout.tsx (loads Iconify script), client/src/components/screens/onboarding/S02ValueCarousel.tsx

import type React from 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'iconify-icon': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        icon?: string;
        width?: string | number;
        height?: string | number;
        'stroke-width'?: string | number;
        fill?: string;
      }, HTMLElement>;
    }
  }
}

export {};

