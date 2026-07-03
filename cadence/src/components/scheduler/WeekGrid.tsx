'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Plus } from 'lucide-react';
import { getShifts } from '@/services/shifts.service';
import { getEmployees, getRoleById } from '@/services/employees.service';
import { useUIStore } from '@/store/ui.store';
import { useAuthStore } from '@/store/auth.store';
import { formatISODate, today } from '@/lib/date';
import { netHours, formatMoney } from '@/lib/payroll';
import { format } from 'date-fns';
import { ScheduleErrorState } from './ScheduleErrorState';
import type { Shift, ShiftStatus } from '@/types';

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_VARS = {
  filled: {
    bg: 'var(--filled-bg)',
    text: 'var(--filled-text)',
    dot: 'var(--filled-dot)',
    border: 'var(--filled-border)',
  },
  open: {
    bg: 'var(--open-bg)',
    text: 'var(--open-text)',
    dot: 'var(--open-dot)',
    border: 'var(--open-border)',
  },
  conflict: {
    bg: 'var(--conflict-bg)',
    text: 'var(--conflict-text)',
    dot: 'var(--conflict-dot)',
    border: 'var(--conflict-border)',
  },
  draft: {
    bg: 'var(--draft-bg)',
    text: 'var(--draft-text)',
    dot: 'var(--draft-dot)',
    border: 'var(--draft-border)',
  },
};

// ─── Shift Card ───────────────────────────────────────────────────────────────

function ShiftCard({ shift, onClick }: { shift: Shift; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  const cfg = STATUS_VARS[shift.status as ShiftStatus] ?? STATUS_VARS.draft;
  const role = getRoleById(shift.roleId);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'block',
        width: '100%',
        textAlign: 'left',
        background: cfg.bg,
        color: cfg.text,
        border: `1px solid ${cfg.border}`,
        borderLeft: `3px solid ${cfg.dot}`,
        borderRadius: 'var(--radius-sm)',
        padding: '5px 7px',
        height: 'var(--shift-h)',
        cursor: 'pointer',
        overflow: 'hidden',
        transform: hovered ? 'translateY(-1px)' : 'translateY(0)',
        boxShadow: hovered ? 'var(--shadow-sm)' : 'none',
        transition: 'transform 0.1s ease, box-shadow 0.1s ease',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          marginBottom: 2,
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            fontFamily: 'var(--font-mono)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            flex: 1,
          }}
        >
          {shift.startTime}–{shift.endTime}
        </span>
        {shift.warning && (
          <AlertTriangle size={10} style={{ flexShrink: 0, opacity: 0.85 }} />
        )}
      </div>
      <div
        style={{
          fontSize: 10,
          opacity: 0.85,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {role?.name ?? shift.roleId}
      </div>
    </button>
  );
}

// ─── Open Shift Card ──────────────────────────────────────────────────────────

function OpenShiftCard({ shift, onClick }: { shift: Shift; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  const role = getRoleById(shift.roleId);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'block',
        width: '100%',
        textAlign: 'left',
        background: 'var(--open-bg)',
        color: 'var(--open-text)',
        border: '1px solid var(--open-border)',
        borderLeft: '3px solid var(--open-dot)',
        borderRadius: 'var(--radius-sm)',
        padding: '5px 7px',
        height: 'var(--shift-h)',
        cursor: 'pointer',
        overflow: 'hidden',
        transform: hovered ? 'translateY(-1px)' : 'translateY(0)',
        boxShadow: hovered ? 'var(--shadow-sm)' : 'none',
        transition: 'transform 0.1s ease, box-shadow 0.1s ease',
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-mono)', marginBottom: 2 }}>
        {shift.startTime}–{shift.endTime}
      </div>
      <div style={{ fontSize: 10, opacity: 0.85 }}>{role?.name ?? 'Open'}</div>
    </button>
  );
}

// ─── Empty Cell ───────────────────────────────────────────────────────────────

