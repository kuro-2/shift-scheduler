'use client';

import { ChevronLeft, ChevronRight, Filter, Copy } from 'lucide-react';
import { formatWeekRange, shiftWeek, formatISODate } from '@/lib/date';

type ViewMode = 'day' | 'week' | 'month' | 'timeline';

interface ScheduleToolbarProps {
  weekStart: string;
  setWeekStart: (d: string) => void;
  view: ViewMode;
  setView: (v: ViewMode) => void;
}

const VIEW_OPTIONS: { key: ViewMode; label: string }[] = [
  { key: 'day', label: 'Day' },
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
  { key: 'timeline', label: 'Timeline' },
];

export function ScheduleToolbar({
  weekStart,
  setWeekStart,
  view,
  setView,
}: ScheduleToolbarProps) {
  const weekLabel = formatWeekRange(weekStart);

  function goPrev() {
    setWeekStart(formatISODate(shiftWeek(weekStart, -1)));
  }

  function goNext() {
    setWeekStart(formatISODate(shiftWeek(weekStart, 1)));
  }

  function goToday() {
    // Default to Jun 22 week (the seeded week)
    setWeekStart('2026-06-22');
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
          aria-label="Previous week"
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
          {weekLabel}
        </span>

        <button
          onClick={goNext}
          aria-label="Next week"
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
      <button
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
          2
        </span>
      </button>

      {/* Copy week */}
      <button
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
        }}
      >
        <Copy size={14} />
        Copy week
      </button>

      {/* Publish */}
      <button
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
          cursor: 'pointer',
        }}
      >
        Publish
        <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>· 3 drafts</span>
      </button>
    </div>
  );
}
