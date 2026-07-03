/**
 * Server-only auth utilities — JWT session signing/verification + cookie helpers.
 * Never import this in client components.
 */

import jwt from 'jsonwebtoken';
import type { NextRequest } from 'next/server';
import type { UserAccount } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-only-secret-change-in-production';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

export const SESSION_COOKIE = 'nexora-session';

export interface SessionPayload {
  username: string;
  locationId: string;
  userRole: 'ADMIN' | 'MANAGER' | 'VIEWER';
}

/** Sign a JWT containing the user's session payload. */
export function signSession(payload: SessionPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: SESSION_MAX_AGE });
}

/** Verify a JWT and return the decoded payload, or null if invalid. */
export function verifySession(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionPayload;
  } catch {
    return null;
  }
}

/** Build the Set-Cookie header value for the session token. */
export function buildSessionCookieHeader(token: string): string {
  const maxAge = SESSION_MAX_AGE;
  return `${SESSION_COOKIE}=${token}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;
}

/** Build the Set-Cookie header value to clear the session. */
export function buildClearCookieHeader(): string {
  return `${SESSION_COOKIE}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`;
}

/** Extract and verify the session from a NextRequest's cookies. */
export function getSessionFromRequest(request: NextRequest): SessionPayload | null {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}

/** Convert a SessionPayload into a UserAccount object for the client. */
export function payloadToUserAccount(payload: SessionPayload): UserAccount {
  return {
    username: payload.username,
    locationId: payload.locationId,
    userRole: payload.userRole,
    isActive: true,
    lastLoginAt: new Date().toISOString(),
    failedLoginCount: 0,
    createdAt: new Date().toISOString(),
  };
}
