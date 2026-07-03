'use client';

import { Toggle } from '@/components/settings/Toggle';
import { inputStyle, type BusinessHoursDay } from './types';

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = i % 2 === 0 ? '00' : '30';
  return `${String(hour).padStart(2, '0')}:${minute}`;
});

interface StepBusinessHoursProps {
  data: BusinessHoursDay[];
  setData: (data: BusinessHoursDay[]) => void;
}

export function StepBusinessHours({ data, setData }: StepBusinessHoursProps) {
  const updateDay = (day: BusinessHoursDay['day'], patch: Partial<BusinessHoursDay>) => {
    setData(data.map((row) => (row.day === day ? { ...row, ...patch } : row)));
  };

  return (
    <div>
      <h3 style={{ fontSize: 17, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
        Set your business hours
      </h3>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
        We&apos;ll use this to flag shifts scheduled outside open hours.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {data.map((row) => (
          <div
            key={row.day}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '8px 10px',
              borderRadius: 8,
              background: 'var(--surface-2)',
            }}
          >
            <span
              style={{
                width: 40,
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--text)',
                flexShrink: 0,
              }}
            >
              {row.day}
            </span>

            <Toggle
              checked={row.open}
              onChange={(value) => updateDay(row.day, { open: value })}
              label={`${row.day} open`}
            />

            <span
              style={{
                fontSize: 12,
                color: row.open ? 'var(--text-muted)' : 'var(--text-dim)',
                width: 48,
                flexShrink: 0,
              }}
            >
              {row.open ? 'Open' : 'Closed'}
            </span>

            <select
              value={row.openTime}
              onChange={(e) => updateDay(row.day, { openTime: e.target.value })}
              disabled={!row.open}
              style={{
                ...inputStyle,
                flex: 1,
                opacity: row.open ? 1 : 0.5,
                cursor: row.open ? 'pointer' : 'not-allowed',
              }}
            >
              {TIME_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            <span style={{ color: 'var(--text-dim)', fontSize: 12 }}>to</span>

            <select
              value={row.closeTime}
              onChange={(e) => updateDay(row.day, { closeTime: e.target.value })}
              disabled={!row.open}
              style={{
                ...inputStyle,
                flex: 1,
                opacity: row.open ? 1 : 0.5,
                cursor: row.open ? 'pointer' : 'not-allowed',
              }}
            >
              {TIME_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
