'use client';

import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, Clock, XCircle, TrendingUp } from 'lucide-react';
import { getAttendanceEvents } from '@/services/attendance.service';
import { getShiftById } from '@/services/shifts.service';
import type { AttendanceEvent } from '@/types';

// ─── Stats Computation ────────────────────────────────────────────────────────

function computeOvertimeHours(events: AttendanceEvent[]): number {
  let totalMs = 0;

  for (const event of events) {
    if (!event.clockIn || !event.clockOut) continue;
    const shift = getShiftById(event.shiftId);
    if (!shift) continue;

    const clockInMs = new Date(event.clockIn).getTime();
    const clockOutMs = new Date(event.clockOut).getTime();
    const breakMs = event.breaks.reduce((sum, b) => {
      if (!b.start || !b.end) return sum;
      return sum + (new Date(b.end).getTime() - new Date(b.start).getTime());
    }, 0);
    const workedMs = clockOutMs - clockInMs - breakMs;

    const [sh, sm] = shift.startTime.split(':').map(Number);
    const [eh, em] = shift.endTime.split(':').map(Number);
    const scheduledMs =
      ((eh * 60 + em - (sh * 60 + sm) - shift.breakMinutes) * 60 * 1000);

    const overMs = workedMs - scheduledMs;
    if (overMs > 0) totalMs += overMs;
  }

  return totalMs / (1000 * 60 * 60);
}

function computeStats(events: AttendanceEvent[]) {
  const onTime = events.filter(
    (e) => e.status === 'on_time' || e.status === 'on_shift' || e.status === 'complete' || e.status === 'on_break'
  ).length;
  const late = events.filter((e) => e.status === 'late').length;
  const noShows = events.filter((e) => e.status === 'no_show').length;
  const overtimeHours = computeOvertimeHours(events);

  return { onTime, late, noShows, overtimeHours };
}

function formatHours(hours: number): string {
  if (hours === 0) return '0h';
  return `${hours % 1 === 0 ? hours.toFixed(0) : hours.toFixed(1)}h`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AttendanceStatsRow() {
  const { data: events } = useQuery({
    queryKey: ['attendance-today'],
    queryFn: () => getAttendanceEvents(),
    refetchInterval: 30000,
  });

  const stats = computeStats(events ?? []);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 14,
        marginBottom: 14,
      }}
    >
      <StatTile
        label="On time"
        value={String(stats.onTime)}
        Icon={CheckCircle2}
        iconColor="var(--filled-dot)"
      />
      <StatTile
        label="Late arrivals"
        value={String(stats.late)}
        Icon={Clock}
        iconColor="var(--open-dot)"
      />
      <StatTile
        label="No-shows"
        value={String(stats.noShows)}
        Icon={XCircle}
        iconColor="var(--conflict-dot)"
      />
      <StatTile
        label="Overtime"
        value={formatHours(stats.overtimeHours)}
        Icon={TrendingUp}
        iconColor="var(--accent)"
      />
    </div>
  );
}

// ─── Stat Tile ────────────────────────────────────────────────────────────────

function StatTile({
  label,
  value,
  Icon,
  iconColor,
}: {
  label: string;
  value: string;
  Icon: React.ComponentType<{ size?: number; color?: string }>;
  iconColor: string;
}) {
  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: 18,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        position: 'relative',
      }}
    >
      <div className="flex items-center justify-between">
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
          }}
        >
          {label}
        </span>
        <Icon size={16} color={iconColor} />
      </div>
      <span
        style={{
          fontSize: 30,
          fontWeight: 600,
          lineHeight: 1,
          color: 'var(--text)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </span>
    </div>
  );
}
