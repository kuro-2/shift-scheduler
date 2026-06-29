'use client';

import { useState } from 'react';
import { ScheduleToolbar } from '@/components/scheduler/ScheduleToolbar';
import { WeekGrid } from '@/components/scheduler/WeekGrid';
import { ShiftDetailDrawer } from '@/components/scheduler/ShiftDetailDrawer';

type ViewMode = 'day' | 'week' | 'month' | 'timeline';

export default function SchedulePage() {
  const [weekStart, setWeekStart] = useState('2026-06-22');
  const [view, setView] = useState<ViewMode>('week');

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
        weekStart={weekStart}
        setWeekStart={setWeekStart}
        view={view}
        setView={setView}
      />
      <WeekGrid weekStart={weekStart} />
      <ShiftDetailDrawer />
    </div>
  );
}
