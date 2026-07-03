'use client';

import { InfoBanner } from './InfoBanner';
import { AddRowButton } from './AddRowButton';
import { DeleteRowButton } from './DeleteRowButton';
import { inputStyle, genId, type OnboardingShiftTemplate, type OnboardingRole } from './types';

interface StepShiftTemplatesProps {
  data: OnboardingShiftTemplate[];
  setData: (data: OnboardingShiftTemplate[]) => void;
  roles: OnboardingRole[];
}

export function StepShiftTemplates({ data, setData, roles }: StepShiftTemplatesProps) {
  const updateRow = (id: string, patch: Partial<OnboardingShiftTemplate>) => {
    setData(data.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const removeRow = (id: string) => {
    setData(data.filter((row) => row.id !== id));
  };

  const addRow = () => {
    setData([
      ...data,
      { id: genId('tmpl'), name: '', startTime: '09:00', endTime: '17:00', roleId: roles[0]?.id ?? '' },
    ]);
  };

  return (
    <div>
      <h3 style={{ fontSize: 17, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
        Create shift templates
      </h3>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
        Save common shift patterns so you can reuse them on the schedule.
      </p>

      <InfoBanner>Templates speed up building your weekly schedule.</InfoBanner>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {data.map((row) => (
          <div key={row.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="text"
              value={row.name}
              onChange={(e) => updateRow(row.id, { name: e.target.value })}
              placeholder="Template name"
              style={{ ...inputStyle, flex: 1.4 }}
            />
            <input
              type="time"
              value={row.startTime}
              onChange={(e) => updateRow(row.id, { startTime: e.target.value })}
              style={{ ...inputStyle, flex: 0.8 }}
            />
            <span style={{ color: 'var(--text-dim)', fontSize: 12 }}>to</span>
            <input
              type="time"
              value={row.endTime}
              onChange={(e) => updateRow(row.id, { endTime: e.target.value })}
              style={{ ...inputStyle, flex: 0.8 }}
            />
            <select
              value={row.roleId}
              onChange={(e) => updateRow(row.id, { roleId: e.target.value })}
              style={{ ...inputStyle, flex: 1 }}
            >
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name || 'Untitled role'}
                </option>
              ))}
            </select>
            <DeleteRowButton onClick={() => removeRow(row.id)} label="Remove template" />
          </div>
        ))}
      </div>

      <AddRowButton label="Add another" onClick={addRow} />
    </div>
  );
}
