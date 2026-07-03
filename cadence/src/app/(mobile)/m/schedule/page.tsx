'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { getShifts } from '@/services/shifts.service';
import { getEmployeeAttendance } from '@/services/attendance.service';
import { getRoleById, getLocationById } from '@/services/employees.service';
import { formatTimeRange, addDays, format, isSameDay, parseISO } from '@/lib/date';
import { CURRENT_EMPLOYEE_ID, MOCK_TODAY_ISO } from '@/components/mobile/current-employee';
import type { Shift } from '@/types';

const DAYS_AHEAD = 14;
const STATUS_BORDER: Record<string, string> = {
  filled: 'var(--filled-dot)',
  open: 'var(--open-dot)',
  conflict: 'var(--conflict-dot)',
  draft: 'var(--draft-dot)',
};

function ShiftCard({ shift, onClockedIn }: { shift: Shift; onClockedIn: boolean }) {
  const role = getRoleById(shift.roleId);
  const location = getLocationById(shift.locationId);

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderLeft: `3px solid ${STATUS_BORDER[shift.status] ?? 'var(--border-strong)'}`,
        borderRadius: 'var(--radius)',
        padding: '12px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      <div
        style={{
          fontSize: 14,
          fontWeight: 600,
          fontFamily: 'var(--font-mono)',
          color: 'var(--text)',
        }}
      >
        {formatTimeRange(shift.startTime, shift.endTime)}
      </div>
      <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{role?.name ?? 'Shift'}</div>
      <div className="flex items-center gap-1" style={{ fontSize: 12, color: 'var(--text-dim)' }}>
        <MapPin size={12} />
        {location?.name ?? 'Location TBD'}
      </div>

      {shift.status === 'filled' && (
        <div style={{ marginTop: 4 }}>
          {onClockedIn ? (
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--filled-text)',
                background: 'var(--filled-bg)',
                borderRadius: 'var(--radius-sm)',
                padding: '4px 10px',
              }}
            >
              Clocked in
            </span>
          ) : (
            <button
              onClick={() => toast.info('Picking a coworker to swap with is coming soon — ask your manager for now')}
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: 'var(--text-muted)',
                background: 'transparent',
                border: '1px solid var(--border-strong)',
                borderRadius: 'var(--radius-sm)',
                padding: '6px 12px',
                cursor: 'pointer',
              }}
            >
              Request swap
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function MobileSchedulePage() {
  const today = useMemo(() => parseISO(MOCK_TODAY_ISO), []);
  const [selectedDate, setSelectedDate] = useState(MOCK_TODAY_ISO);

  const dateRange = useMemo(() => {
    const start = MOCK_TODAY_ISO;
    const end = format(addDays(today, DAYS_AHEAD), 'yyyy-MM-dd');
    return { start, end };
  }, [today]);

  const { data: shifts } = useQuery({
    queryKey: ['mobile', 'shifts', CURRENT_EMPLOYEE_ID, dateRange.start, dateRange.end],
    queryFn: () => getShifts({ employeeId: CURRENT_EMPLOYEE_ID, dateRange }),
  });

  const { data: attendance } = useQuery({
    queryKey: ['mobile', 'attendance', CURRENT_EMPLOYEE_ID],
    queryFn: () => getEmployeeAttendance(CURRENT_EMPLOYEE_ID),
  });

  const days = useMemo(
    () => Array.from({ length: DAYS_AHEAD }, (_, i) => addDays(today, i)),
    [today]
  );

  const shiftsByDate = useMemo(() => {
    const map = new Map<string, Shift[]>();
    (shifts ?? []).forEach((s) => {
      const list = map.get(s.date) ?? [];
      list.push(s);
      map.set(s.date, list);
    });
    return map;
  }, [shifts]);

  const hasClockedInToday = attendance?.some((a) => {
    const todayShift = shiftsByDate.get(MOCK_TODAY_ISO)?.[0];
    return todayShift && a.shiftId === todayShift.id && a.clockIn;
  });

  const todayHasUnclockedShift = Boolean(shiftsByDate.get(MOCK_TODAY_ISO)?.length) && !hasClockedInToday;

  function dayLabel(date: Date) {
    if (isSameDay(date, today)) return 'Today';
    if (isSameDay(date, addDays(today, 1))) return 'Tomorrow';
    return format(date, 'EEEE, MMM d');
  }

  return (
    <div style={{ padding: '20px 16px 0' }}>
      <h1
        style={{
          fontSize: 22,
          fontWeight: 600,
          letterSpacing: '-0.02em',
          color: 'var(--text)',
          margin: '0 0 16px',
        }}
      >
        My schedule
      </h1>

      {/* ── Date pills row ── */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          paddingBottom: 4,
          marginBottom: 20,
          marginInline: -16,
          paddingInline: 16,
        }}
      >
        {days.map((date) => {
          const dateKey = format(date, 'yyyy-MM-dd');
          const isToday = isSameDay(date, today);
          const isSelected = dateKey === selectedDate;
          return (
            <button
              key={dateKey}
              onClick={() => setSelectedDate(dateKey)}
              style={{
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                width: 48,
                height: 60,
                borderRadius: 'var(--radius)',
                border: isSelected ? 'none' : '1px solid var(--border)',
                background: isToday ? 'var(--accent)' : isSelected ? 'var(--accent-soft)' : 'var(--surface)',
                color: isToday ? '#FFFFFF' : isSelected ? 'var(--accent-text)' : 'var(--text-muted)',
              }}
            >
              <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase' }}>
                {format(date, 'EEE')}
              </span>
              <span style={{ fontSize: 15, fontWeight: 600 }}>{format(date, 'd')}</span>
            </button>
          );
        })}
      </div>

      {/* ── Grouped day list ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {days.map((date) => {
          const dateKey = format(date, 'yyyy-MM-dd');
          const dayShifts = shiftsByDate.get(dateKey) ?? [];
          return (
            <div key={dateKey}>
              <h3
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  marginBottom: 8,
                }}
              >
                {dayLabel(date)}
              </h3>
              {dayShifts.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {dayShifts.map((shift) => (
                    <ShiftCard key={shift.id} shift={shift} onClockedIn={Boolean(hasClockedInToday)} />
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: 13, color: 'var(--text-dim)', padding: '4px 0' }}>
                  No shifts scheduled
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── FAB ── */}
      {todayHasUnclockedShift && (
        <a
          href="/m/clock"
          aria-label="Clock in"
          style={{
            position: 'fixed',
            right: 'max(16px, calc(50% - 240px + 16px))',
            bottom: 'calc(64px + env(safe-area-inset-bottom, 0px) + 16px)',
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'var(--accent)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 30,
            textDecoration: 'none',
          }}
        >
          <Clock size={22} />
        </a>
      )}
    </div>
  );
}
