'use client';

import { AddRowButton } from './AddRowButton';
import { DeleteRowButton } from './DeleteRowButton';
import { inputStyle, genId, type OnboardingLocation } from './types';

interface StepLocationsProps {
  data: OnboardingLocation[];
  setData: (data: OnboardingLocation[]) => void;
}

export function StepLocations({ data, setData }: StepLocationsProps) {
  const updateRow = (id: string, patch: Partial<OnboardingLocation>) => {
    setData(data.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const removeRow = (id: string) => {
    setData(data.filter((row) => row.id !== id));
  };

  const addRow = () => {
    setData([...data, { id: genId('loc'), name: '', address: '' }]);
  };

  return (
    <div>
      <h3 style={{ fontSize: 17, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
        Add your locations
      </h3>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
        Where does your team work? Add each site you schedule for.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {data.map((row) => (
          <div key={row.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="text"
              value={row.name}
              onChange={(e) => updateRow(row.id, { name: e.target.value })}
              placeholder="Location name"
              style={{ ...inputStyle, flex: 1 }}
            />
            <input
              type="text"
              value={row.address}
              onChange={(e) => updateRow(row.id, { address: e.target.value })}
              placeholder="Address"
              style={{ ...inputStyle, flex: 1.4 }}
            />
            <DeleteRowButton onClick={() => removeRow(row.id)} label="Remove location" />
          </div>
        ))}
      </div>

      <AddRowButton label="Add another" onClick={addRow} />
    </div>
  );
}
