// file: server/_core/oauth.ts
// description: Auth helpers for demo/email login and OAuth callback redirection
// reference: server/_core/localAuth.ts, server/_core/cookies.ts

import { COOKIE_NAME, ONE_YEAR_MS } from '@shared/const';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import * as db from '../db';
import { getSessionCookieOptions } from './cookies';
import { localAuth } from './localAuth';

export async function handleDemoLogin(req: NextRequest) {
  if (process.env.ENABLE_LOCAL_DEMO_AUTH !== 'true' || !['development', 'test'].includes(process.env.NODE_ENV ?? '') || !['localhost', '127.0.0.1', '[::1]'].includes(req.nextUrl.hostname)) {
    return NextResponse.json({ error: 'Demo authentication is disabled. A verified identity provider is required.' }, { status: 403 });
  }
  try {
    const user = await localAuth.getOrCreateDemoUser();
    const sessionToken = await localAuth.createSessionToken(user.openId, { name: user.name || 'Demo User', expiresInMs: ONE_YEAR_MS });
    const cookieOptions = getSessionCookieOptions(req);
    const res = NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
    res.cookies.set(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS / 1000 });
    return res;
  } catch (error) {
    console.error('[Auth] Demo login failed', error);
    return NextResponse.json({ error: 'Demo login failed' }, { status: 500 });
  }
}

export async function handleEmailLogin(req: NextRequest) {
  if (process.env.ENABLE_LOCAL_DEMO_AUTH !== 'true' || !['development', 'test'].includes(process.env.NODE_ENV ?? '') || !['localhost', '127.0.0.1', '[::1]'].includes(req.nextUrl.hostname)) {
    return NextResponse.json({ error: 'Demo authentication is disabled. A verified identity provider is required.' }, { status: 403 });
  }
  try {
    const { email, name } = await req.json();

    if (typeof email !== 'string' || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || (name !== undefined && (typeof name !== 'string' || name.length > 100))) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const openId = `local-${Buffer.from(email.trim().toLowerCase()).toString('base64url')}`;
    await db.upsertUser({ openId, name: name || email.split('@')[0], email, loginMethod: 'email', lastSignedIn: new Date() });

    const user = await db.getUserByOpenId(openId);
    if (!user) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }

    const sessionToken = await localAuth.createSessionToken(user.openId, { name: user.name || '', expiresInMs: ONE_YEAR_MS });
    const cookieOptions = getSessionCookieOptions(req);
    const res = NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
    res.cookies.set(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS / 1000 });
    return res;
  } catch (error) {
    console.error('[Auth] Login failed', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}

export async function handleOAuthCallback(req: NextRequest) {
  const redirectUrl = new URL('/?auth=use-demo-login', req.url);
  return NextResponse.redirect(redirectUrl, 302);
}
