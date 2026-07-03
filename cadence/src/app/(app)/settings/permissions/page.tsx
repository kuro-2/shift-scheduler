'use client';

import { useState } from 'react';

type RoleName = 'Owner' | 'Admin' | 'Manager' | 'Employee';
type PermissionKey =
  | 'view_schedule'
  | 'edit_schedule'
  | 'approve_time_off'
  | 'manage_billing'
  | 'manage_employees';

interface PermissionDef {
  key: PermissionKey;
  label: string;
}

const PERMISSIONS: PermissionDef[] = [
  { key: 'view_schedule', label: 'View schedule' },
  { key: 'edit_schedule', label: 'Edit schedule' },
  { key: 'approve_time_off', label: 'Approve time off' },
  { key: 'manage_billing', label: 'Manage billing' },
  { key: 'manage_employees', label: 'Manage employees' },
];

const ROLES: RoleName[] = ['Owner', 'Admin', 'Manager', 'Employee'];

type PermissionMatrix = Record<RoleName, Record<PermissionKey, boolean>>;

const INITIAL_MATRIX: PermissionMatrix = {
  Owner: {
    view_schedule: true,
    edit_schedule: true,
    approve_time_off: true,
    manage_billing: true,
    manage_employees: true,
  },
  Admin: {
    view_schedule: true,
    edit_schedule: true,
    approve_time_off: true,
    manage_billing: true,
    manage_employees: true,
  },
  Manager: {
    view_schedule: true,
    edit_schedule: true,
    approve_time_off: true,
    manage_billing: false,
    manage_employees: false,
  },
  Employee: {
    view_schedule: true,
    edit_schedule: false,
    approve_time_off: false,
    manage_billing: false,
    manage_employees: false,
  },
};

// Owner permissions are locked — cannot be revoked.
const LOCKED_ROLE: RoleName = 'Owner';

export default function PermissionsSettingsPage() {
  const [matrix, setMatrix] = useState<PermissionMatrix>(INITIAL_MATRIX);

  function toggle(role: RoleName, key: PermissionKey) {
    if (role === LOCKED_ROLE) return;
    setMatrix((prev) => ({
      ...prev,
      [role]: { ...prev[role], [key]: !prev[role][key] },
    }));
  }

  return (
    <div style={{ maxWidth: 920 }}>
      {/* ── Header ── */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)', margin: 0 }}>
          Permissions
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
          Control what each role can see and do across your workspace.
        </p>
      </div>

      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          overflow: 'hidden',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ textAlign: 'left', padding: '12px 20px', color: 'var(--text-muted)', fontWeight: 500, fontSize: 12 }}>
                Role
              </th>
              {PERMISSIONS.map((perm) => (
                <th
                  key={perm.key}
                  style={{
                    textAlign: 'center',
                    padding: '12px 16px',
                    color: 'var(--text-muted)',
                    fontWeight: 500,
                    fontSize: 12,
                  }}
                >
                  {perm.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROLES.map((role, idx) => (
              <tr key={role} style={{ borderTop: idx > 0 ? '1px solid var(--border)' : 'none' }}>
                <td style={{ padding: '14px 20px', color: 'var(--text)', fontWeight: 500 }}>
                  {role}
                  {role === LOCKED_ROLE && (
                    <span style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 400, marginLeft: 6 }}>
                      (full access)
                    </span>
                  )}
                </td>
                {PERMISSIONS.map((perm) => (
                  <td key={perm.key} style={{ padding: '14px 16px', textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={matrix[role][perm.key]}
                      disabled={role === LOCKED_ROLE}
                      onChange={() => toggle(role, perm.key)}
                      aria-label={`${role} - ${perm.label}`}
                      style={{
                        width: 16,
                        height: 16,
                        accentColor: 'var(--accent)',
                        cursor: role === LOCKED_ROLE ? 'not-allowed' : 'pointer',
                      }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
