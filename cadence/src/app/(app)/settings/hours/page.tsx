'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Toggle } from '@/components/settings/Toggle';

interface DayHours {
  day: string;
  open: boolean;
  openTime: string;
  closeTime: string;
}

const TIME_OPTIONS = [
  '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30',
  '22:00', '22:30', '23:00',
];

function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${m.toString().padStart(2, '0')} ${period}`;
}

const INITIAL_HOURS: DayHours[] = [
  { day: 'Monday', open: true, openTime: '08:00', closeTime: '20:00' },
  { day: 'Tuesday', open: true, openTime: '08:00', closeTime: '20:00' },
  { day: 'Wednesday', open: true, openTime: '08:00', closeTime: '20:00' },
  { day: 'Thursday', open: true, openTime: '08:00', closeTime: '20:00' },
  { day: 'Friday', open: true, openTime: '08:00', closeTime: '21:00' },
  { day: 'Saturday', open: true, openTime: '09:00', closeTime: '21:00' },
  { day: 'Sunday', open: false, openTime: '10:00', closeTime: '18:00' },
];

const selectStyle: React.CSSProperties = {
  height: 36,
  padding: '0 10px',
  background: 'var(--surface-2)',
  border: '1px solid var(--border)',
  borderRadius: 7,
  fontSize: 13,
  color: 'var(--text)',
};

export default function BusinessHoursSettingsPage() {
  const [hours, setHours] = useState<DayHours[]>(INITIAL_HOURS);

  function updateDay(index: number, patch: Partial<DayHours>) {
    setHours((prev) => prev.map((d, i) => (i === index ? { ...d, ...patch } : d)));
  }

  return (
    <div style={{ maxWidth: 760 }}>
      {/* ── Header ── */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)', margin: 0 }}>
          Business hours
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
          Set the hours your locations are open. Shifts outside these hours will be flagged.
        </p>
      </div>

      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: 20,
          marginBottom: 16,
        }}
      >
        {hours.map((d, idx) => (
          <div
            key={d.day}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: '12px 0',
              borderTop: idx > 0 ? '1px solid var(--border)' : 'none',
            }}
          >
            <div style={{ width: 100, flexShrink: 0, fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>
              {d.day}
            </div>
            <Toggle
              checked={d.open}
              onChange={(v) => updateDay(idx, { open: v })}
              label={`${d.day} open`}
            />
            <div
              style={{
                width: 64,
                flexShrink: 0,
                fontSize: 12,
                color: d.open ? 'var(--filled-text)' : 'var(--text-dim)',
                fontWeight: 500,
              }}
            >
              {d.open ? 'Open' : 'Closed'}
            </div>
            <select
              value={d.openTime}
              disabled={!d.open}
              onChange={(e) => updateDay(idx, { openTime: e.target.value })}
              style={{ ...selectStyle, opacity: d.open ? 1 : 0.5, width: 130 }}
            >
              {TIME_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {formatTime(t)}
                </option>
              ))}
            </select>
            <span style={{ color: 'var(--text-dim)', fontSize: 13 }}>to</span>
            <select
              value={d.closeTime}
              disabled={!d.open}
              onChange={(e) => updateDay(idx, { closeTime: e.target.value })}
              style={{ ...selectStyle, opacity: d.open ? 1 : 0.5, width: 130 }}
            >
              {TIME_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {formatTime(t)}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* ── Save ── */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={() => toast.success('Business hours saved')}
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: '#FFFFFF',
            background: 'var(--accent)',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            padding: '8px 16px',
            cursor: 'pointer',
          }}
        >
          Save
        </button>
      </div>
    </div>
  );
}
