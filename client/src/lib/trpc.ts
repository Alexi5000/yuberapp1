// file: client/src/lib/trpc.ts
// description: tRPC React client typed against the shared AppRouter
// reference: server/routers.ts

import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '../../../server/routers';

export const trpc = createTRPCReact<AppRouter>();
