'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  Users,
  CalendarOff,
  Clock,
  TrendingUp,
  Settings,
  ChevronDown,
  Package,
  Wallet,
  LogOut,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useUIStore } from '@/store/ui.store';
import { useAuthStore } from '@/store/auth.store';
import { signOut } from '@/services/auth.service';

// ─── Nav Config ──────────────────────────────────────────────────────────────

interface NavItem {
  id: string;
  label: string;
  Icon: LucideIcon;
  href: string;
  badge?: number;
  badgeBg?: string;
  badgeText?: string;
}

// NOTE: these tabs point at pages that currently render a "Coming soon"
// placeholder (real implementations are commented out in each page.tsx, not
// deleted) — only Schedule has a working page for now.
const WORKSPACE_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard, href: '/dashboard' },
  {
    id: 'schedule',
    label: 'Schedule',
    Icon: Calendar,
    href: '/schedule',
  },
  { id: 'people', label: 'People', Icon: Users, href: '/people' },
  {
    id: 'time-off',
    label: 'Time off',
    Icon: CalendarOff,
    href: '/time-off',
  },
  { id: 'attendance', label: 'Attendance', Icon: Clock, href: '/attendance' },
  { id: 'reports', label: 'Reports', Icon: TrendingUp, href: '/reports' },
  { id: 'inventory', label: 'Inventory', Icon: Package, href: '/inventory' },
  { id: 'financial', label: 'Financials', Icon: Wallet, href: '/financial' },
];

const ADMIN_ITEMS: NavItem[] = [
  { id: 'settings', label: 'Settings', Icon: Settings, href: '/settings/company' },
];

// ─── User display helpers ─────────────────────────────────────────────────────

function getInitials(username: string): string {
  const parts = username.split(/[.\s_-]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return username.slice(0, 2).toUpperCase();
}

function formatRole(role: string): string {
  return role.charAt(0) + role.slice(1).toLowerCase();
}

// ─── Starburst SVG ────────────────────────────────────────────────────────────

function StarburstIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="2" x2="12" y2="8" />
      <line x1="12" y1="16" x2="12" y2="22" />
      <line x1="2" y1="12" x2="8" y2="12" />
      <line x1="16" y1="12" x2="22" y2="12" />
      <line x1="5" y1="5" x2="9" y2="9" />
      <line x1="15" y1="15" x2="19" y2="19" />
      <line x1="5" y1="19" x2="9" y2="15" />
      <line x1="15" y1="9" x2="19" y2="5" />
    </svg>
  );
}

// ─── Nav Item ─────────────────────────────────────────────────────────────────

function SidebarNavItem({
  item,
  isActive,
  collapsed,
}: {
  item: NavItem;
  isActive: boolean;
  collapsed: boolean;
}) {
  const { Icon } = item;

  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 11,
        padding: '8px 10px',
        borderRadius: 8,
        fontSize: 14,
        fontWeight: 500,
        color: isActive ? 'var(--accent-text)' : 'var(--text-muted)',
        background: isActive ? 'var(--accent-soft)' : 'transparent',
        textDecoration: 'none',
        transition: 'background 0.12s ease, color 0.12s ease',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          (e.currentTarget as HTMLAnchorElement).style.background = 'var(--surface-2)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
        }
      }}
    >
      <span
        style={{
          color: isActive ? 'var(--accent)' : 'var(--text-muted)',
          flexShrink: 0,
          display: 'flex',
        }}
      >
        <Icon size={17} />
      </span>

      {!collapsed && (
        <>
          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {item.label}
          </span>
          {item.badge != null && (
            <span
              style={{
                minWidth: 18,
                height: 18,
                borderRadius: 99,
                background: item.badgeBg,
                color: item.badgeText,
                fontSize: 11,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                paddingInline: 5,
                flexShrink: 0,
              }}
            >
              {item.badge}
            </span>
          )}
        </>
      )}
    </Link>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

