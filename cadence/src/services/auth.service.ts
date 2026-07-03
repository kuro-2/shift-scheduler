import type { UserAccount } from '@/types';
import { apiFetch } from '@/lib/api-url';

/** Sign in with username + password + locationId. Sets an httpOnly session cookie. */
export async function signIn(
  username: string,
  password: string,
  locationId: string
): Promise<UserAccount> {
  return apiFetch<UserAccount>('/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, locationId }),
  });
}

/** Sign out — clears the session cookie. */
export async function signOut(): Promise<void> {
  await apiFetch('/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'signOut' }),
  });
}

/** Get the current session (reads the httpOnly cookie server-side). */
export async function getSession(): Promise<UserAccount | null> {
  try {
    const res = await apiFetch<{ user: UserAccount | null }>('/api/auth');
    return res.user;
  } catch {
    return null;
  }
}

export async function getUserAccount(
  username: string,
  locationId: string
): Promise<UserAccount | null> {
  try {
    return await apiFetch<UserAccount>('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'getAccount', username, locationId }),
    });
  } catch {
    return null;
  }
}

export async function createUserAccount(input: {
  username: string;
  password: string;
  locationId: string;
  userRole: string;
}): Promise<UserAccount> {
  return apiFetch<UserAccount>('/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'create', ...input }),
  });
}

export async function updateUserAccount(
  username: string,
  locationId: string,
  patch: { userRole?: string; isActive?: boolean }
): Promise<UserAccount> {
  return apiFetch<UserAccount>('/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'update', username, locationId, ...patch }),
  });
}

export async function recordFailedLogin(
  username: string,
  locationId: string
): Promise<{ locked: boolean; failedCount: number }> {
  try {
    return await apiFetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'recordFailed', username, locationId }),
    });
  } catch {
    return { locked: false, failedCount: 1 };
  }
}
