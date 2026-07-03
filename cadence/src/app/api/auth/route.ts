import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { executeQuery, executeStatement, sfText, SF_DB, SF_RAW } from '@/lib/snowflake';
import {
  signSession,
  buildSessionCookieHeader,
  buildClearCookieHeader,
  getSessionFromRequest,
  payloadToUserAccount,
  type SessionPayload,
} from '@/lib/auth';

interface SfUserAccount {
  USERNAME: string;
  LOCATION_ID: string;
  PASSWORD_HASH: string;
  USER_ROLE: string;
  IS_ACTIVE: string;
  LAST_LOGIN_AT: string | null;
  FAILED_LOGIN_COUNT: string;
  CREATED_AT: string;
}

const TABLE = `${SF_RAW}.APP_USER_ACCOUNTS`;
const MAX_ATTEMPTS = 5;

// ─── GET: Return current session ──────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const payload = getSessionFromRequest(request);
  if (!payload) {
    return Response.json({ user: null }, { status: 200 });
  }
  return Response.json({ user: payloadToUserAccount(payload) });
}

// ─── POST: Login / Sign-out / Other actions ───────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      username?: string;
      password?: string;
      locationId?: string;
      action?: string;
    };

    const { username, password, locationId, action } = body;

    // ── Sign out: clear the session cookie ──
    if (action === 'signOut') {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Set-Cookie': buildClearCookieHeader() },
      });
    }

    // ── Get current account from session ──
    if (action === 'getAccount') {
      const payload = getSessionFromRequest(request);
      if (!payload) {
        return Response.json({ error: 'Not authenticated' }, { status: 401 });
      }
      return Response.json(payloadToUserAccount(payload));
    }

    if (!username || !locationId) {
      return Response.json({ error: 'Username and Location ID are required.' }, { status: 400 });
    }

    // ── Fetch the user account from Snowflake ──
    const rows = await executeQuery<SfUserAccount>(
      `SELECT USERNAME, LOCATION_ID, PASSWORD_HASH, USER_ROLE,
              IS_ACTIVE, LAST_LOGIN_AT, FAILED_LOGIN_COUNT, CREATED_AT
       FROM ${TABLE}
       WHERE USERNAME = ? AND LOCATION_ID = ?
       LIMIT 1`,
      { '1': sfText(username), '2': sfText(locationId) }
    );

    const account = rows[0];

    if (!account) {
      return Response.json({ error: 'Invalid username or location.' }, { status: 401 });
    }

    if (account.IS_ACTIVE === 'false' || account.IS_ACTIVE === '0' || account.IS_ACTIVE === 'FALSE') {
      return Response.json({ error: 'Account is disabled. Contact your administrator.' }, { status: 403 });
    }

    const failedCount = parseInt(account.FAILED_LOGIN_COUNT ?? '0', 10);
    if (failedCount >= MAX_ATTEMPTS) {
      return Response.json({
        error: `Account locked after ${MAX_ATTEMPTS} failed attempts. Contact your administrator.`,
      }, { status: 403 });
    }

    // ── Password verification ──
    // Supports both bcrypt hashes ($2a$, $2b$, $2y$ prefix) and plain-text (dev fallback)
    const storedHash = account.PASSWORD_HASH;
    const isBcrypt = storedHash.startsWith('$2');
    const passwordMatch = isBcrypt
      ? await bcrypt.compare(password ?? '', storedHash)
      : password === storedHash;

    if (!passwordMatch) {
      await executeStatement(
        `UPDATE ${TABLE} SET FAILED_LOGIN_COUNT = FAILED_LOGIN_COUNT + 1, UPDATED_AT = CURRENT_TIMESTAMP()
         WHERE USERNAME = ? AND LOCATION_ID = ?`,
        { '1': sfText(username), '2': sfText(locationId) }
      );
      const remaining = MAX_ATTEMPTS - (failedCount + 1);
      return Response.json({
        error: remaining <= 0
          ? 'Incorrect password. Account is now locked. Contact your administrator.'
          : `Incorrect password. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
      }, { status: 401 });
    }

    // ── Success — update last login and reset failed count ──
    await executeStatement(
      `UPDATE ${TABLE}
       SET LAST_LOGIN_AT = CURRENT_TIMESTAMP(), FAILED_LOGIN_COUNT = 0, UPDATED_AT = CURRENT_TIMESTAMP()
       WHERE USERNAME = ? AND LOCATION_ID = ?`,
      { '1': sfText(username), '2': sfText(locationId) }
    );

    // ── Create JWT session and set httpOnly cookie ──
    const sessionPayload: SessionPayload = {
      username: account.USERNAME,
      locationId: account.LOCATION_ID,
      userRole: account.USER_ROLE as 'ADMIN' | 'MANAGER' | 'VIEWER',
    };
    const token = signSession(sessionPayload);
    const cookieHeader = buildSessionCookieHeader(token);

    const user = payloadToUserAccount(sessionPayload);

    return new Response(JSON.stringify(user), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': cookieHeader,
      },
    });
  } catch (err) {
    console.error('[api/auth POST]', err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
