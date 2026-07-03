'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, Clock, MoreHorizontal } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ─── Tab Config ────────────────────────────────────────────────────────────────

interface TabItem {
  id: string;
  label: string;
  Icon: LucideIcon;
  href: string;
  central?: boolean;
}

const TABS: TabItem[] = [
  { id: 'today', label: 'Today', Icon: Home, href: '/m' },
  { id: 'schedule', label: 'Schedule', Icon: Calendar, href: '/m/schedule' },
  { id: 'clock', label: 'Clock', Icon: Clock, href: '/m/clock', central: true },
  { id: 'more', label: 'More', Icon: MoreHorizontal, href: '/m/more' },
];

// ─── Bottom Tab Bar ─────────────────────────────────────────────────────────────

function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        height: 64,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 40,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 480,
          margin: '0 auto',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
        }}
      >
        {TABS.map((tab) => {
          const isActive =
            tab.href === '/m' ? pathname === '/m' : pathname.startsWith(tab.href);
          const { Icon } = tab;

          return (
            <Link
              key={tab.id}
              href={tab.href}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 3,
                flex: 1,
                height: '100%',
                textDecoration: 'none',
                color: isActive ? 'var(--accent)' : 'var(--text-dim)',
              }}
            >
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: tab.central ? 40 : 28,
                  height: tab.central ? 40 : 28,
                  borderRadius: '50%',
                  background: tab.central
                    ? 'linear-gradient(135deg, var(--accent), #6D63F5)'
                    : 'transparent',
                  color: tab.central ? '#FFFFFF' : isActive ? 'var(--accent)' : 'var(--text-dim)',
                  marginTop: tab.central ? -16 : 0,
                  boxShadow: tab.central ? 'var(--shadow-md)' : 'none',
                }}
              >
                <Icon size={tab.central ? 20 : 18} />
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? 'var(--accent)' : 'var(--text-dim)',
                  lineHeight: 1,
                }}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// ─── Mobile Layout ──────────────────────────────────────────────────────────────

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 480,
          minHeight: '100vh',
          background: 'var(--bg)',
          position: 'relative',
          boxShadow: '0 0 0 1px var(--border)',
        }}
      >
        <main
          style={{
            paddingBottom: 'calc(64px + env(safe-area-inset-bottom, 0px) + 16px)',
            minHeight: '100vh',
          }}
        >
          {children}
        </main>
      </div>

      <BottomTabBar />
    </div>
  );
}
