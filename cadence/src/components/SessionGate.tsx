'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { getSession } from '@/services/auth.service';

/**
 * Bootstraps the auth session on app mount.
 * Fetches the current user from the httpOnly cookie via the API,
 * and populates the auth store so all components can access it.
 */
export function SessionGate({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((s) => s.setUser);
  const setLoading = useAuthStore((s) => s.setLoading);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const user = await getSession();
        if (!cancelled) {
          setUser(user);
        }
      } catch {
        if (!cancelled) {
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [setUser, setLoading]);

  return <>{children}</>;
}
