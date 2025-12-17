'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, leftElement, rightElement, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-medium text-gray-700 mb-1.5 ml-1">
            {label}
          </label>
        )}
        <div className="relative">
          {leftElement && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              {leftElement}
            </div>
          )}
          <input
            type={type}
            className={cn(
              'w-full rounded-2xl border-none bg-[#F7FAFC] px-4 py-3',
              'text-sm font-medium text-[#0A2540]',
              'outline-none focus:ring-2 focus:ring-[#0A2540]/20',
              'placeholder:text-gray-400',
              'transition-all duration-200',
              leftElement && 'pl-11',
              rightElement && 'pr-11',
              error && 'ring-2 ring-red-500/50',
              className
            )}
            ref={ref}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
              {rightElement}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-red-500 ml-1">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export default Input;
