'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Filter, Copy } from 'lucide-react';
import { toast } from 'sonner';
import {
  formatWeekRange,
  formatMonthLabel,
  formatYearLabel,
  formatLongDate,
  getWeekStart,
  shiftWeek,
  shiftMonth,
  shiftYear,
  formatISODate,
  today,
  parseISO,
} from '@/lib/date';
import { addDays, subDays } from 'date-fns';
import { DEPARTMENTS } from '@/services/employees.service';
import { getShifts, createShift, publishWeek } from '@/services/shifts.service';
import type { ScheduleViewMode as ViewMode } from '@/types';

interface ScheduleToolbarProps {
  anchorDate: string;
  setAnchorDate: (d: string) => void;
  view: ViewMode;
  setView: (v: ViewMode) => void;
  departmentId: string | null;
  setDepartmentId: (id: string | null) => void;
}

const VIEW_OPTIONS: { key: ViewMode; label: string }[] = [
  { key: 'day', label: 'Day' },
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
  { key: 'year', label: 'Year' },
];

export function ScheduleToolbar({
  anchorDate,
  setAnchorDate,
  view,
  setView,
  departmentId,
  setDepartmentId,
}: ScheduleToolbarProps) {
  const periodLabel =
    view === 'day'
      ? formatLongDate(anchorDate)
      : view === 'week'
        ? formatWeekRange(getWeekStart(anchorDate))
        : view === 'month'
          ? formatMonthLabel(anchorDate)
          : formatYearLabel(anchorDate);

  const weekStart = formatISODate(getWeekStart(anchorDate));
  const queryClient = useQueryClient();
  const [filterOpen, setFilterOpen] = useState(false);
  const [copying, setCopying] = useState(false);
  const [publishing, setPublishing] = useState(false);

  function goPrev() {
    const d = parseISO(anchorDate);
    if (view === 'day') setAnchorDate(formatISODate(subDays(d, 1)));
    else if (view === 'week') setAnchorDate(formatISODate(shiftWeek(anchorDate, -1)));
    else if (view === 'month') setAnchorDate(formatISODate(shiftMonth(anchorDate, -1)));
    else setAnchorDate(formatISODate(shiftYear(anchorDate, -1)));
  }

  function goNext() {
    const d = parseISO(anchorDate);
    if (view === 'day') setAnchorDate(formatISODate(addDays(d, 1)));
    else if (view === 'week') setAnchorDate(formatISODate(shiftWeek(anchorDate, 1)));
    else if (view === 'month') setAnchorDate(formatISODate(shiftMonth(anchorDate, 1)));
    else setAnchorDate(formatISODate(shiftYear(anchorDate, 1)));
  }

  function goToday() {
    setAnchorDate(today());
  }

  async function handleCopyWeek() {
    setCopying(true);
    try {
      const shifts = await getShifts({ weekStart });
      await Promise.all(
        shifts.map((s) => {
          const d = new Date(`${s.date}T00:00:00Z`);
          d.setUTCDate(d.getUTCDate() + 7);
          return createShift({
            employeeId: s.employeeId,
            date: d.toISOString().slice(0, 10),
            startTime: s.startTime,
            endTime: s.endTime,
            breakMinutes: s.breakMinutes,
            roleId: s.roleId,
            departmentId: s.departmentId,
            locationId: s.locationId,
            notes: s.notes,
          });
        })
      );
      await queryClient.invalidateQueries({ queryKey: ['shifts'] });
      toast.success(
        shifts.length > 0
          ? `Copied ${shifts.length} shift${shifts.length === 1 ? '' : 's'} to next week`
          : 'No shifts to copy this week'
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to copy week');
    } finally {
      setCopying(false);
    }
  }

  async function handlePublish() {
    setPublishing(true);
    try {
      const res = await publishWeek(weekStart);
      await queryClient.invalidateQueries({ queryKey: ['shifts'] });
      toast.success(`Published — ${res.published} shift row${res.published === 1 ? '' : 's'} updated`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to publish week');
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '0 20px',
        height: 56,
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface)',
        flexShrink: 0,
      }}
    >
      {/* H1 */}
      <h1
        style={{
          fontSize: 18,
          fontWeight: 600,
          color: 'var(--text)',
          margin: 0,
          marginRight: 6,
          whiteSpace: 'nowrap',
        }}
      >
        Schedule
      </h1>

      {/* View selector */}
      <div
        style={{
          display: 'flex',
          background: 'var(--surface-2)',
          borderRadius: 99,
          padding: 3,
          gap: 1,
        }}
      >
        {VIEW_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setView(opt.key)}
            style={{
              fontSize: 12,
              fontWeight: 500,
              padding: '4px 12px',
              borderRadius: 99,
              border: 'none',
              cursor: 'pointer',
              color: view === opt.key ? 'var(--text)' : 'var(--text-muted)',
              background: view === opt.key ? 'var(--surface)' : 'transparent',
              boxShadow: view === opt.key ? 'var(--shadow-sm)' : 'none',
              transition: 'background 0.12s ease, color 0.12s ease',
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Date navigator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 4 }}>
        <button
          onClick={goPrev}
          aria-label="Previous period"
          style={{
            width: 28,
            height: 28,
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <ChevronLeft size={15} />
        </button>

        <span
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: 'var(--text)',
            minWidth: 136,
            textAlign: 'center',
            whiteSpace: 'nowrap',
          }}
        >
          {periodLabel}
        </span>

        <button
          onClick={goNext}
          aria-label="Next period"
          style={{
            width: 28,
            height: 28,
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <ChevronRight size={15} />
        </button>

        <button
          onClick={goToday}
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: 'var(--text-muted)',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            padding: '4px 10px',
            cursor: 'pointer',
            marginLeft: 2,
          }}
        >
          Today
        </button>
      </div>

      <span style={{ flex: 1 }} />

      {/* Filter */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setFilterOpen((v) => !v)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            fontSize: 13,
            fontWeight: 500,
            color: 'var(--text)',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            padding: '6px 11px',
            cursor: 'pointer',
            position: 'relative',
          }}
        >
          <Filter size={14} />
          Filter
          {departmentId && (
            <span
              style={{
                minWidth: 16,
                height: 16,
                borderRadius: 99,
                background: 'var(--accent)',
                color: '#FFFFFF',
                fontSize: 10,
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                paddingInline: 4,
                marginLeft: 2,
              }}
            >
              1
            </span>
          )}
        </button>
        {filterOpen && (
          <>
            <div
              onClick={() => setFilterOpen(false)}
              style={{ position: 'fixed', inset: 0, zIndex: 60 }}
            />
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: 6,
                zIndex: 61,
                minWidth: 180,
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                boxShadow: 'var(--shadow-lg)',
                padding: 4,
              }}
            >
              <button
                onClick={() => {
                  setDepartmentId(null);
                  setFilterOpen(false);
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '7px 10px',
                  borderRadius: 6,
                  border: 'none',
                  background: departmentId === null ? 'var(--accent-soft)' : 'transparent',
                  color: departmentId === null ? 'var(--accent-text)' : 'var(--text)',
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                All departments
              </button>
              {DEPARTMENTS.map((d) => (
                <button
                  key={d.id}
                  onClick={() => {
                    setDepartmentId(d.id);
                    setFilterOpen(false);
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '7px 10px',
                    borderRadius: 6,
                    border: 'none',
                    background: departmentId === d.id ? 'var(--accent-soft)' : 'transparent',
                    color: departmentId === d.id ? 'var(--accent-text)' : 'var(--text)',
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  {d.name}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Copy week */}
      <button
        disabled={copying}
        onClick={handleCopyWeek}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          fontSize: 13,
          fontWeight: 500,
          color: 'var(--text)',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          padding: '6px 11px',
          cursor: copying ? 'default' : 'pointer',
          opacity: copying ? 0.6 : 1,
        }}
      >
        <Copy size={14} />
        {copying ? 'Copying…' : 'Copy week'}
      </button>

      {/* Publish */}
      <button
        disabled={publishing}
        onClick={handlePublish}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          fontSize: 13,
          fontWeight: 600,
          color: '#FFFFFF',
          background: 'var(--text)',
          border: 'none',
          borderRadius: 'var(--radius-sm)',
          padding: '6px 13px',
          cursor: publishing ? 'default' : 'pointer',
          opacity: publishing ? 0.6 : 1,
        }}
      >
        {publishing ? 'Publishing…' : 'Publish'}
      </button>
    </div>
  );
}
