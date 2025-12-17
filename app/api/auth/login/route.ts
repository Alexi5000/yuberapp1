// file: app/api/auth/login/route.ts
// description: Next.js route handler for email-based demo login issuing session cookies
// reference: server/_core/oauth.ts, server/_core/localAuth.ts
import type { NextRequest } from 'next/server';
import { handleEmailLogin } from '../../../../server/_core/oauth';

export async function POST(req: NextRequest) {
  return handleEmailLogin(req);
}