function EmptyCell({ onClick }: { onClick: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label="Add shift"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: 'var(--shift-h)',
        borderRadius: 'var(--radius-sm)',
        border: hovered ? '1px dashed var(--border-strong)' : '1px dashed transparent',
        background: 'transparent',
        padding: 0,
        cursor: 'pointer',
        transition: 'border 0.1s ease',
      }}
    >
      <Plus
        size={14}
        style={{
          color: 'var(--text-dim)',
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.1s ease',
        }}
      />
    </button>
  );
}

// ─── Day Header ───────────────────────────────────────────────────────────────

function DayHeader({ date, isToday }: { date: Date; isToday: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px 4px',
        background: isToday ? 'var(--accent-soft)' : 'transparent',
        borderRadius: isToday ? 'var(--radius-sm)' : 0,
        gap: 2,
      }}
    >
      <span
        style={{
          fontSize: 10,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: isToday ? 'var(--accent-text)' : 'var(--text-dim)',
        }}
      >
        {format(date, 'EEE')}
      </span>
      <span
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: isToday ? 'var(--accent)' : 'var(--text)',
        }}
      >
        {format(date, 'd')}
      </span>
    </div>
  );
}

// ─── Legend Bar ───────────────────────────────────────────────────────────────

const STATUS_LEGEND: { key: ShiftStatus; label: string; dot: string }[] = [
  { key: 'filled', label: 'Filled', dot: 'var(--filled-dot)' },
  { key: 'open', label: 'Open', dot: 'var(--open-dot)' },
  { key: 'conflict', label: 'Conflict', dot: 'var(--conflict-dot)' },
  { key: 'draft', label: 'Draft', dot: 'var(--draft-dot)' },
];

function LegendBar({
  statusCounts,
  totalPayroll,
}: {
  statusCounts: Record<ShiftStatus, number>;
  totalPayroll: number;
}) {
  return (
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
      }}
    >
      {STATUS_LEGEND.map((item) => (
        <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 2,
              background: item.dot,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: 12,
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {item.label} ·{' '}
            <strong style={{ color: 'var(--text)' }}>{statusCounts[item.key] ?? 0}</strong>
          </span>
        </div>
      ))}

      <span style={{ flex: 1 }} />

      <span
        style={{
          fontSize: 12,
          color: 'var(--text)',
          fontFamily: 'var(--font-mono)',
          fontWeight: 600,
        }}
      >
        Total payroll · {formatMoney(totalPayroll)}
      </span>
    </div>
  );
}

// ─── Week Grid ────────────────────────────────────────────────────────────────

interface WeekGridProps {
  /** The days to render as columns, left to right. */
  days: Date[];
  departmentId?: string | null;
}

