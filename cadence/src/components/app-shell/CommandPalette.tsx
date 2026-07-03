'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import {
  Search,
  LayoutDashboard,
  Calendar,
  Users,
  CalendarOff,
  Clock,
  TrendingUp,
  Settings,
  Plus,
  Sun,
  Rows3,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useUIStore } from '@/store/ui.store';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CmdItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  hotkey?: string;
  group: 'suggested' | 'navigation' | 'preferences';
  action: () => void;
}

// ─── CommandPalette ───────────────────────────────────────────────────────────

export function CommandPalette() {
  const cmdkOpen = useUIStore((s) => s.cmdkOpen);
  const setCmdkOpen = useUIStore((s) => s.setCmdkOpen);
  const toggleTheme = useUIStore((s) => s.toggleTheme);
  const toggleDensity = useUIStore((s) => s.toggleDensity);
  const setCreateShiftOpen = useUIStore((s) => s.setCreateShiftOpen);
  const router = useRouter();

  const close = useCallback(() => setCmdkOpen(false), [setCmdkOpen]);

  const navigate = useCallback(
    (href: string) => {
      router.push(href);
      close();
    },
    [router, close]
  );

  // ⌘K / Ctrl+K global shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdkOpen(true);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [setCmdkOpen]);

  const items: CmdItem[] = [
    // Suggested
    {
      id: 'create-shift',
      label: 'Create shift',
      icon: <Plus size={15} />,
      hotkey: 'C',
      group: 'suggested',
      action: () => {
        setCreateShiftOpen(true);
        close();
      },
    },

    // Navigation
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard size={15} />,
      hotkey: 'G D',
      group: 'navigation',
      action: () => navigate('/dashboard'),
    },
    {
      id: 'schedule',
      label: 'Schedule',
      icon: <Calendar size={15} />,
      hotkey: 'G S',
      group: 'navigation',
      action: () => navigate('/schedule'),
    },
    {
      id: 'people',
      label: 'People',
      icon: <Users size={15} />,
      group: 'navigation',
      action: () => navigate('/people'),
    },
    {
      id: 'time-off',
      label: 'Time off',
      icon: <CalendarOff size={15} />,
      group: 'navigation',
      action: () => navigate('/time-off'),
    },
    {
      id: 'attendance',
      label: 'Attendance',
      icon: <Clock size={15} />,
      group: 'navigation',
      action: () => navigate('/attendance'),
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: <TrendingUp size={15} />,
      group: 'navigation',
      action: () => navigate('/reports'),
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings size={15} />,
      group: 'navigation',
      action: () => navigate('/settings/company'),
    },

    // Preferences
    {
      id: 'toggle-theme',
      label: 'Toggle theme',
      icon: <Sun size={15} />,
      hotkey: '⌘⇧L',
      group: 'preferences',
      action: () => {
        toggleTheme();
        close();
      },
    },
    {
      id: 'toggle-density',
      label: 'Toggle density',
      icon: <Rows3 size={15} />,
      group: 'preferences',
      action: () => {
        toggleDensity();
        close();
      },
    },
  ];

  const suggested = items.filter((i) => i.group === 'suggested');
  const navigation = items.filter((i) => i.group === 'navigation');
  const preferences = items.filter((i) => i.group === 'preferences');

  return (
    <AnimatePresence>
      {cmdkOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="cmdk-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={close}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.32)',
              backdropFilter: 'blur(2px)',
              WebkitBackdropFilter: 'blur(2px)',
              zIndex: 50,
            }}
          />

          {/* Modal */}
          <motion.div
            key="cmdk-modal"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.2, 0.8, 0.2, 1] }}
            style={{
              position: 'fixed',
              top: '14vh',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '100%',
              maxWidth: 560,
              zIndex: 51,
              paddingInline: 16,
            }}
          >
            <Command
              loop
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                boxShadow: 'var(--shadow-lg)',
                overflow: 'hidden',
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') close();
              }}
            >
              {/* Input row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 14px',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <Search size={16} style={{ color: 'var(--text-dim)', flexShrink: 0 }} />
                <Command.Input
                  autoFocus
                  placeholder="Search or jump to…"
                  style={{
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    color: 'var(--text)',
                    fontSize: 14,
                  }}
                />
                <kbd
                  onClick={close}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 20,
                    padding: '0 5px',
                    borderRadius: 4,
                    border: '1px solid var(--border-strong)',
                    background: 'var(--surface-2)',
                    color: 'var(--text-dim)',
                    fontSize: 11,
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  Esc
                </kbd>
              </div>

              {/* Results */}
              <Command.List
                style={{
                  maxHeight: 360,
                  overflowY: 'auto',
                  padding: '6px 6px',
                }}
              >
                <Command.Empty
                  style={{
                    padding: '20px 12px',
                    textAlign: 'center',
                    color: 'var(--text-dim)',
                    fontSize: 14,
                  }}
                >
                  No results found.
                </Command.Empty>

                {/* Suggested */}
                <CmdGroup label="Suggested" items={suggested} />
                <CmdGroup label="Navigation" items={navigation} />
                <CmdGroup label="Preferences" items={preferences} />
              </Command.List>
            </Command>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── CmdGroup ─────────────────────────────────────────────────────────────────

function CmdGroup({ label, items }: { label: string; items: CmdItem[] }) {
  if (items.length === 0) return null;

  return (
    <Command.Group
      heading={label}
      style={{
        // Group heading styles injected via CSS below — we use data attributes
      }}
    >
      {items.map((item) => (
        <Command.Item
          key={item.id}
          value={item.label}
          onSelect={item.action}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 10px',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 14,
            color: 'var(--text)',
          }}
        >
          <span style={{ color: 'var(--text-muted)', flexShrink: 0, display: 'flex' }}>
            {item.icon}
          </span>
          <span style={{ flex: 1 }}>{item.label}</span>
          {item.hotkey && (
            <span
              style={{
                fontSize: 11,
                color: 'var(--text-dim)',
                fontFamily: 'var(--font-mono, monospace)',
                flexShrink: 0,
              }}
            >
              {item.hotkey}
            </span>
          )}
        </Command.Item>
      ))}
    </Command.Group>
  );
}
