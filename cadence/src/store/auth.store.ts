/**
 * Auth store — holds the currently logged-in user, populated by SessionGate on mount.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { UserAccount } from '@/types';

interface AuthState {
  user: UserAccount | null;
  isLoading: boolean;
  setUser: (user: UserAccount | null) => void;
  setLoading: (loading: boolean) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,
      setUser: (user) => set({ user }),
      setLoading: (isLoading) => set({ isLoading }),
      clear: () => set({ user: null, isLoading: false }),
    }),
    {
      name: 'nexora-auth',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : createNoopStorage())),
      partialize: (state) => ({ user: state.user }),
    }
  )
);

/** Noop storage for SSR — prevents hydration mismatches. */
function createNoopStorage() {
  return {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  };
}
