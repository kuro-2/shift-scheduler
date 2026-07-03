'use client';

import { AlertTriangle } from 'lucide-react';

export function ScheduleErrorState({ error }: { error: unknown }) {
  const message = error instanceof Error ? error.message : 'Failed to load schedule data.';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        height: 200,
        padding: '0 24px',
        textAlign: 'center',
      }}
    >
      <AlertTriangle size={22} style={{ color: 'var(--conflict-text)' }} />
      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
        Couldn&apos;t load the schedule
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-dim)', maxWidth: 480 }}>{message}</div>
    </div>
  );
}
