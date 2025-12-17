// file: app/api/oauth/callback/route.ts
// description: Next.js route handler redirecting OAuth callback to demo login flow
// reference: server/_core/oauth.ts
import type { NextRequest } from 'next/server';
import { handleOAuthCallback } from '../../../../server/_core/oauth';

export async function GET(req: NextRequest) {
  return handleOAuthCallback(req);
}
