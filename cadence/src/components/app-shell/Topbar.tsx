'use client';

import { PanelLeft, Search, Bell, Plus } from 'lucide-react';
import { useUIStore } from '@/store/ui.store';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { DensityToggle } from '@/components/common/DensityToggle';

export function Topbar() {
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const setCmdkOpen = useUIStore((s) => s.setCmdkOpen);
  const setNotificationsOpen = useUIStore((s) => s.setNotificationsOpen);
  const setCreateShiftOpen = useUIStore((s) => s.setCreateShiftOpen);

  // Unread count — static for now; could be driven by a query
  const unreadCount = 5;

  return (
    <header
      style={{
        height: 60,
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        paddingInline: 12,
        flexShrink: 0,
      }}
    >
      {/* 1. Sidebar toggle */}
      <button
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
        style={{
          width: 32,
          height: 32,
          borderRadius: 7,
          border: 'none',
          background: 'transparent',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          flexShrink: 0,
          transition: 'background 0.12s ease, color 0.12s ease',
        }}
        onMouseEnter={(e) => {
          const btn = e.currentTarget as HTMLButtonElement;
          btn.style.background = 'var(--surface-2)';
          btn.style.color = 'var(--text)';
        }}
        onMouseLeave={(e) => {
          const btn = e.currentTarget as HTMLButtonElement;
          btn.style.background = 'transparent';
          btn.style.color = 'var(--text-muted)';
        }}
      >
        <PanelLeft size={17} />
      </button>

      {/* 2. ⌘K search trigger */}
      <button
        onClick={() => setCmdkOpen(true)}
        aria-label="Open command palette"
        style={{
          minWidth: 280,
          height: 34,
          background: 'var(--surface-2)',
          borderRadius: 8,
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          paddingInline: 10,
          cursor: 'pointer',
          textAlign: 'left',
          transition: 'background 0.12s ease',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-3)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-2)';
        }}
      >
        <Search size={14} style={{ color: 'var(--text-dim)', flexShrink: 0 }} />
        <span
          style={{
            flex: 1,
            fontSize: 13,
            color: 'var(--text-dim)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          Search or jump to…
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
          <kbd
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 18,
              padding: '0 4px',
              borderRadius: 4,
              border: '1px solid var(--border-strong)',
              background: 'var(--surface)',
              color: 'var(--text-dim)',
              fontSize: 11,
              fontFamily: 'var(--font-mono, monospace)',
              lineHeight: 1,
            }}
          >
            ⌘K
          </kbd>
        </span>
      </button>

      {/* 3. Spacer */}
      <div style={{ flex: 1 }} />

      {/* 4. Density toggle */}
      <DensityToggle />

      {/* 5. Theme toggle */}
      <ThemeToggle />

      {/* 6. Notifications bell */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setNotificationsOpen(true)}
          aria-label="Open notifications"
          style={{
            width: 32,
            height: 32,
            borderRadius: 7,
            border: 'none',
            background: 'transparent',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            position: 'relative',
            transition: 'background 0.12s ease, color 0.12s ease',
          }}
          onMouseEnter={(e) => {
            const btn = e.currentTarget as HTMLButtonElement;
            btn.style.background = 'var(--surface-2)';
            btn.style.color = 'var(--text)';
          }}
          onMouseLeave={(e) => {
            const btn = e.currentTarget as HTMLButtonElement;
            btn.style.background = 'transparent';
            btn.style.color = 'var(--text-muted)';
          }}
        >
          <Bell size={17} />
          {unreadCount > 0 && (
            <span
              aria-label={`${unreadCount} unread notifications`}
              style={{
                position: 'absolute',
                top: 6,
                right: 6,
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: '#EF4444',
                border: '1.5px solid var(--surface)',
              }}
            />
          )}
        </button>
      </div>

      {/* 7. New shift button */}
      <button
        onClick={() => setCreateShiftOpen(true)}
        style={{
          height: 32,
          paddingInline: 12,
          borderRadius: 7,
          border: 'none',
          background: 'var(--accent)',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          cursor: 'pointer',
          fontSize: 13,
          fontWeight: 600,
          flexShrink: 0,
          transition: 'background 0.12s ease',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent-hover)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent)';
        }}
      >
        <Plus size={15} />
        New shift
      </button>
    </header>
  );
}
