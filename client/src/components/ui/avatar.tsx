// file: client/src/components/ui/avatar.tsx
// description: Avatar primitives supporting both simple src/name usage and composed children (AvatarImage/AvatarFallback)
// reference: client/src/components/DashboardLayout.tsx, client/src/lib/utils.ts

'use client';

import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type AvatarBaseProps = {
  className?: string;
};

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  // With `exactOptionalPropertyTypes: true`, optional props do not accept `undefined` when explicitly passed.
  // Many call sites pass `string | undefined`, so we accept `undefined` explicitly.
  src?: string | undefined;
  name?: string | undefined;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  children?: ReactNode;
}

const sizeMap = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
};

export function Avatar({ src, name, size = 'md', className, children, ...props }: AvatarProps) {
  const initials = name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

  return (
    <div
      className={cn(
        'rounded-full overflow-hidden flex items-center justify-center',
        'bg-[#0A2540] text-white font-semibold',
        sizeMap[size],
        className
      )}
      {...props}
    >
      {children ?? (src ? <img src={src} alt={name} className="w-full h-full object-cover" /> : <span>{initials}</span>)}
    </div>
  );
}

export function AvatarImage({ src, alt, className }: { src?: string | undefined; alt?: string | undefined } & AvatarBaseProps) {
  if (!src) return null;
  return <img src={src} alt={alt ?? ''} className={cn('w-full h-full object-cover', className)} />;
}

export function AvatarFallback({ children, className }: { children?: React.ReactNode } & AvatarBaseProps) {
  return <span className={cn('inline-flex items-center justify-center w-full h-full', className)}>{children}</span>;
}

export default Avatar;
