'use client';

import { useMemo, useState } from 'react';
import { ScheduleToolbar } from '@/components/scheduler/ScheduleToolbar';
import { WeekGrid } from '@/components/scheduler/WeekGrid';
import { MonthGrid } from '@/components/scheduler/MonthGrid';
import { YearGrid } from '@/components/scheduler/YearGrid';
import { ShiftDetailDrawer } from '@/components/scheduler/ShiftDetailDrawer';
import { today, getWeekDays, parseISO } from '@/lib/date';
import type { ScheduleViewMode } from '@/types';

export default function SchedulePage() {
  const [anchorDate, setAnchorDate] = useState(today);
  const [view, setView] = useState<ScheduleViewMode>('week');
  const [departmentId, setDepartmentId] = useState<string | null>(null);

  const days = useMemo(
    () => (view === 'day' ? [parseISO(anchorDate)] : getWeekDays(anchorDate)),
    [view, anchorDate]
  );

  function selectDay(dateStr: string) {
    setAnchorDate(dateStr);
    setView('day');
  }

  function selectMonth(dateStr: string) {
    setAnchorDate(dateStr);
    setView('month');
  }

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <ScheduleToolbar
        anchorDate={anchorDate}
        setAnchorDate={setAnchorDate}
        view={view}
        setView={setView}
        departmentId={departmentId}
        setDepartmentId={setDepartmentId}
      />
      {view === 'month' ? (
        <MonthGrid anchorDate={anchorDate} departmentId={departmentId} onSelectDay={selectDay} />
      ) : view === 'year' ? (
        <YearGrid anchorDate={anchorDate} departmentId={departmentId} onSelectMonth={selectMonth} />
      ) : (
        <WeekGrid days={days} departmentId={departmentId} />
      )}
      <ShiftDetailDrawer />
    </div>
  );
}
