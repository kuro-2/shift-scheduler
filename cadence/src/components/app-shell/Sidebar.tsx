'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  Users,
  CalendarOff,
  Clock,
  TrendingUp,
  Settings,
  ChevronDown,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useUIStore } from '@/store/ui.store';

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

const WORKSPACE_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard, href: '/dashboard' },
  {
    id: 'schedule',
    label: 'Schedule',
    Icon: Calendar,
    href: '/schedule',
    badge: 3,
    badgeBg: 'var(--open-bg)',
    badgeText: 'var(--open-text)',
  },
  { id: 'people', label: 'People', Icon: Users, href: '/people' },
  {
    id: 'time-off',
    label: 'Time off',
    Icon: CalendarOff,
    href: '/time-off',
    badge: 4,
    badgeBg: 'var(--pending-bg)',
    badgeText: 'var(--pending-text)',
  },
  { id: 'attendance', label: 'Attendance', Icon: Clock, href: '/attendance' },
  { id: 'reports', label: 'Reports', Icon: TrendingUp, href: '/reports' },
];

const ADMIN_ITEMS: NavItem[] = [
  { id: 'settings', label: 'Settings', Icon: Settings, href: '/settings/company' },
];

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

  const collapsed = !sidebarOpen;
  const width = collapsed ? 60 : 236;

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
              Cadence
            </div>
            <div
              style={{
                fontSize: 11,
                color: 'var(--text-dim)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              Northgate Co.
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

        {/* Divider */}
        <div
          style={{
            height: 1,
            background: 'var(--border)',
            marginInline: 4,
            marginBlock: 4,
          }}
        />

        {/* ADMIN group */}
        <div>
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
              Admin
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {ADMIN_ITEMS.map((item) => (
              <SidebarNavItem
                key={item.id}
                item={item}
                isActive={pathname.startsWith(item.href)}
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
        }}
      >
        <button
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 9,
            padding: '6px 6px',
            borderRadius: 8,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'background 0.12s ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-2)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
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
            SK
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
                  Sarah Kim
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
                  Operations Manager
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
