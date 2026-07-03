'use client';

import { useState } from 'react';
import { InfoBanner } from './InfoBanner';
import { AddRowButton } from './AddRowButton';
import { DeleteRowButton } from './DeleteRowButton';
import { inputStyle, PRESET_COLORS, genId, type OnboardingDepartment } from './types';

interface StepDepartmentsProps {
  data: OnboardingDepartment[];
  setData: (data: OnboardingDepartment[]) => void;
}

export function StepDepartments({ data, setData }: StepDepartmentsProps) {
  const [openPickerId, setOpenPickerId] = useState<string | null>(null);

  const updateRow = (id: string, patch: Partial<OnboardingDepartment>) => {
    setData(data.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const removeRow = (id: string) => {
    setData(data.filter((row) => row.id !== id));
  };

  const addRow = () => {
    const usedColors = new Set(data.map((d) => d.color));
    const nextColor = PRESET_COLORS.find((c) => !usedColors.has(c)) ?? PRESET_COLORS[0];
    setData([...data, { id: genId('dept'), name: '', color: nextColor }]);
  };

  const cycleColor = (id: string, current: string) => {
    const idx = PRESET_COLORS.indexOf(current);
    const next = PRESET_COLORS[(idx + 1) % PRESET_COLORS.length];
    updateRow(id, { color: next });
  };

  return (
    <div>
      <h3 style={{ fontSize: 17, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
        Set up your departments
      </h3>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
        Group your team into departments to organize schedules.
      </p>

      <InfoBanner>You can always edit departments later in Settings.</InfoBanner>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {data.map((row) => (
          <div key={row.id} style={{ display: 'flex', gap: 8, alignItems: 'center', position: 'relative' }}>
            <button
              type="button"
              aria-label="Choose color"
              onClick={() => setOpenPickerId(openPickerId === row.id ? null : row.id)}
              style={{
                width: 36,
                height: 36,
                flexShrink: 0,
                borderRadius: 7,
                border: '1px solid var(--border)',
                background: row.color,
                cursor: 'pointer',
              }}
            />

            {openPickerId === row.id && (
              <div
                style={{
                  position: 'absolute',
                  top: 42,
                  left: 0,
                  zIndex: 10,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: 6,
                  padding: 10,
                  borderRadius: 10,
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  boxShadow: 'var(--shadow-md)',
                }}
              >
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    aria-label={color}
                    onClick={() => {
                      updateRow(row.id, { color });
                      setOpenPickerId(null);
                    }}
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 6,
                      border:
                        row.color === color
                          ? '2px solid var(--text)'
                          : '1px solid var(--border)',
                      background: color,
                      cursor: 'pointer',
                    }}
                  />
                ))}
              </div>
            )}

            <input
              type="text"
              value={row.name}
              onChange={(e) => updateRow(row.id, { name: e.target.value })}
              onDoubleClick={() => cycleColor(row.id, row.color)}
              placeholder="Department name"
              style={{ ...inputStyle, flex: 1 }}
            />

            <DeleteRowButton onClick={() => removeRow(row.id)} label="Remove department" />
          </div>
        ))}
      </div>

      <AddRowButton label="Add another" onClick={addRow} />
    </div>
  );
}
