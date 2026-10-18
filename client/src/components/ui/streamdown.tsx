'use client';

import type { ComponentProps } from 'react';
import { Streamdown as StreamdownPrimitive } from 'streamdown';
import { code } from '@streamdown/code';
import { math } from '@streamdown/math';
import { mermaid } from '@streamdown/mermaid';

export function Streamdown({ plugins, ...props }: ComponentProps<typeof StreamdownPrimitive>) {
  return <StreamdownPrimitive plugins={{ code, math, mermaid, ...plugins }} {...props} />;
}
