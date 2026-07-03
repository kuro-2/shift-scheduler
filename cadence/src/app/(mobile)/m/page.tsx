'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bell, MapPin, AlertTriangle, CalendarCheck, ArrowLeftRight } from 'lucide-react';
import { getShifts } from '@/services/shifts.service';
import { getEmployeeAttendance } from '@/services/attendance.service';
import { getRoleById, getLocationById } from '@/services/employees.service';
import { formatTime, formatTimeRange } from '@/lib/date';
import { CURRENT_EMPLOYEE_ID, CURRENT_EMPLOYEE_FIRST_NAME, MOCK_TODAY_ISO } from '@/components/mobile/current-employee';
import { useUIStore } from '@/store/ui.store';
import { NotificationsDrawer } from '@/components/app-shell/NotificationsDrawer';

// ─── Needs attention (static, employee-relevant) ───────────────────────────────

interface AttentionItem {
  id: string;
  icon: React.ReactNode;
  iconBg: string;
  iconText: string;
  title: string;
  sub: string;
}

const ATTENTION_ITEMS: AttentionItem[] = [
  {
    id: 'swap-approved',
    icon: <ArrowLeftRight size={16} />,
    iconBg: 'var(--filled-bg)',
    iconText: 'var(--filled-text)',
    title: 'Your swap request was approved',
    sub: 'Devon Lee will cover your Thursday shift',
  },
  {
    id: 'new-shift',
    icon: <CalendarCheck size={16} />,
    iconBg: 'var(--pending-bg)',
    iconText: 'var(--pending-text)',
    title: 'New shift assigned for Friday',
    sub: '08:00 – 16:30 · Operations Associate',
  },
  {
    id: 'late-note',
    icon: <AlertTriangle size={16} />,
    iconBg: 'var(--open-bg)',
    iconText: 'var(--open-text)',
    title: 'Heads up — late arrival logged today',
    sub: 'Clocked in 34 min after your scheduled start',
  },
];

// ─── Live elapsed timer ─────────────────────────────────────────────────────────

function useElapsed(sinceIso?: string) {
  const [elapsed, setElapsed] = useState('0:00:00');

  useEffect(() => {
    if (!sinceIso) return;
    const since = new Date(sinceIso).getTime();

    function tick() {
      const diffSec = Math.max(0, Math.floor((Date.now() - since) / 1000));
      const h = Math.floor(diffSec / 3600);
      const m = Math.floor((diffSec % 3600) / 60);
      const s = diffSec % 60;
      setElapsed(`${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    }

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [sinceIso]);

  return elapsed;
}

// ─── Page ────────────────────────────────────────────────────────────────────────

export default function MobileTodayPage() {
  const setNotificationsOpen = useUIStore((s) => s.setNotificationsOpen);

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

  const todayShift = shifts?.[0];
  const activeAttendance = attendance?.find(
    (a) => a.shiftId === todayShift?.id && a.clockIn && !a.clockOut
  );
  const isClockedIn = Boolean(activeAttendance);
  const elapsed = useElapsed(activeAttendance?.clockIn);

  const role = todayShift ? getRoleById(todayShift.roleId) : undefined;
  const location = todayShift ? getLocationById(todayShift.locationId) : undefined;

  const now = new Date();
  const dateLabel = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div style={{ padding: '20px 16px 0' }}>
      {/* ── Header ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 20,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: 'var(--text)',
              margin: 0,
              lineHeight: 1.25,
            }}
          >
            Good morning, {CURRENT_EMPLOYEE_FIRST_NAME}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{dateLabel}</p>
        </div>
        <button
          aria-label="Notifications"
          onClick={() => setNotificationsOpen(true)}
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
            flexShrink: 0,
          }}
        >
          <Bell size={16} />
        </button>
      </div>

      {/* ── Live status hero card ── */}
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: 18,
          marginBottom: 18,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <div className="flex items-center gap-2">
          <span
            className={isClockedIn ? 'animate-pulse-live' : undefined}
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: isClockedIn ? 'var(--filled-dot)' : 'var(--text-dim)',
              boxShadow: isClockedIn ? '0 0 0 3px rgba(90,155,110,0.25)' : 'none',
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
            {isClockedIn ? 'Live · On shift' : 'Today'}
          </span>
        </div>

        {todayShift ? (
          isClockedIn ? (
            <div>
              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>
                You clocked in at {formatTime(activeAttendance!.clockIn!.slice(11, 16))}
              </div>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 600,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text)',
                  marginTop: 6,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {elapsed}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>
                elapsed time
              </div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>
                You&apos;re scheduled {formatTimeRange(todayShift.startTime, todayShift.endTime)} today
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                {role?.name ?? 'Shift'} · {location?.name ?? 'Location TBD'}
              </div>
            </div>
          )
        ) : (
          <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-muted)' }}>
            No shift scheduled today — enjoy your day off.
          </div>
        )}

        {todayShift && (
          <a
            href="/m/clock"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              fontSize: 13,
              fontWeight: 600,
              color: '#FFFFFF',
              background: 'linear-gradient(135deg, var(--accent), #6D63F5)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 14px',
              textDecoration: 'none',
            }}
          >
            {isClockedIn ? 'Go to clock out' : 'Go to clock in'}
          </a>
        )}
      </div>

      {/* ── Needs attention ── */}
      <div style={{ marginBottom: 18 }}>
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
          Needs attention
        </h2>
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            overflow: 'hidden',
          }}
        >
          {ATTENTION_ITEMS.map((item, i) => (
            <div
              key={item.id}
              className="flex items-start gap-3"
              style={{
                padding: '12px 14px',
                borderTop: i === 0 ? 'none' : '1px solid var(--border)',
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 'var(--radius-sm)',
                  background: item.iconBg,
                  color: item.iconText,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {item.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', lineHeight: 1.4 }}>
                  {item.title}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2, lineHeight: 1.4 }}>
                  {item.sub}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Today's shifts ── */}
      <div style={{ marginBottom: 18 }}>
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
          Today&apos;s shifts
        </h2>

        {shifts && shifts.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {shifts.map((shift) => {
              const r = getRoleById(shift.roleId);
              const l = getLocationById(shift.locationId);
              return (
                <div
                  key={shift.id}
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderLeft: '3px solid var(--filled-dot)',
                    borderRadius: 'var(--radius)',
                    padding: '12px 14px',
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
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                    {r?.name ?? 'Shift'}
                  </div>
                  <div
                    className="flex items-center gap-1"
                    style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}
                  >
                    <MapPin size={12} />
                    {l?.name ?? 'Location TBD'}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '20px 14px',
              textAlign: 'center',
              fontSize: 13,
              color: 'var(--text-dim)',
            }}
          >
            No shifts scheduled today
          </div>
        )}
      </div>

      <NotificationsDrawer />
    </div>
  );
}