export function WeekGrid({ days, departmentId }: WeekGridProps) {
  const setSelectedShiftId = useUIStore((s) => s.setSelectedShiftId);
  const setCreateShiftOpen = useUIStore((s) => s.setCreateShiftOpen);
  const setCreateShiftDefaults = useUIStore((s) => s.setCreateShiftDefaults);
  const locationId = useAuthStore((s) => s.user?.locationId);

  const weekDays = days;
  const todayStr = today();

  const dateFrom = formatISODate(weekDays[0]);
  const dateTo = formatISODate(weekDays[weekDays.length - 1]);

  const { data: shifts, isLoading: shiftsLoading, isError: shiftsError, error: shiftsErrorObj } = useQuery({
    queryKey: ['shifts', dateFrom, dateTo, departmentId ?? null, locationId ?? null],
    queryFn: () =>
      getShifts({ dateRange: { start: dateFrom, end: dateTo }, departmentId: departmentId ?? undefined, locationId }),
  });

  const { data: employees, isLoading: empLoading, isError: empError, error: empErrorObj } = useQuery({
    queryKey: ['employees', locationId ?? null],
    queryFn: () => getEmployees({ locationId }),
  });

  // Build a map: employeeId → dateStr → Shift[]
  const shiftMap = useMemo(() => {
    if (!shifts) return new Map<string, Map<string, Shift[]>>();
    const map = new Map<string, Map<string, Shift[]>>();
    for (const shift of shifts) {
      if (!shift.employeeId) continue;
      if (!map.has(shift.employeeId)) map.set(shift.employeeId, new Map());
      const dateMap = map.get(shift.employeeId)!;
      if (!dateMap.has(shift.date)) dateMap.set(shift.date, []);
      dateMap.get(shift.date)!.push(shift);
    }
    return map;
  }, [shifts]);

  // Open/unassigned shifts per date
  const openShiftsByDate = useMemo(() => {
    if (!shifts) return new Map<string, Shift[]>();
    const map = new Map<string, Shift[]>();
    for (const shift of shifts) {
      if (shift.employeeId) continue;
      if (!map.has(shift.date)) map.set(shift.date, []);
      map.get(shift.date)!.push(shift);
    }
    return map;
  }, [shifts]);

  const rateByEmployeeId = useMemo(
    () => new Map((employees ?? []).map((e) => [e.id, e.hourlyRate ?? 0])),
    [employees]
  );

  // Compute hours worked + labor cost per employee for the visible range
  const employeeStats = useMemo(() => {
    const map = new Map<string, { hours: number; cost: number }>();
    for (const shift of shifts ?? []) {
      if (!shift.employeeId) continue;
      const hours = netHours(shift);
      const cost = hours * (rateByEmployeeId.get(shift.employeeId) ?? 0);
      const prev = map.get(shift.employeeId) ?? { hours: 0, cost: 0 };
      map.set(shift.employeeId, { hours: prev.hours + hours, cost: prev.cost + cost });
    }
    return map;
  }, [shifts, rateByEmployeeId]);

  // Status counts + total labor cost across the visible range (legend / summary bar)
  const { statusCounts, totalPayroll } = useMemo(() => {
    const counts: Record<ShiftStatus, number> = { filled: 0, open: 0, conflict: 0, draft: 0 };
    let payroll = 0;
    for (const shift of shifts ?? []) {
      const status = (shift.status as ShiftStatus) ?? 'draft';
      counts[status] = (counts[status] ?? 0) + 1;
      if (shift.employeeId) {
        payroll += netHours(shift) * (rateByEmployeeId.get(shift.employeeId) ?? 0);
      }
    }
    return { statusCounts: counts, totalPayroll: payroll };
  }, [shifts, rateByEmployeeId]);

  const isLoading = shiftsLoading || empLoading;

  const activeEmployees = useMemo(
    () =>
      (employees ?? []).filter(
        (e) => e.status !== 'inactive' && (!departmentId || e.departmentId === departmentId)
      ),
    [employees, departmentId]
  );

  const PERSON_COL = 240;
  const GRID_COLS = `${PERSON_COL}px repeat(${weekDays.length}, minmax(100px, 1fr))`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      {/* Scrollable grid area */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'auto' }}>
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
              gridTemplateColumns: GRID_COLS,
              minWidth: PERSON_COL + weekDays.length * 100,
            }}
          >
            {/* ── Sticky header row ── */}
            <div
              style={{
                position: 'sticky',
                top: 0,
                left: 0,
                zIndex: 30,
                background: 'var(--surface)',
                borderRight: '1px solid var(--border)',
                borderBottom: '1px solid var(--border)',
                padding: '8px 16px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 500 }}>
                Team · {activeEmployees.length}
              </span>
            </div>

            {weekDays.map((day) => {
              const dateStr = formatISODate(day);
              const isToday = dateStr === todayStr;
              return (
                <div
                  key={dateStr}
                  style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 20,
                    background: 'var(--surface)',
                    borderBottom: '1px solid var(--border)',
                    borderRight: '1px solid var(--border)',
                    textAlign: 'center',
                  }}
                >
                  <DayHeader date={day} isToday={isToday} />
                </div>
              );
            })}

            {/* ── Employee rows ── */}
            {activeEmployees.map((emp) => {
              const role = getRoleById(emp.roleId);
              const stats = employeeStats.get(emp.id);
              const hours = stats?.hours ?? 0;
              const cost = stats?.cost ?? 0;

              return (
                <div key={emp.id} style={{ display: 'contents' }}>
                  {/* Person cell */}
                  <div
                    style={{
                      position: 'sticky',
                      left: 0,
                      zIndex: 10,
                      background: 'var(--surface)',
                      borderRight: '1px solid var(--border)',
                      borderBottom: '1px solid var(--border)',
                      height: 'var(--row-h)',
                      padding: '0 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                    }}
                  >
                    {/* Avatar */}
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: emp.avatarColor,
                        color: '#FFFFFF',
                        fontSize: 12,
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {emp.initials}
                    </div>

                    {/* Name + role */}
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 500,
                          color: 'var(--text)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {emp.name}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: 'var(--text-dim)',
                          fontFamily: 'var(--font-mono)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {role?.name ?? emp.roleId} · {hours.toFixed(1)}h · {formatMoney(cost)}
                      </div>
                    </div>
                  </div>

                  {/* Day cells */}
                  {weekDays.map((day) => {
                    const dateStr = formatISODate(day);
                    const dayShifts = shiftMap.get(emp.id)?.get(dateStr) ?? [];

                    return (
                      <div
                        key={dateStr}
                        style={{
                          borderRight: '1px solid var(--border)',
                          borderBottom: '1px solid var(--border)',
                          height: 'var(--row-h)',
                          padding: 5,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 3,
                          background: 'var(--bg)',
                        }}
                      >
                        {dayShifts.length > 0 ? (
                          dayShifts.map((shift) => (
                            <ShiftCard
                              key={shift.id}
                              shift={shift}
                              onClick={() => setSelectedShiftId(shift.id)}
                            />
                          ))
                        ) : (
                          <EmptyCell
                            onClick={() => {
                              setCreateShiftDefaults({ employeeId: emp.id, date: dateStr });
                              setCreateShiftOpen(true);
                            }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}

            {/* ── Open shifts row ── */}
            {weekDays.some((d) => (openShiftsByDate.get(formatISODate(d)) ?? []).length > 0) && (
              <div style={{ display: 'contents' }}>
                {/* Person cell for open shifts */}
                <div
                  style={{
                    position: 'sticky',
                    left: 0,
                    zIndex: 10,
                    background: 'var(--surface)',
                    borderRight: '1px solid var(--border)',
                    borderBottom: '1px solid var(--border)',
                    height: 'var(--row-h)',
                    padding: '0 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: 'var(--open-bg)',
                      border: '1px dashed var(--open-dot)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Plus size={14} style={{ color: 'var(--open-dot)' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--open-text)' }}>
                      Open shifts
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: 'var(--text-dim)',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      Unassigned
                    </div>
                  </div>
                </div>

                {weekDays.map((day) => {
                  const dateStr = formatISODate(day);
                  const openShifts = openShiftsByDate.get(dateStr) ?? [];

                  return (
                    <div
                      key={dateStr}
                      style={{
                        borderRight: '1px solid var(--border)',
                        borderBottom: '1px solid var(--border)',
                        height: 'var(--row-h)',
                        padding: 5,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 3,
                        background: 'var(--bg)',
                      }}
                    >
                      {openShifts.length > 0
                        ? openShifts.map((shift) => (
                            <OpenShiftCard
                              key={shift.id}
                              shift={shift}
                              onClick={() => setSelectedShiftId(shift.id)}
                            />
                          ))
                        : (
                          <EmptyCell
                            onClick={() => {
                              setCreateShiftDefaults({ date: dateStr, openShift: true });
                              setCreateShiftOpen(true);
                            }}
                          />
                        )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Legend bar (sticky bottom) ── */}
      <LegendBar statusCounts={statusCounts} totalPayroll={totalPayroll} />
    </div>
  );
}
