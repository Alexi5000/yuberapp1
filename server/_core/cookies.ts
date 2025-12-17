// file: server/_core/cookies.ts
// description: Helpers for computing secure cookie options based on incoming requests
// reference: server/_core/localAuth.ts, app/api/auth/*
import { type NextRequest } from 'next/server';

function isSecureRequest(req: NextRequest) {
  if (req.nextUrl.protocol === 'https:') return true;

  const forwardedProto = req.headers.get('x-forwarded-proto');
  if (!forwardedProto) return false;

  return forwardedProto.split(',').some(proto => proto.trim().toLowerCase() === 'https');
}

type SessionCookieOptions = { httpOnly: boolean, path: string, sameSite: 'none' | 'lax' | 'strict', secure: boolean };

export function getSessionCookieOptions(req: NextRequest): SessionCookieOptions {
  return { httpOnly: true, path: '/', sameSite: 'none', secure: isSecureRequest(req) };
}
