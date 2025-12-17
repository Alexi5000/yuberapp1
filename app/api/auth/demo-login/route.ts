// file: app/api/auth/demo-login/route.ts
// description: Next.js route handler for demo login issuing session cookies
// reference: server/_core/oauth.ts, server/_core/localAuth.ts
import type { NextRequest } from 'next/server';
import { handleDemoLogin } from '../../../../server/_core/oauth';

export async function POST(req: NextRequest) {
  return handleDemoLogin(req);
}
