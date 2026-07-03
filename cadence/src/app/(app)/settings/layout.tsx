'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// ─── Nav Config ──────────────────────────────────────────────────────────────

interface SettingsNavItem {
  id: string;
  label: string;
  href: string;
}

interface SettingsNavGroup {
  label: string;
  items: SettingsNavItem[];
}

const NAV_GROUPS: SettingsNavGroup[] = [
  {
    label: 'Workspace',
    items: [
      { id: 'company', label: 'Company', href: '/settings/company' },
      { id: 'branding', label: 'Branding', href: '/settings/branding' },
      { id: 'billing', label: 'Plan & billing', href: '/settings/billing' },
    ],
  },
  {
    label: 'Scheduling',
    items: [
      { id: 'departments', label: 'Departments', href: '/settings/departments' },
      { id: 'roles', label: 'Roles & skills', href: '/settings/roles' },
      { id: 'locations', label: 'Locations', href: '/settings/locations' },
      { id: 'templates', label: 'Shift templates', href: '/settings/templates' },
      { id: 'hours', label: 'Business hours', href: '/settings/hours' },
    ],
  },
  {
    label: 'Admin',
    items: [
      { id: 'permissions', label: 'Permissions', href: '/settings/permissions' },
      { id: 'integrations', label: 'Integrations', href: '/settings/integrations' },
      { id: 'api-keys', label: 'API keys', href: '/settings/api-keys' },
      { id: 'audit-log', label: 'Audit log', href: '/settings/audit-log' },
    ],
  },
];

// ─── Nav Item ─────────────────────────────────────────────────────────────────

function SettingsNavLink({ item, isActive }: { item: SettingsNavItem; isActive: boolean }) {
  return (
    <Link
      href={item.href}
      style={{
        display: 'block',
        padding: '8px 10px',
        borderRadius: 8,
        fontSize: 13,
        fontWeight: 500,
        color: isActive ? 'var(--accent-text)' : 'var(--text-muted)',
        background: isActive ? 'var(--accent-soft)' : 'transparent',
        textDecoration: 'none',
        transition: 'background 0.12s ease, color 0.12s ease',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
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
      {item.label}
    </Link>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full">
      <nav
        style={{
          width: 220,
          minWidth: 220,
          borderRight: '1px solid var(--border)',
          padding: '20px 12px',
          overflowY: 'auto',
        }}
      >
        {NAV_GROUPS.map((group, idx) => (
          <div key={group.label} style={{ marginBottom: idx < NAV_GROUPS.length - 1 ? 8 : 0 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--text-dim)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                padding: '8px 10px 6px',
              }}
            >
              {group.label}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {group.items.map((item) => (
                <SettingsNavLink
                  key={item.id}
                  item={item}
                  isActive={pathname.startsWith(item.href)}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>
      <div className="flex-1 overflow-y-auto" style={{ padding: '28px 32px' }}>
        {children}
      </div>
    </div>
  );
}
