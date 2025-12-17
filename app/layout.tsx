// file: app/layout.tsx
// description: Root Next.js layout applying global styles and metadata
// reference: app/globals.css, client/src/app_entry.tsx

import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = { title: 'YUBER', description: 'Your AI Agent for local services' };
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang='en' suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <Script src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js" strategy="beforeInteractive" />
      </head>
      <body>{children}</body>
    </html>
  );
}
