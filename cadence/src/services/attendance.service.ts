import type { AttendanceEvent } from '@/types';
import { mockDelay } from '@/lib/utils';

// ─── Seed Data: Today's Attendance (June 29, 2026) ───────────────────────────

// Today is Monday Jun 29, 2026. Most employees on shift 08:00–16:30.
// We're simulating mid-day state (around 11:00 AM).

const SEED_ATTENDANCE: AttendanceEvent[] = [
  // emp_001 - Alex Mercer: On time, currently on shift
  {
    id: 'att_001',
    employeeId: 'emp_001',
    shiftId: 'shift_031',
    clockIn: '2026-06-29T08:02:00Z',
    breaks: [],
    gpsVerified: true,
    locationId: 'loc_main',
    status: 'on_shift',
    notes: undefined,
  },

  // emp_002 - Jordan Park: On time, currently on shift
  {
    id: 'att_002',
    employeeId: 'emp_002',
    shiftId: 'shift_032',
    clockIn: '2026-06-29T08:58:00Z',
    breaks: [],
    gpsVerified: true,
    locationId: 'loc_main',
    status: 'on_shift',
  },

  // emp_003 - Sarah Kim: Part-time morning shift, complete
  {
    id: 'att_003',
    employeeId: 'emp_003',
    shiftId: 'shift_003',
    clockIn: '2026-06-29T09:01:00Z',
    clockOut: '2026-06-29T13:00:00Z',
    breaks: [],
    gpsVerified: true,
    locationId: 'loc_main',
    status: 'complete',
  },

  // emp_005 - Sam Reyes: Late arrival
  {
    id: 'att_005',
    employeeId: 'emp_005',
    shiftId: 'shift_002',
    clockIn: '2026-06-29T08:34:00Z', // 34 min late
    breaks: [],
    gpsVerified: true,
    locationId: 'loc_main',
    status: 'late',
    notes: 'Transit delays reported.',
  },

  // emp_006 - Naomi West: On time, on break
  {
    id: 'att_006',
    employeeId: 'emp_006',
    shiftId: 'shift_009',
    clockIn: '2026-06-29T08:59:00Z',
    breaks: [{ start: '2026-06-29T11:00:00Z', end: '' }], // currently on break
    gpsVerified: false, // remote today
    locationId: 'loc_remote',
    status: 'on_break',
  },

  // emp_007 - Devon Lee: Evening shift, hasn't started yet
  {
    id: 'att_007',
    employeeId: 'emp_007',
    shiftId: 'shift_004',
    breaks: [],
    gpsVerified: false,
    locationId: 'loc_main',
    status: 'on_time', // expected later today
  },

  // emp_008 - Marcus Chen: On time, on shift
  {
    id: 'att_008',
    employeeId: 'emp_008',
    shiftId: 'shift_008',
    clockIn: '2026-06-29T08:01:00Z',
    breaks: [{ start: '2026-06-29T10:30:00Z', end: '2026-06-29T11:00:00Z' }],
    gpsVerified: true,
    locationId: 'loc_north',
    status: 'on_shift',
  },

  // emp_009 - Riley Hayes: Called in sick
  {
    id: 'att_009',
    employeeId: 'emp_009',
    shiftId: 'shift_006',
    breaks: [],
    gpsVerified: false,
    status: 'sick',
    notes: 'Called in sick at 7:30 AM.',
  },

  // emp_004 - Priya Shah: Manager, on time
  {
    id: 'att_004',
    employeeId: 'emp_004',
    shiftId: 'shift_017',
    clockIn: '2026-06-29T09:00:00Z',
    breaks: [],
    gpsVerified: true,
    locationId: 'loc_main',
    status: 'on_shift',
  },

  // Yesterday's completed records for emp_001 (Jun 28)
  {
    id: 'att_101',
    employeeId: 'emp_001',
    shiftId: 'shift_029',
    clockIn: '2026-06-28T10:02:00Z',
    clockOut: '2026-06-28T18:01:00Z',
    breaks: [{ start: '2026-06-28T13:00:00Z', end: '2026-06-28T13:30:00Z' }],
    gpsVerified: true,
    locationId: 'loc_main',
    status: 'complete',
  },

  // Yesterday's completed records for emp_007 (Jun 28)
  {
    id: 'att_102',
    employeeId: 'emp_007',
    shiftId: 'shift_029',
    clockIn: '2026-06-28T10:01:00Z',
    clockOut: '2026-06-28T18:02:00Z',
    breaks: [{ start: '2026-06-28T13:30:00Z', end: '2026-06-28T14:00:00Z' }],
    gpsVerified: true,
    locationId: 'loc_main',
    status: 'complete',
  },

  // No-show from last week (Jun 25)
  {
    id: 'att_103',
    employeeId: 'emp_010',
    shiftId: 'shift_019',
    breaks: [],
    gpsVerified: false,
    status: 'no_show',
    notes: 'Employee did not show up and was unreachable.',
  },
];

