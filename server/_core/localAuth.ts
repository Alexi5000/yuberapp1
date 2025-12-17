// file: server/_core/localAuth.ts
// description: Local JWT-based auth helpers for demo login and session validation
// reference: server/_core/cookies.ts, server/db.ts
import { ForbiddenError } from '@shared/_core/errors';
import { COOKIE_NAME, ONE_YEAR_MS } from '@shared/const';
import { parse as parseCookieHeader } from 'cookie';
import { jwtVerify, SignJWT } from 'jose';
import { type NextRequest } from 'next/server';
import { type User } from '../../drizzle/schema';
import * as db from '../db';
import { ENV } from './env';

// Utility function
const isNonEmptyString = (value: unknown): value is string => typeof value === 'string' && value.length > 0;

export type SessionPayload = { openId: string, appId: string, name: string };

/**
 * Standalone authentication service that doesn't require Manus OAuth
 * Uses local JWT-based sessions with email/password or demo login
 */
class LocalAuthService {
  private parseCookies(cookieHeader: string | undefined) {
    if (!cookieHeader) {
      return new Map<string, string>();
    }

    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }

  private getSessionSecret() {
    const secret = ENV.cookieSecret;
    if (!secret || secret === 'change-this-secret-in-production') {
      console.warn('[Auth] WARNING: Using default JWT secret. Set JWT_SECRET in .env for production!');
    }
    return new TextEncoder().encode(secret || 'default-dev-secret-change-me');
  }

  /**
   * Create a session token for a user
   */
  async createSessionToken(openId: string, options: { expiresInMs?: number, name?: string } = {}): Promise<string> {
    return this.signSession({ openId, appId: ENV.appId, name: options.name || '' }, options);
  }

  async signSession(payload: SessionPayload, options: { expiresInMs?: number } = {}): Promise<string> {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1000);
    const secretKey = this.getSessionSecret();

    return new SignJWT({ openId: payload.openId, appId: payload.appId, name: payload.name }).setProtectedHeader({
      alg: 'HS256',
      typ: 'JWT'
    }).setExpirationTime(expirationSeconds).sign(secretKey);
  }

  async verifySession(cookieValue: string | undefined | null): Promise<{ openId: string, appId: string, name: string } | null> {
    if (!cookieValue) {
      return null;
    }

    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, { algorithms: ['HS256'] });
      const { openId, appId, name } = payload as Record<string, unknown>;

      if (!isNonEmptyString(openId)) {
        console.warn('[Auth] Session payload missing openId');
        return null;
      }

      return { openId, appId: isNonEmptyString(appId) ? appId : ENV.appId, name: isNonEmptyString(name) ? name : '' };
    } catch (error) {
      console.warn('[Auth] Session verification failed', String(error));
      return null;
    }
  }

  async authenticateRequest(req: Pick<NextRequest, 'headers'>): Promise<User> {
    const cookies = this.parseCookies(req.headers.get('cookie') || undefined);
    const sessionCookie = cookies.get(COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);

    if (!session) {
      throw ForbiddenError('Invalid session cookie');
    }

    const sessionUserId = session.openId;
    const signedInAt = new Date();
    let user = await db.getUserByOpenId(sessionUserId);

    if (!user) {
      throw ForbiddenError('User not found');
    }

    // Update last signed in
    await db.upsertUser({ openId: user.openId, lastSignedIn: signedInAt });

    return user;
  }

  /**
   * Create or get a demo user for testing
   */
  async getOrCreateDemoUser(): Promise<User> {
    const demoOpenId = 'demo-user-local';
    let user = await db.getUserByOpenId(demoOpenId);

    if (!user) {
      await db.upsertUser({
        openId: demoOpenId,
        name: 'Demo User',
        email: 'demo@yuber.local',
        loginMethod: 'demo',
        lastSignedIn: new Date()
      });
      user = await db.getUserByOpenId(demoOpenId);
    }

    return user!;
  }
}

export const localAuth = new LocalAuthService();
