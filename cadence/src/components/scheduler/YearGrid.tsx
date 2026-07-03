'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { endOfYear, format } from 'date-fns';
import { getShifts } from '@/services/shifts.service';
import { getEmployees } from '@/services/employees.service';
import { getYearMonths, getYearStart, formatISODate, today } from '@/lib/date';
import { netHours, formatMoney } from '@/lib/payroll';
import { ScheduleErrorState } from './ScheduleErrorState';

interface YearGridProps {
  anchorDate: string;
  departmentId?: string | null;
  onSelectMonth: (dateStr: string) => void;
}

export function YearGrid({ anchorDate, departmentId, onSelectMonth }: YearGridProps) {
  const months = useMemo(() => getYearMonths(anchorDate), [anchorDate]);
  const yearStart = useMemo(() => getYearStart(anchorDate), [anchorDate]);
  const dateFrom = formatISODate(yearStart);
  const dateTo = formatISODate(endOfYear(yearStart));
  const currentMonthKey = today().slice(0, 7);

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

  // Per-month: shift count, net hours, labor cost
  const byMonth = useMemo(() => {
    const map = new Map<string, { count: number; hours: number; cost: number }>();
    for (const shift of shifts ?? []) {
      const key = shift.date.slice(0, 7); // YYYY-MM
      const prev = map.get(key) ?? { count: 0, hours: 0, cost: 0 };
      const hours = netHours(shift);
      const cost = shift.employeeId ? hours * (rateByEmployeeId.get(shift.employeeId) ?? 0) : 0;
      map.set(key, { count: prev.count + 1, hours: prev.hours + hours, cost: prev.cost + cost });
    }
    return map;
  }, [shifts, rateByEmployeeId]);

  const yearTotals = useMemo(() => {
    let hours = 0;
    let cost = 0;
    let count = 0;
    for (const stats of byMonth.values()) {
      hours += stats.hours;
      cost += stats.cost;
      count += stats.count;
    }
    return { hours, cost, count };
  }, [byMonth]);

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
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: 12,
            }}
          >
            {months.map((month) => {
              const monthKey = formatISODate(month).slice(0, 7);
              const stats = byMonth.get(monthKey);
              const isCurrentMonth = monthKey === currentMonthKey;

              return (
                <button
                  key={monthKey}
                  onClick={() => onSelectMonth(formatISODate(month))}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    padding: 16,
                    borderRadius: 'var(--radius-sm)',
                    border: isCurrentMonth ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                    background: isCurrentMonth ? 'var(--accent-soft)' : 'var(--surface)',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: isCurrentMonth ? 'var(--accent-text)' : 'var(--text)',
                    }}
                  >
                    {format(month, 'MMMM')}
                  </span>
                  {stats && stats.count > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {stats.count} shift{stats.count === 1 ? '' : 's'} · {stats.hours.toFixed(0)}h
                      </span>
                      <span
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: 'var(--filled-text)',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {formatMoney(stats.cost)}
                      </span>
                    </div>
                  ) : (
                    <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>No shifts scheduled</span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Year summary bar ── */}
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
          {yearTotals.count} shift{yearTotals.count === 1 ? '' : 's'}
        </span>
        <span>{yearTotals.hours.toFixed(0)}h scheduled</span>
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: 12, color: 'var(--text)', fontWeight: 600 }}>
          Total payroll · {formatMoney(yearTotals.cost)}
        </span>
      </div>
    </div>
  );
}
