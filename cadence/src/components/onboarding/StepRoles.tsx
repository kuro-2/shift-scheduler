'use client';

import { AddRowButton } from './AddRowButton';
import { DeleteRowButton } from './DeleteRowButton';
import { inputStyle, genId, type OnboardingRole, type OnboardingDepartment } from './types';

interface StepRolesProps {
  data: OnboardingRole[];
  setData: (data: OnboardingRole[]) => void;
  departments: OnboardingDepartment[];
}

export function StepRoles({ data, setData, departments }: StepRolesProps) {
  const updateRow = (id: string, patch: Partial<OnboardingRole>) => {
    setData(data.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const removeRow = (id: string) => {
    setData(data.filter((row) => row.id !== id));
  };

  const addRow = () => {
    setData([...data, { id: genId('role'), name: '', departmentId: departments[0]?.id ?? '' }]);
  };

  return (
    <div>
      <h3 style={{ fontSize: 17, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
        Define your roles
      </h3>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
        Roles help you assign the right people to the right shifts.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {data.map((row) => (
          <div key={row.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="text"
              value={row.name}
              onChange={(e) => updateRow(row.id, { name: e.target.value })}
              placeholder="Role name"
              style={{ ...inputStyle, flex: 1.2 }}
            />
            <select
              value={row.departmentId}
              onChange={(e) => updateRow(row.id, { departmentId: e.target.value })}
              style={{ ...inputStyle, flex: 1 }}
            >
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name || 'Untitled department'}
                </option>
              ))}
            </select>
            <DeleteRowButton onClick={() => removeRow(row.id)} label="Remove role" />
          </div>
        ))}
      </div>

      <AddRowButton label="Add another" onClick={addRow} />
    </div>
  );
}
