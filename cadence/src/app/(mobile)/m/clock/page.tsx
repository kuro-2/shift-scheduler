'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { MapPin, Clock as ClockIcon, ChevronLeft } from 'lucide-react';
import { getShifts } from '@/services/shifts.service';
import { getEmployeeAttendance } from '@/services/attendance.service';
import { getRoleById, getLocationById } from '@/services/employees.service';
import { formatTimeRange } from '@/lib/date';
import { CURRENT_EMPLOYEE_ID, MOCK_TODAY_ISO } from '@/components/mobile/current-employee';
import { StatusPill } from '@/components/common/StatusPill';

// ─── Mock recent history (last 3 days) ─────────────────────────────────────────

const HISTORY = [
  { date: 'Fri, Jun 26', clockIn: '8:01 AM', clockOut: '4:32 PM', status: 'on_time' as const },
  { date: 'Thu, Jun 25', clockIn: '8:05 AM', clockOut: '4:30 PM', status: 'on_time' as const },
  { date: 'Wed, Jun 24', clockIn: '8:22 AM', clockOut: '4:31 PM', status: 'late' as const },
];

function useClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return now;
}

export default function MobileClockPage() {
  const now = useClock();
  const [inRange] = useState(true);
  const [clockedIn, setClockedIn] = useState(false);
  const [clockedInAt, setClockedInAt] = useState<Date | null>(null);

  const { data: shifts } = useQuery({
    queryKey: ['mobile', 'shifts', CURRENT_EMPLOYEE_ID, MOCK_TODAY_ISO],
    queryFn: () =>
      getShifts({
        employeeId: CURRENT_EMPLOYEE_ID,
        dateRange: { start: MOCK_TODAY_ISO, end: MOCK_TODAY_ISO },
      }),
  });

  const { data: attendance } = useQuery({
    queryKey: ['mobile', 'attendance', CURRENT_EMPLOYEE_ID],
    queryFn: () => getEmployeeAttendance(CURRENT_EMPLOYEE_ID),
  });

  const nextShift = shifts?.[0];
  const role = nextShift ? getRoleById(nextShift.roleId) : undefined;
  const location = nextShift ? getLocationById(nextShift.locationId) : undefined;

  // Seed reality: emp_005 (Sam Reyes) is already clocked in today (late arrival, att_005).
  const seededActive = attendance?.find((a) => a.shiftId === nextShift?.id && a.clockIn && !a.clockOut);

  useEffect(() => {
    if (seededActive?.clockIn) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing local toggle state from async seed data once it resolves
      setClockedIn(true);
      setClockedInAt(new Date(seededActive.clockIn));
    }
    // Only run once when seed data first resolves.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Boolean(seededActive)]);

  const timeString = useMemo(() => {
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    return `${h}:${m}:${s}`;
  }, [now]);

  function handleToggleClock() {
    const eventTime = new Date();
    const timeLabel = eventTime.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });

    if (clockedIn) {
      setClockedIn(false);
      setClockedInAt(null);
      toast.success(`Clocked out at ${timeLabel}`);
    } else {
      setClockedIn(true);
      setClockedInAt(eventTime);
      toast.success(`Clocked in at ${timeLabel}`);
    }
  }

  return (
    <div style={{ padding: '20px 16px 0' }}>
      {/* ── Header ── */}
      <div className="flex items-center gap-2" style={{ marginBottom: 24 }}>
        <a
          href="/m"
          aria-label="Back"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 32,
            height: 32,
            color: 'var(--text-muted)',
          }}
        >
          <ChevronLeft size={20} />
        </a>
        <h1
          style={{
            fontSize: 20,
            fontWeight: 600,
            letterSpacing: '-0.02em',
            color: 'var(--text)',
            margin: 0,
          }}
        >
          Clock in
        </h1>
      </div>

      {/* ── Current time ── */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div
          style={{
            fontSize: 48,
            fontWeight: 600,
            fontFamily: 'var(--font-mono)',
            color: 'var(--text)',
            letterSpacing: '-0.02em',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {timeString}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
          {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* ── GPS status pill ── */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            paddingInline: 12,
            paddingBlock: 6,
            borderRadius: 99,
            background: inRange ? 'var(--filled-bg)' : 'var(--conflict-bg)',
            color: inRange ? 'var(--filled-text)' : 'var(--conflict-text)',
            fontSize: 12,
            fontWeight: 500,
          }}
        >
          <MapPin size={13} />
          {inRange ? 'At Main Store · within range' : 'Outside geofence range'}
        </span>
      </div>

      {/* ── Next shift card ── */}
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '14px 16px',
          marginBottom: 20,
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'var(--text-dim)',
            marginBottom: 8,
          }}
        >
          {clockedIn ? 'Current shift' : 'Next shift'}
        </div>
        {nextShift ? (
          <>
            <div
              style={{
                fontSize: 15,
                fontWeight: 600,
                fontFamily: 'var(--font-mono)',
                color: 'var(--text)',
              }}
            >
              {formatTimeRange(nextShift.startTime, nextShift.endTime)}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
              {role?.name ?? 'Shift'}
            </div>
            <div className="flex items-center gap-1" style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>
              <MapPin size={12} />
              {location?.name ?? 'Location TBD'}
            </div>
          </>
        ) : (
          <div style={{ fontSize: 13, color: 'var(--text-dim)' }}>No shift scheduled today</div>
        )}
      </div>

      {/* ── Big CTA ── */}
      <button
        onClick={handleToggleClock}
        style={{
          width: '100%',
          height: 100,
          borderRadius: 20,
          border: 'none',
          background: clockedIn
            ? 'linear-gradient(135deg, var(--conflict-dot), #C76054)'
            : 'linear-gradient(135deg, var(--accent), #6D63F5)',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          fontSize: 20,
          fontWeight: 600,
          marginBottom: 24,
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <ClockIcon size={26} />
        {clockedIn ? 'Clock out' : 'Clock in'}
      </button>

      {clockedInAt && clockedIn && (
        <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-dim)', marginTop: -16, marginBottom: 24 }}>
          Clocked in at{' '}
          {clockedInAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
        </div>
      )}

      {/* ── History ── */}
      <div>
        <h2
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            marginBottom: 10,
          }}
        >
          Last 3 days
        </h2>
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            overflow: 'hidden',
          }}
        >
          {HISTORY.map((entry, i) => (
            <div
              key={entry.date}
              className="flex items-center gap-3"
              style={{
                padding: '12px 14px',
                borderTop: i === 0 ? 'none' : '1px solid var(--border)',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>
                  {entry.date}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: 'var(--text-dim)',
                    marginTop: 2,
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {entry.clockIn} – {entry.clockOut}
                </div>
              </div>
              <StatusPill status={entry.status} size="sm" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
