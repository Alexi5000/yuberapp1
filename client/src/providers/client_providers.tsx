// file: client/src/providers/client_providers.tsx
// description: Client-side providers wiring tRPC and React Query for Next.js
// reference: client/src/lib/trpc.ts, client/src/const.ts

'use client';
import { trpc } from '@/lib/trpc';
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink, TRPCClientError } from '@trpc/client';
import { type ReactNode, useEffect, useState } from 'react';
import { getLoginUrl } from '../const';

type ClientProvidersProps = { children: ReactNode };

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === 'undefined') return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;
  if (!isUnauthorized) return;

  window.location.href = getLoginUrl();
};

export function ClientProviders({ children }: ClientProvidersProps) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [httpBatchLink({
        url: '/api/trpc',
        fetch(input, init) {
          const normalizedInit: RequestInit = { ...(init ?? {}), credentials: 'include', signal: init?.signal ?? null };

          return fetch(input, normalizedInit);
        }
      })]
    })
  );

  useEffect(() => {
    const unsubscribeQueryCache = queryClient.getQueryCache().subscribe(event => {
      if (event.type === 'updated' && event.action.type === 'error') {
        const error = event.query.state.error;
        redirectToLoginIfUnauthorized(error);
        console.error('[API Query Error]', error);
      }
    });

    const unsubscribeMutationCache = queryClient.getMutationCache().subscribe(event => {
      if (event.type === 'updated' && event.action.type === 'error') {
        const error = event.mutation.state.error;
        redirectToLoginIfUnauthorized(error);
        console.error('[API Mutation Error]', error);
      }
    });

    return () => {
      unsubscribeQueryCache();
      unsubscribeMutationCache();
    };
  }, [queryClient]);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