// ─── In-Memory Store ──────────────────────────────────────────────────────────

let attendanceStore: AttendanceEvent[] = [...SEED_ATTENDANCE];

// ─── Service Functions ────────────────────────────────────────────────────────

export async function getAttendanceEvents(date?: string): Promise<AttendanceEvent[]> {
  await mockDelay();
  if (!date) return [...attendanceStore];

  // Filter by clock-in date or shift date approximation
  return attendanceStore.filter((event) => {
    if (event.clockIn) {
      return event.clockIn.startsWith(date);
    }
    // Include events without clock-in that are still active today
    return true;
  });
}

export async function getAttendanceEvent(id: string): Promise<AttendanceEvent | null> {
  await mockDelay(100, 300);
  return attendanceStore.find((e) => e.id === id) ?? null;
}

export async function getEmployeeAttendance(employeeId: string): Promise<AttendanceEvent[]> {
  await mockDelay();
  return attendanceStore
    .filter((e) => e.employeeId === employeeId)
    .sort((a, b) => {
      const aTime = a.clockIn ?? '';
      const bTime = b.clockIn ?? '';
      return bTime.localeCompare(aTime);
    });
}

export async function clockIn(
  employeeId: string,
  shiftId: string,
  locationId?: string,
  gpsVerified = false
): Promise<AttendanceEvent> {
  await mockDelay();
  const now = new Date().toISOString();

  const event: AttendanceEvent = {
    id: `att_${Date.now()}`,
    employeeId,
    shiftId,
    clockIn: now,
    breaks: [],
    gpsVerified,
    locationId,
    status: 'on_shift',
  };

  attendanceStore.push(event);
  return event;
}

export async function clockOut(id: string): Promise<AttendanceEvent> {
  await mockDelay();
  const index = attendanceStore.findIndex((e) => e.id === id);
  if (index === -1) throw new Error(`Attendance event ${id} not found`);

  const event = attendanceStore[index];
  // Close any open break
  const breaks = event.breaks.map((b) =>
    b.end ? b : { ...b, end: new Date().toISOString() }
  );

  attendanceStore[index] = {
    ...event,
    clockOut: new Date().toISOString(),
    breaks,
    status: 'complete',
  };

  return attendanceStore[index];
}

export async function startBreak(id: string): Promise<AttendanceEvent> {
  await mockDelay();
  const index = attendanceStore.findIndex((e) => e.id === id);
  if (index === -1) throw new Error(`Attendance event ${id} not found`);

  attendanceStore[index] = {
    ...attendanceStore[index],
    breaks: [
      ...attendanceStore[index].breaks,
      { start: new Date().toISOString(), end: '' },
    ],
    status: 'on_break',
  };

  return attendanceStore[index];
}

export async function endBreak(id: string): Promise<AttendanceEvent> {
  await mockDelay();
  const index = attendanceStore.findIndex((e) => e.id === id);
  if (index === -1) throw new Error(`Attendance event ${id} not found`);

  const breaks = attendanceStore[index].breaks.map((b, i, arr) =>
    i === arr.length - 1 && !b.end ? { ...b, end: new Date().toISOString() } : b
  );

  attendanceStore[index] = {
    ...attendanceStore[index],
    breaks,
    status: 'on_shift',
  };

  return attendanceStore[index];
}

export async function getTodayStats(): Promise<{
  onShift: number;
  late: number;
  onBreak: number;
  sick: number;
  noShow: number;
  complete: number;
}> {
  await mockDelay(100, 250);
  const today = new Date().toISOString().split('T')[0];
  const todayEvents = await getAttendanceEvents(today);

  return {
    onShift: todayEvents.filter((e) => e.status === 'on_shift').length,
    late: todayEvents.filter((e) => e.status === 'late').length,
    onBreak: todayEvents.filter((e) => e.status === 'on_break').length,
    sick: todayEvents.filter((e) => e.status === 'sick').length,
    noShow: todayEvents.filter((e) => e.status === 'no_show').length,
    complete: todayEvents.filter((e) => e.status === 'complete').length,
  };
}
