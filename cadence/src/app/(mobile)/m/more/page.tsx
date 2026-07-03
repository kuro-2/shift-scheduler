'use client';

import {
  User,
  CalendarOff,
  Bell,
  HelpCircle,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar } from '@/components/common/Avatar';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { EmployeeProfileDrawer } from '@/components/people/EmployeeProfileDrawer';
import { getEmployeeById } from '@/services/employees.service';
import { CURRENT_EMPLOYEE_ID } from '@/components/mobile/current-employee';
import { useState } from 'react';

interface MenuRow {
  id: string;
  label: string;
  Icon: LucideIcon;
  href?: string;
  onClick?: () => void;
  danger?: boolean;
  trailing?: React.ReactNode;
}

export default function MobileMorePage() {
  const [profileOpen, setProfileOpen] = useState(false);
  const employee = getEmployeeById(CURRENT_EMPLOYEE_ID);

  const rows: MenuRow[] = [
    { id: 'profile', label: 'My profile', Icon: User, onClick: () => setProfileOpen(true) },
    { id: 'time-off', label: 'Time off requests', Icon: CalendarOff, href: '/time-off' },
    {
      id: 'notifications',
      label: 'Notifications settings',
      Icon: Bell,
      onClick: () => toast.info('Notification preferences are coming soon'),
    },
    {
      id: 'help',
      label: 'Help & support',
      Icon: HelpCircle,
      onClick: () => toast.info('Help & support is coming soon — contact your manager for now'),
    },
    { id: 'theme', label: 'Theme', Icon: User, trailing: <ThemeToggle /> },
    { id: 'sign-out', label: 'Sign out', Icon: LogOut, href: '/login', danger: true },
  ];

  return (
    <div style={{ padding: '20px 16px 0' }}>
      {/* ── Profile header ── */}
      <div
        className="flex items-center gap-3"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: 18,
          marginBottom: 20,
        }}
      >
        <Avatar
          initials={employee?.initials ?? 'SR'}
          color={employee?.avatarColor ?? '#D4A04A'}
          size={56}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--text)' }}>
            {employee?.name ?? 'Sam Reyes'}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
            {employee?.jobTitle || 'Team Member'}
          </div>
        </div>
      </div>

      {/* ── Menu rows ── */}
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          overflow: 'hidden',
        }}
      >
        {rows.map((row, i) => {
          const { Icon } = row;
          const content = (
            <>
              <span
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 'var(--radius-sm)',
                  background: row.danger ? 'var(--conflict-bg)' : 'var(--surface-2)',
                  color: row.danger ? 'var(--conflict-text)' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon size={16} />
              </span>
              <span
                style={{
                  flex: 1,
                  fontSize: 14,
                  fontWeight: 500,
                  color: row.danger ? 'var(--conflict-text)' : 'var(--text)',
                }}
              >
                {row.label}
              </span>
              {row.trailing ?? (
                <ChevronRight size={16} style={{ color: 'var(--text-dim)', flexShrink: 0 }} />
              )}
            </>
          );

          if (row.href) {
            return (
              <a
                key={row.id}
                href={row.href}
                className="flex items-center gap-3"
                style={{
                  padding: '13px 14px',
                  borderTop: i === 0 ? 'none' : '1px solid var(--border)',
                  textDecoration: 'none',
                }}
              >
                {content}
              </a>
            );
          }

          if (row.onClick) {
            return (
              <button
                key={row.id}
                onClick={row.onClick}
                className="flex items-center gap-3"
                style={{
                  width: '100%',
                  padding: '13px 14px',
                  background: 'transparent',
                  border: 'none',
                  borderTop: i === 0 ? 'none' : '1px solid var(--border)',
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                {content}
              </button>
            );
          }

          return (
            <div
              key={row.id}
              className="flex items-center gap-3"
              style={{
                padding: '13px 14px',
                borderTop: i === 0 ? 'none' : '1px solid var(--border)',
              }}
            >
              {content}
            </div>
          );
        })}
      </div>

      <EmployeeProfileDrawer employeeId={profileOpen ? CURRENT_EMPLOYEE_ID : null} onClose={() => setProfileOpen(false)} />
    </div>
  );
}
