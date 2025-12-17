// file: app/page.tsx
// description: Next.js home page rendering the client application shell
// reference: client/src/app_entry.tsx, app/layout.tsx

'use client';

import dynamic from 'next/dynamic';

const AppEntry = dynamic(() => import('@/app_entry'), { ssr: false });

export default function HomePage() {
  return <AppEntry />;
}
