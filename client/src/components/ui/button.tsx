// file: client/src/components/ui/button.tsx
// description: Shared button component with variants and sizes used across the client UI
// reference: client/src/components/ui/Icon.tsx, client/src/lib/utils.ts

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Icon, type IconName } from './Icon';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Supports both the app's custom variants and common shadcn-style variants
   * used by some Radix-based UI primitives in this repo.
   */
  variant?: 'default' | 'primary' | 'secondary' | 'destructive' | 'danger' | 'success' | 'outline' | 'ghost' | 'link';
  /**
   * Supports both the app's custom sizes and shadcn-style `default`.
   */
  size?: 'default' | 'sm' | 'md' | 'lg' | 'icon';
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: IconName | React.ReactNode;
  rightIcon?: IconName | React.ReactNode;
}

const variantStyles = {
  default: 'bg-[#FF4742] text-white hover:bg-opacity-90 shadow-lg shadow-[#FF4742]/20',
  primary: 'bg-[#FF4742] text-white hover:bg-opacity-90 shadow-lg shadow-[#FF4742]/20',
  secondary: 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50',
  destructive: 'bg-[#FF4742] text-white hover:bg-red-500 shadow-lg shadow-red-500/20',
  danger: 'bg-[#FF4742] text-white hover:bg-red-500 shadow-lg shadow-red-500/20',
  success: 'bg-[#2ECC71] text-white hover:bg-green-500 shadow-lg shadow-green-500/20',
  outline: 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50',
  ghost: 'bg-transparent text-gray-500 hover:bg-gray-100',
  link: 'bg-transparent text-[#0A2540] underline-offset-4 hover:underline',
};

const sizeStyles = {
  default: 'h-12 px-6 text-sm rounded-2xl',
  sm: 'h-9 px-4 text-xs rounded-xl',
  md: 'h-12 px-6 text-sm rounded-2xl',
  lg: 'h-14 px-8 text-base rounded-2xl',
  icon: 'h-9 w-9 p-0 rounded-xl',
};

export function buttonVariants(
  options: Pick<ButtonProps, 'variant' | 'size' | 'fullWidth'> & { className?: string | undefined } = {}
) {
  const variant = options.variant ?? 'default';
  const size = options.size ?? 'default';

  return cn(
    'inline-flex items-center justify-center font-medium transition-all',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'active:scale-[0.97]',
    variantStyles[variant],
    sizeStyles[size],
    options.fullWidth && 'w-full',
    options.className
  );
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant = 'default',
    size = 'default',
    fullWidth = false,
    loading = false,
    disabled,
    leftIcon,
    rightIcon,
    children,
    ...props
  }: ButtonProps,
  ref
) {
  const renderIcon = (icon: IconName | React.ReactNode, position: 'left' | 'right') => {
    if (!icon) return null;
    
    if (typeof icon === 'string') {
      return (
        <Icon 
          name={icon as IconName} 
          size="sm" 
          className={position === 'left' ? 'mr-2' : 'ml-2'} 
        />
      );
    }
    
    return <span className={position === 'left' ? 'mr-2' : 'ml-2'}>{icon}</span>;
  };

  return (
    <button
      className={buttonVariants({ variant, size, fullWidth, className })}
      disabled={disabled || loading}
      ref={ref}
      {...props}
    >
      {loading ? (
        <>
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
          Loading...
        </>
      ) : (
        <>
          {renderIcon(leftIcon, 'left')}
          {children}
          {renderIcon(rightIcon, 'right')}
        </>
      )}
    </button>
  );
});

export default Button;
