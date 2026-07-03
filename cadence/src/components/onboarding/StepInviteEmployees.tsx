'use client';

import { CheckCircle2 } from 'lucide-react';
import { AddRowButton } from './AddRowButton';
import { DeleteRowButton } from './DeleteRowButton';
import { inputStyle, genId, type OnboardingInvite, type OnboardingRole } from './types';

interface StepInviteEmployeesProps {
  data: OnboardingInvite[];
  setData: (data: OnboardingInvite[]) => void;
  roles: OnboardingRole[];
  sendInviteEmails: boolean;
  setSendInviteEmails: (value: boolean) => void;
}

export function StepInviteEmployees({
  data,
  setData,
  roles,
  sendInviteEmails,
  setSendInviteEmails,
}: StepInviteEmployeesProps) {
  const updateRow = (id: string, patch: Partial<OnboardingInvite>) => {
    setData(data.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const removeRow = (id: string) => {
    setData(data.filter((row) => row.id !== id));
  };

  const addRow = () => {
    setData([...data, { id: genId('invite'), name: '', email: '', roleId: roles[0]?.id ?? '' }]);
  };

  return (
    <div>
      <h3 style={{ fontSize: 17, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
        Invite your team
      </h3>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
        Add employees now, or skip and invite them later from People.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {data.map((row) => (
          <div key={row.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="text"
              value={row.name}
              onChange={(e) => updateRow(row.id, { name: e.target.value })}
              placeholder="Full name"
              style={{ ...inputStyle, flex: 1 }}
            />
            <input
              type="email"
              value={row.email}
              onChange={(e) => updateRow(row.id, { email: e.target.value })}
              placeholder="Email address"
              style={{ ...inputStyle, flex: 1.2 }}
            />
            <select
              value={row.roleId}
              onChange={(e) => updateRow(row.id, { roleId: e.target.value })}
              style={{ ...inputStyle, flex: 0.9 }}
            >
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name || 'Untitled role'}
                </option>
              ))}
            </select>
            <DeleteRowButton onClick={() => removeRow(row.id)} label="Remove invite" />
          </div>
        ))}
      </div>

      <AddRowButton label="Add another" onClick={addRow} />

      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginTop: 18,
          fontSize: 13,
          color: 'var(--text)',
          cursor: 'pointer',
        }}
      >
        <input
          type="checkbox"
          checked={sendInviteEmails}
          onChange={(e) => setSendInviteEmails(e.target.checked)}
          style={{ width: 16, height: 16, cursor: 'pointer' }}
        />
        Send invite emails now
      </label>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginTop: 20,
          padding: 12,
          borderRadius: 8,
          background: 'var(--filled-bg)',
        }}
      >
        <CheckCircle2 size={16} style={{ color: 'var(--filled-text)', flexShrink: 0 }} />
        <span style={{ fontSize: 13, color: 'var(--filled-text)', fontWeight: 500 }}>
          You&apos;re all set! Click Finish setup to go to your dashboard.
        </span>
      </div>
    </div>
  );
}
