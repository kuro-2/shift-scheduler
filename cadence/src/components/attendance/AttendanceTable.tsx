'use client';

import { useQuery } from '@tanstack/react-query';
import { MapPin } from 'lucide-react';
import { getAttendanceEvents } from '@/services/attendance.service';
import { getEmployeeById, getLocationById } from '@/services/employees.service';
import { getShiftById } from '@/services/shifts.service';
import { Avatar } from '@/components/common/Avatar';
import { StatusPill } from '@/components/common/StatusPill';
import type { AttendanceEvent, AttendanceStatus } from '@/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatClockTime(iso?: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

type PillStatus =
  | 'on_time'
  | 'late'
  | 'no_show'
  | 'on_shift'
  | 'on_break'
  | 'complete'
  | 'sick';

const STATUS_PILL_MAP: Record<AttendanceStatus, PillStatus> = {
  on_time: 'on_time',
  late: 'late',
  early: 'on_time',
  no_show: 'no_show',
  on_shift: 'on_shift',
  on_break: 'on_break',
  complete: 'complete',
  sick: 'sick',
};

const TODAY_LABEL = new Date('2026-06-29T00:00:00').toLocaleDateString('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
});

// ─── Row ──────────────────────────────────────────────────────────────────────

function AttendanceRow({ event }: { event: AttendanceEvent }) {
  const employee = getEmployeeById(event.employeeId);
  const shift = getShiftById(event.shiftId);
  const location = event.locationId ? getLocationById(event.locationId) : undefined;

  const isLate = event.status === 'late';

  return (
    <tr style={{ borderBottom: '1px solid var(--border)' }}>
      {/* Employee */}
      <td style={{ padding: '12px 16px' }}>
        <div className="flex items-center gap-2">
          {employee ? (
            <>
              <Avatar initials={employee.initials} color={employee.avatarColor} size={28} />
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>
                {employee.name}
              </span>
            </>
          ) : (
            <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>Unknown employee</span>
          )}
        </div>
      </td>

      {/* Scheduled */}
      <td style={{ padding: '12px 16px' }}>
        <span
          style={{
            fontSize: 13,
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)',
            whiteSpace: 'nowrap',
          }}
        >
          {shift ? `${shift.startTime} – ${shift.endTime}` : '—'}
        </span>
      </td>

      {/* Clock in */}
      <td style={{ padding: '12px 16px' }}>
        <span
          style={{
            fontSize: 13,
            fontFamily: 'var(--font-mono)',
            color: isLate ? 'var(--open-text)' : 'var(--text)',
            fontWeight: isLate ? 600 : 400,
            whiteSpace: 'nowrap',
          }}
        >
          {formatClockTime(event.clockIn)}
        </span>
      </td>

      {/* Clock out */}
      <td style={{ padding: '12px 16px' }}>
        <span
          style={{
            fontSize: 13,
            fontFamily: 'var(--font-mono)',
            color: 'var(--text)',
            whiteSpace: 'nowrap',
          }}
        >
          {formatClockTime(event.clockOut)}
        </span>
      </td>

      {/* Location */}
      <td style={{ padding: '12px 16px' }}>
        {event.gpsVerified && location ? (
          <div className="flex items-center gap-1.5">
            <MapPin size={13} color="var(--text-dim)" />
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{location.name}</span>
          </div>
        ) : (
          <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>—</span>
        )}
      </td>

      {/* Status */}
      <td style={{ padding: '12px 16px' }}>
        <StatusPill status={STATUS_PILL_MAP[event.status]} size="sm" />
      </td>
    </tr>
  );
}

// ─── Table ────────────────────────────────────────────────────────────────────

const COLUMNS = ['Employee', 'Scheduled', 'Clock in', 'Clock out', 'Location', 'Status'];

export function AttendanceTable() {
  const { data: events, isFetching } = useQuery({
    queryKey: ['attendance-today'],
    queryFn: () => getAttendanceEvents(),
    refetchInterval: 30000,
  });

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
      }}
    >
      {/* Header bar */}
      <div
        className="flex items-center justify-between"
        style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-3">
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
            Today&apos;s clock-ins
          </span>
          <div className="flex items-center gap-1.5">
            <span
              className="animate-pulse-live"
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: '#5A9B6E',
                boxShadow: '0 0 0 3px rgba(90,155,110,0.25)',
                flexShrink: 0,
                display: 'block',
              }}
            />
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
              }}
            >
              Live
            </span>
          </div>
          {isFetching && (
            <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>Refreshing…</span>
          )}
        </div>

        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{TODAY_LABEL}</span>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: 'var(--surface-2)' }}>
            <tr>
              {COLUMNS.map((col) => (
                <th
                  key={col}
                  style={{
                    textAlign: 'left',
                    padding: '10px 16px',
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    color: 'var(--text-muted)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(events ?? []).map((event) => (
              <AttendanceRow key={event.id} event={event} />
            ))}
          </tbody>
        </table>

        {events && events.length === 0 && (
          <div
            style={{
              padding: '32px 16px',
              textAlign: 'center',
              fontSize: 13,
              color: 'var(--text-dim)',
            }}
          >
            No attendance records yet today.
          </div>
        )}
      </div>
    </div>
  );
}