export function Sidebar() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const pathname = usePathname();
  const router = useRouter();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clear);

  const collapsed = !sidebarOpen;
  const width = collapsed ? 60 : 236;

  async function handleLogout() {
    setUserMenuOpen(false);
    try {
      await signOut();
    } finally {
      clearAuth();
      router.push('/login');
    }
  }

  return (
    <aside
      style={{
        width,
        minWidth: width,
        height: '100vh',
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 180ms ease, min-width 180ms ease',
        overflow: 'hidden',
      }}
    >
      {/* ── Logo area ── */}
      <div
        style={{
          height: 60,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '0 14px',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}
      >
        {/* Logo mark */}
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: 'linear-gradient(135deg, var(--accent), #6D63F5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <StarburstIcon />
        </div>

        {/* Wordmark (hidden when collapsed) */}
        {!collapsed && (
          <div style={{ overflow: 'hidden' }}>
            <div
              style={{
                fontWeight: 600,
                fontSize: 15,
                color: 'var(--text)',
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
              }}
            >
              Nexora
            </div>
          </div>
        )}
      </div>

      {/* ── Nav scroll area ── */}
      <nav
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '8px 8px',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {/* WORKSPACE group */}
        <div style={{ marginBottom: 4 }}>
          {!collapsed && (
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: 'var(--text-dim)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                padding: '6px 10px 4px',
              }}
            >
              Workspace
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {WORKSPACE_ITEMS.map((item) => (
              <SidebarNavItem
                key={item.id}
                item={item}
                isActive={
                  item.href === '/dashboard'
                    ? pathname === '/dashboard' || pathname === '/'
                    : pathname.startsWith(item.href)
                }
                collapsed={collapsed}
              />
            ))}
          </div>
        </div>

        {/* ADMIN group */}
        <div style={{ marginBottom: 4 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {ADMIN_ITEMS.map((item) => (
              <SidebarNavItem
                key={item.id}
                item={item}
                isActive={pathname.startsWith('/settings')}
                collapsed={collapsed}
              />
            ))}
          </div>
        </div>
      </nav>

      {/* ── User card ── */}
      <div
        style={{
          borderTop: '1px solid var(--border)',
          padding: 10,
          flexShrink: 0,
          position: 'relative',
        }}
      >
        {userMenuOpen && (
          <>
            <div
              onClick={() => setUserMenuOpen(false)}
              style={{ position: 'fixed', inset: 0, zIndex: 60 }}
            />
            <div
              role="menu"
              style={{
                position: 'absolute',
                bottom: '100%',
                left: 10,
                right: 10,
                marginBottom: 6,
                zIndex: 61,
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                boxShadow: 'var(--shadow-lg)',
                padding: 4,
              }}
            >
              {/* "My profile" (Settings) hidden while the app is scoped to the scheduler only */}
              <button
                role="menuitem"
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 6,
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: 13,
                  color: 'var(--conflict-text)',
                  textAlign: 'left',
                }}
              >
                <LogOut size={15} />
                Log out
              </button>
            </div>
          </>
        )}
        <button
          onClick={() => setUserMenuOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={userMenuOpen}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 9,
            padding: '6px 6px',
            borderRadius: 8,
            border: 'none',
            background: userMenuOpen ? 'var(--surface-2)' : 'transparent',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'background 0.12s ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-2)';
          }}
          onMouseLeave={(e) => {
            if (!userMenuOpen) (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: '#7C6AC4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontSize: 12,
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            {user ? getInitials(user.username) : '?'}
          </div>

          {/* Name + role */}
          {!collapsed && (
            <>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--text)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {user?.username ?? 'Guest'}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: 'var(--text-dim)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {user ? formatRole(user.userRole) : ''}
                </div>
              </div>
              <ChevronDown size={14} style={{ color: 'var(--text-dim)', flexShrink: 0 }} />
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
