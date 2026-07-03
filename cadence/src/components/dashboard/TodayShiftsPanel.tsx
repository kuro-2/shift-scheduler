'use client';

import { useQuery } from '@tanstack/react-query';
import { getShifts } from '@/services/shifts.service';

// Static today-shifts for display (dashboard mock for Jun 29)
const STATIC_SHIFTS = [
  {
    id: 's1',
    timeRange: '7:00 – 11:00',
    role: 'Opening Floor',
    assignees: 'Sam Reyes · Riley Hayes',
    status: 'filled' as const,
    partial: false,
  },
  {
    id: 's2',
    timeRange: '9:00 – 17:00',
    role: 'Front Desk',
    assignees: 'Priya Shah · Alex Mercer',
    status: 'filled' as const,
    partial: false,
  },
  {
    id: 's3',
    timeRange: '12:00 – 20:00',
    role: 'Floor Afternoon',
    assignees: '2 of 3 assigned · 1 open',
    status: 'open' as const,
    partial: true,
  },
  {
    id: 's4',
    timeRange: '17:00 – 23:00',
    role: 'Closing All',
    assignees: 'Jordan Park · Naomi West · Marcus Chen',
    status: 'filled' as const,
    partial: false,
  },
];

const STATUS_BORDER: Record<string, string> = {
  filled: 'var(--filled-dot)',
  open: 'var(--open-dot)',
  conflict: 'var(--conflict-dot)',
  draft: 'var(--draft-dot)',
};

const STATUS_LABEL: Record<string, { bg: string; text: string; label: string }> = {
  filled: { bg: 'var(--filled-bg)', text: 'var(--filled-text)', label: 'FILLED' },
  open: { bg: 'var(--open-bg)', text: 'var(--open-text)', label: 'OPEN' },
  conflict: { bg: 'var(--conflict-bg)', text: 'var(--conflict-text)', label: 'CONFLICT' },
  draft: { bg: 'var(--draft-bg)', text: 'var(--draft-text)', label: 'DRAFT' },
};

function ShiftRow({
  shift,
}: {
  shift: (typeof STATIC_SHIFTS)[0];
}) {
  const cfg = STATUS_LABEL[shift.status];
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        paddingBlock: 10,
        borderLeft: `3px solid ${STATUS_BORDER[shift.status]}`,
        paddingLeft: 12,
        borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
      }}
    >
      {/* Time */}
      <span
        style={{
          fontSize: 12,
          fontWeight: 600,
          fontFamily: 'var(--font-mono)',
          color: 'var(--text)',
          whiteSpace: 'nowrap',
          minWidth: 100,
        }}
      >
        {shift.timeRange}
      </span>

      {/* Role + assignees */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', lineHeight: 1.3 }}>
          {shift.role}
        </div>
        <div
          style={{
            fontSize: 12,
            color: shift.partial ? 'var(--open-text)' : 'var(--text-dim)',
            marginTop: 1,
          }}
        >
          {shift.assignees}
        </div>
      </div>

      {/* Status badge */}
      <span
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.05em',
          background: cfg.bg,
          color: cfg.text,
          borderRadius: 4,
          paddingInline: 7,
          paddingBlock: 3,
          flexShrink: 0,
        }}
      >
        {cfg.label}
      </span>
    </div>
  );
}

export function TodayShiftsPanel() {
  // Fetch real data so the "total" badge reflects live shift counts, while the
  // curated rows below stay pinned to the design mock's exact copy.
  const { data: shifts } = useQuery({
    queryKey: ['shifts', 'today', '2026-06-29'],
    queryFn: () =>
      getShifts({ dateRange: { start: '2026-06-29', end: '2026-06-29' } }),
  });

  const totalToday = shifts?.length ?? STATIC_SHIFTS.length;

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: 18,
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2" style={{ marginBottom: 16 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
          Today&apos;s shifts
        </span>
        <span
          style={{
            fontSize: 12,
            color: 'var(--text-dim)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          {totalToday} total
        </span>
      </div>

      {/* Shift rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {STATIC_SHIFTS.map((shift) => (
          <ShiftRow key={shift.id} shift={shift} />
        ))}
      </div>
    </div>
  );
}
