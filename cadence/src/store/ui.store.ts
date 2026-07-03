import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Theme, Density } from '@/types';

// ─── State Interface ──────────────────────────────────────────────────────────

interface UIState {
  // Persisted preferences
  theme: Theme;
  density: Density;

  // Transient UI state
  sidebarOpen: boolean;
  cmdkOpen: boolean;
  createShiftOpen: boolean;
  notificationsOpen: boolean;
  selectedShiftId: string | null;
  editingShiftId: string | null;
  /** Pre-fill values applied the next time the create-shift drawer opens fresh. */
  createShiftDefaults: { employeeId?: string; date?: string; openShift?: boolean } | null;

  // ── Actions ──
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setDensity: (density: Density) => void;
  toggleDensity: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setCmdkOpen: (open: boolean) => void;
  setCreateShiftOpen: (open: boolean) => void;
  setNotificationsOpen: (open: boolean) => void;
  setSelectedShiftId: (id: string | null) => void;
  setEditingShiftId: (id: string | null) => void;
  setCreateShiftDefaults: (defaults: UIState['createShiftDefaults']) => void;
}

// ─── DOM Helpers ──────────────────────────────────────────────────────────────

function applyTheme(theme: Theme) {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme);
  }
}

function applyDensity(density: Density) {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-density', density);
  }
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // ── Initial State ──
      theme: 'light',
      density: 'comfortable',
      sidebarOpen: true,
      cmdkOpen: false,
      createShiftOpen: false,
      notificationsOpen: false,
      selectedShiftId: null,
      editingShiftId: null,
      createShiftDefaults: null,

      // ── Theme Actions ──
      setTheme: (theme) => {
        applyTheme(theme);
        set({ theme });
      },

      toggleTheme: () => {
        const next: Theme = get().theme === 'light' ? 'dark' : 'light';
        applyTheme(next);
        set({ theme: next });
      },

      // ── Density Actions ──
      setDensity: (density) => {
        applyDensity(density);
        set({ density });
      },

      toggleDensity: () => {
        const next: Density = get().density === 'comfortable' ? 'compact' : 'comfortable';
        applyDensity(next);
        set({ density: next });
      },

      // ── Sidebar Actions ──
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

      // ── Modal / Panel Actions ──
      setCmdkOpen: (open) => set({ cmdkOpen: open }),
      setCreateShiftOpen: (open) => set({ createShiftOpen: open }),
      setNotificationsOpen: (open) => set({ notificationsOpen: open }),
      setSelectedShiftId: (id) => set({ selectedShiftId: id }),
      setEditingShiftId: (id) => set({ editingShiftId: id }),
      setCreateShiftDefaults: (defaults) => set({ createShiftDefaults: defaults }),
    }),
    {
      name: 'nexora-ui',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : createNoopStorage()
      ),
      // Only persist these keys
      partialize: (state) => ({
        theme: state.theme,
        density: state.density,
        sidebarOpen: state.sidebarOpen,
      }),
      // Re-apply DOM attributes when store is rehydrated
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyTheme(state.theme);
          applyDensity(state.density);
        }
      },
    }
  )
);

// ─── SSR-safe noop storage ────────────────────────────────────────────────────

function createNoopStorage() {
  return {
    getItem: (_name: string): string | null => null,
    setItem: (_name: string, _value: string): void => {},
    removeItem: (_name: string): void => {},
  };
}

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectTheme = (s: UIState) => s.theme;
export const selectDensity = (s: UIState) => s.density;
export const selectSidebarOpen = (s: UIState) => s.sidebarOpen;
export const selectCmdkOpen = (s: UIState) => s.cmdkOpen;
export const selectCreateShiftOpen = (s: UIState) => s.createShiftOpen;
export const selectNotificationsOpen = (s: UIState) => s.notificationsOpen;
export const selectSelectedShiftId = (s: UIState) => s.selectedShiftId;
