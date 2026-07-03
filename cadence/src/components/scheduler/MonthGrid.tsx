'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getShifts } from '@/services/shifts.service';
import { getEmployees } from '@/services/employees.service';
import { getMonthGridDays, isInMonth, formatISODate, today } from '@/lib/date';
import { netHours, formatMoney } from '@/lib/payroll';
import { format } from 'date-fns';
import { ScheduleErrorState } from './ScheduleErrorState';

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface MonthGridProps {
  anchorDate: string;
  departmentId?: string | null;
  onSelectDay: (dateStr: string) => void;
}

export function MonthGrid({ anchorDate, departmentId, onSelectDay }: MonthGridProps) {
  const gridDays = useMemo(() => getMonthGridDays(anchorDate), [anchorDate]);
  const todayStr = today();

  const dateFrom = formatISODate(gridDays[0]);
  const dateTo = formatISODate(gridDays[gridDays.length - 1]);

  const { data: shifts, isLoading: shiftsLoading, isError: shiftsError, error: shiftsErrorObj } = useQuery({
    queryKey: ['shifts', dateFrom, dateTo, departmentId ?? null],
    queryFn: () =>
      getShifts({ dateRange: { start: dateFrom, end: dateTo }, departmentId: departmentId ?? undefined }),
  });

  const { data: employees, isLoading: empLoading, isError: empError, error: empErrorObj } = useQuery({
    queryKey: ['employees'],
    queryFn: () => getEmployees(),
  });

  const rateByEmployeeId = useMemo(
    () => new Map((employees ?? []).map((e) => [e.id, e.hourlyRate ?? 0])),
    [employees]
  );

  // Per-day: shift count, net hours, labor cost
  const byDate = useMemo(() => {
    const map = new Map<string, { count: number; hours: number; cost: number }>();
    for (const shift of shifts ?? []) {
      const prev = map.get(shift.date) ?? { count: 0, hours: 0, cost: 0 };
      const hours = netHours(shift);
      const cost = shift.employeeId ? hours * (rateByEmployeeId.get(shift.employeeId) ?? 0) : 0;
      map.set(shift.date, { count: prev.count + 1, hours: prev.hours + hours, cost: prev.cost + cost });
    }
    return map;
  }, [shifts, rateByEmployeeId]);

  // Month-only totals (excludes padding days from adjacent months)
  const monthTotals = useMemo(() => {
    let hours = 0;
    let cost = 0;
    let count = 0;
    for (const day of gridDays) {
      if (!isInMonth(day, anchorDate)) continue;
      const stats = byDate.get(formatISODate(day));
      if (!stats) continue;
      hours += stats.hours;
      cost += stats.cost;
      count += stats.count;
    }
    return { hours, cost, count };
  }, [gridDays, anchorDate, byDate]);

  const isLoading = shiftsLoading || empLoading;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {isLoading ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 200,
              color: 'var(--text-dim)',
              fontSize: 14,
            }}
          >
            Loading schedule…
          </div>
        ) : shiftsError || empError ? (
          <ScheduleErrorState error={shiftsErrorObj ?? empErrorObj} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {/* Weekday header */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, marginBottom: 4 }}>
              {WEEKDAY_LABELS.map((label) => (
                <div
                  key={label}
                  style={{
                    textAlign: 'center',
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'var(--text-dim)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    padding: '4px 0',
                  }}
                >
                  {label}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gridAutoRows: 108,
                gap: 1,
                background: 'var(--border)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
              }}
            >
              {gridDays.map((day) => {
                const dateStr = formatISODate(day);
                const inMonth = isInMonth(day, anchorDate);
                const isToday = dateStr === todayStr;
                const stats = byDate.get(dateStr);

                return (
                  <button
                    key={dateStr}
                    onClick={() => onSelectDay(dateStr)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      gap: 4,
                      padding: 8,
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      background: isToday ? 'var(--accent-soft)' : 'var(--surface)',
                      opacity: inMonth ? 1 : 0.45,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: isToday ? 'var(--accent)' : 'var(--text)',
                      }}
                    >
                      {format(day, 'd')}
                    </span>
                    {stats && stats.count > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 500,
                            color: 'var(--text-muted)',
                            fontFamily: 'var(--font-mono)',
                          }}
                        >
                          {stats.count} shift{stats.count === 1 ? '' : 's'}
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: 'var(--filled-text)',
                            fontFamily: 'var(--font-mono)',
                          }}
                        >
                          {formatMoney(stats.cost)}
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Month summary bar ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          height: 36,
          borderTop: '1px solid var(--border)',
          background: 'var(--surface)',
          flexShrink: 0,
          gap: 16,
          fontSize: 12,
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
        }}
      >
        <span>
          {monthTotals.count} shift{monthTotals.count === 1 ? '' : 's'}
        </span>
        <span>{monthTotals.hours.toFixed(1)}h scheduled</span>
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: 12, color: 'var(--text)', fontWeight: 600 }}>
          Total payroll · {formatMoney(monthTotals.cost)}
        </span>
      </div>
    </div>
  );
}
