import type { Shift, ShiftFilter, CreateShiftInput, UpdateShiftInput } from '@/types';
import { mockDelay, generateId } from '@/lib/utils';

// ─── Seed Data: Week of Jun 22–28, 2026 ───────────────────────────────────────

const SEED_SHIFTS: Shift[] = [
  // Monday June 22
  {
    id: 'shift_001',
    employeeId: 'emp_001',
    date: '2026-06-22',
    startTime: '08:00',
    endTime: '16:30',
    breakMinutes: 30,
    roleId: 'role_shift_lead',
    departmentId: 'dept_ops',
    locationId: 'loc_main',
    status: 'filled',
    publishedAt: '2026-06-15T10:00:00Z',
  },
  {
    id: 'shift_002',
    employeeId: 'emp_005',
    date: '2026-06-22',
    startTime: '08:00',
    endTime: '16:30',
    breakMinutes: 30,
    roleId: 'role_ops_associate',
    departmentId: 'dept_ops',
    locationId: 'loc_main',
    status: 'filled',
    publishedAt: '2026-06-15T10:00:00Z',
  },
  {
    id: 'shift_003',
    employeeId: 'emp_003',
    date: '2026-06-22',
    startTime: '09:00',
    endTime: '13:00',
    breakMinutes: 0,
    roleId: 'role_receptionist',
    departmentId: 'dept_front',
    locationId: 'loc_main',
    status: 'filled',
    publishedAt: '2026-06-15T10:00:00Z',
  },
  {
    id: 'shift_004',
    employeeId: 'emp_007',
    date: '2026-06-22',
    startTime: '13:00',
    endTime: '21:00',
    breakMinutes: 30,
    roleId: 'role_concierge',
    departmentId: 'dept_front',
    locationId: 'loc_main',
    status: 'filled',
    publishedAt: '2026-06-15T10:00:00Z',
  },
  {
    id: 'shift_005',
    employeeId: 'emp_002',
    date: '2026-06-22',
    startTime: '09:00',
    endTime: '17:30',
    breakMinutes: 30,
    roleId: 'role_senior_sales',
    departmentId: 'dept_sales',
    locationId: 'loc_main',
    status: 'filled',
    publishedAt: '2026-06-15T10:00:00Z',
  },
  {
    id: 'shift_006',
    employeeId: 'emp_009',
    date: '2026-06-22',
    startTime: '10:00',
    endTime: '18:30',
    breakMinutes: 30,
    roleId: 'role_sales_rep',
    departmentId: 'dept_sales',
    locationId: 'loc_main',
    status: 'filled',
    publishedAt: '2026-06-15T10:00:00Z',
  },

  // Tuesday June 23
  {
    id: 'shift_007',
    employeeId: 'emp_001',
    date: '2026-06-23',
    startTime: '08:00',
    endTime: '16:30',
    breakMinutes: 30,
    roleId: 'role_shift_lead',
    departmentId: 'dept_ops',
    locationId: 'loc_main',
    status: 'filled',
    publishedAt: '2026-06-15T10:00:00Z',
  },
  {
    id: 'shift_008',
    employeeId: 'emp_008',
    date: '2026-06-23',
    startTime: '08:00',
    endTime: '14:00',
    breakMinutes: 30,
    roleId: 'role_ops_associate',
    departmentId: 'dept_ops',
    locationId: 'loc_north',
    status: 'filled',
    publishedAt: '2026-06-15T10:00:00Z',
  },
  {
    id: 'shift_009',
    employeeId: 'emp_006',
    date: '2026-06-23',
    startTime: '09:00',
    endTime: '17:30',
    breakMinutes: 30,
    roleId: 'role_sales_rep',
    departmentId: 'dept_sales',
    locationId: 'loc_north',
    status: 'filled',
    publishedAt: '2026-06-15T10:00:00Z',
  },
  {
    id: 'shift_010',
    employeeId: 'emp_003',
    date: '2026-06-23',
    startTime: '13:00',
    endTime: '17:00',
    breakMinutes: 0,
    roleId: 'role_receptionist',
    departmentId: 'dept_front',
    locationId: 'loc_main',
    status: 'filled',
    publishedAt: '2026-06-15T10:00:00Z',
  },
  // Open shift - needs coverage
  {
    id: 'shift_011',
    employeeId: null,
    date: '2026-06-23',
    startTime: '06:00',
    endTime: '14:00',
    breakMinutes: 30,
    roleId: 'role_ops_associate',
    departmentId: 'dept_ops',
    locationId: 'loc_main',
    status: 'open',
    requiredSkills: ['forklift', 'safety_certified'],
  },

  // Wednesday June 24
  {
    id: 'shift_012',
    employeeId: 'emp_005',
    date: '2026-06-24',
    startTime: '08:00',
    endTime: '16:30',
    breakMinutes: 30,
    roleId: 'role_ops_associate',
    departmentId: 'dept_ops',
    locationId: 'loc_main',
    status: 'filled',
    publishedAt: '2026-06-15T10:00:00Z',
  },
  {
    id: 'shift_013',
    employeeId: 'emp_007',
    date: '2026-06-24',
    startTime: '09:00',
    endTime: '17:30',
    breakMinutes: 30,
    roleId: 'role_concierge',
    departmentId: 'dept_front',
    locationId: 'loc_main',
    status: 'filled',
    publishedAt: '2026-06-15T10:00:00Z',
  },
  {
    id: 'shift_014',
    employeeId: 'emp_009',
    date: '2026-06-24',
    startTime: '10:00',
    endTime: '18:30',
    breakMinutes: 30,
    roleId: 'role_sales_rep',
    departmentId: 'dept_sales',
    locationId: 'loc_main',
    status: 'conflict',
    warning: 'overlap',
    notes: 'Overlaps with scheduled remote session',
    publishedAt: '2026-06-15T10:00:00Z',
  },
  {
    id: 'shift_015',
    employeeId: 'emp_002',
    date: '2026-06-24',
    startTime: '09:00',
    endTime: '17:30',
    breakMinutes: 30,
    roleId: 'role_senior_sales',
    departmentId: 'dept_sales',
    locationId: 'loc_main',
    status: 'filled',
    warning: 'overtime',
    publishedAt: '2026-06-15T10:00:00Z',
  },

  // Thursday June 25 (today minus 4 days in context, but in our seed it's current week)
  {
    id: 'shift_016',
    employeeId: 'emp_001',
    date: '2026-06-25',
    startTime: '08:00',
    endTime: '16:30',
    breakMinutes: 30,
    roleId: 'role_shift_lead',
    departmentId: 'dept_ops',
    locationId: 'loc_main',
    status: 'filled',
    publishedAt: '2026-06-15T10:00:00Z',
  },
  {
    id: 'shift_017',
    employeeId: 'emp_004',
    date: '2026-06-25',
    startTime: '09:00',
    endTime: '17:30',
    breakMinutes: 30,
    roleId: 'role_manager',
    departmentId: 'dept_mgmt',
    locationId: 'loc_main',
    status: 'filled',
    publishedAt: '2026-06-15T10:00:00Z',
  },
  {
    id: 'shift_018',
    employeeId: 'emp_006',
    date: '2026-06-25',
    startTime: '09:00',
    endTime: '17:30',
    breakMinutes: 30,
    roleId: 'role_sales_rep',
    departmentId: 'dept_sales',
    locationId: 'loc_north',
    status: 'filled',
    publishedAt: '2026-06-15T10:00:00Z',
  },
  {
    id: 'shift_019',
    employeeId: 'emp_003',
    date: '2026-06-25',
    startTime: '09:00',
    endTime: '13:00',
    breakMinutes: 0,
    roleId: 'role_receptionist',
    departmentId: 'dept_front',
    locationId: 'loc_main',
    status: 'filled',
    publishedAt: '2026-06-15T10:00:00Z',
  },
  {
    id: 'shift_020',
    employeeId: 'emp_008',
    date: '2026-06-25',
    startTime: '10:00',
    endTime: '16:00',
    breakMinutes: 30,
    roleId: 'role_ops_associate',
    departmentId: 'dept_ops',
    locationId: 'loc_north',
    status: 'filled',
    publishedAt: '2026-06-15T10:00:00Z',
  },

  // Friday June 26
  {
    id: 'shift_021',
    employeeId: 'emp_001',
    date: '2026-06-26',
    startTime: '08:00',
    endTime: '16:30',
    breakMinutes: 30,
    roleId: 'role_shift_lead',
    departmentId: 'dept_ops',
    locationId: 'loc_main',
    status: 'filled',
    publishedAt: '2026-06-15T10:00:00Z',
  },
  {
    id: 'shift_022',
    employeeId: 'emp_005',
    date: '2026-06-26',
    startTime: '08:00',
    endTime: '16:30',
    breakMinutes: 30,
    roleId: 'role_ops_associate',
    departmentId: 'dept_ops',
    locationId: 'loc_main',
    status: 'filled',
    publishedAt: '2026-06-15T10:00:00Z',
  },
  {
    id: 'shift_023',
    employeeId: 'emp_009',
    date: '2026-06-26',
    startTime: '09:00',
    endTime: '17:30',
    breakMinutes: 30,
    roleId: 'role_sales_rep',
    departmentId: 'dept_sales',
    locationId: 'loc_main',
    status: 'filled',
    publishedAt: '2026-06-15T10:00:00Z',
  },
  {
    id: 'shift_024',
    employeeId: 'emp_007',
    date: '2026-06-26',
    startTime: '13:00',
    endTime: '21:00',
    breakMinutes: 30,
    roleId: 'role_concierge',
    departmentId: 'dept_front',
    locationId: 'loc_main',
    status: 'filled',
    publishedAt: '2026-06-15T10:00:00Z',
  },
  // Draft shift not yet published
  {
    id: 'shift_025',
    employeeId: null,
    date: '2026-06-26',
    startTime: '14:00',
    endTime: '22:00',
    breakMinutes: 30,
    roleId: 'role_ops_associate',
    departmentId: 'dept_ops',
    locationId: 'loc_north',
    status: 'draft',
    notes: 'Evening coverage needed',
  },

  // Saturday June 27
  {
    id: 'shift_026',
    employeeId: 'emp_005',
    date: '2026-06-27',
    startTime: '08:00',
    endTime: '14:00',
    breakMinutes: 30,
    roleId: 'role_ops_associate',
    departmentId: 'dept_ops',
    locationId: 'loc_main',
    status: 'filled',
    publishedAt: '2026-06-15T10:00:00Z',
  },
  {
    id: 'shift_027',
    employeeId: 'emp_003',
    date: '2026-06-27',
    startTime: '09:00',
    endTime: '13:00',
    breakMinutes: 0,
    roleId: 'role_receptionist',
    departmentId: 'dept_front',
    locationId: 'loc_main',
    status: 'filled',
    publishedAt: '2026-06-15T10:00:00Z',
  },
  {
    id: 'shift_028',
    employeeId: null,
    date: '2026-06-27',
    startTime: '14:00',
    endTime: '21:00',
    breakMinutes: 30,
    roleId: 'role_sales_rep',
    departmentId: 'dept_sales',
    locationId: 'loc_main',
    status: 'open',
    requiredSkills: ['customer_service'],
  },

  // Sunday June 28
  {
    id: 'shift_029',
    employeeId: 'emp_007',
    date: '2026-06-28',
    startTime: '10:00',
    endTime: '18:00',
    breakMinutes: 30,
    roleId: 'role_concierge',
    departmentId: 'dept_front',
    locationId: 'loc_main',
    status: 'filled',
    publishedAt: '2026-06-15T10:00:00Z',
  },
  {
    id: 'shift_030',
    employeeId: null,
    date: '2026-06-28',
    startTime: '08:00',
    endTime: '16:00',
    breakMinutes: 30,
    roleId: 'role_ops_associate',
    departmentId: 'dept_ops',
    locationId: 'loc_main',
    status: 'open',
    requiredSkills: ['safety_certified'],
  },

  // Next week preview (Jun 29 – draft)
  {
    id: 'shift_031',
    employeeId: 'emp_001',
    date: '2026-06-29',
    startTime: '08:00',
    endTime: '16:30',
    breakMinutes: 30,
    roleId: 'role_shift_lead',
    departmentId: 'dept_ops',
    locationId: 'loc_main',
    status: 'draft',
  },
  {
    id: 'shift_032',
    employeeId: 'emp_002',
    date: '2026-06-29',
    startTime: '09:00',
    endTime: '17:30',
    breakMinutes: 30,
    roleId: 'role_senior_sales',
    departmentId: 'dept_sales',
    locationId: 'loc_main',
    status: 'draft',
  },
];

// ─── In-Memory Store ──────────────────────────────────────────────────────────

let shiftsStore: Shift[] = [...SEED_SHIFTS];

// ─── Service Functions ────────────────────────────────────────────────────────

export async function getShifts(filter?: ShiftFilter): Promise<Shift[]> {
  await mockDelay();
  let result = [...shiftsStore];

  if (filter?.weekStart) {
    // Return shifts for the 7-day window starting at weekStart
    const start = filter.weekStart;
    const [y, m, d] = start.split('-').map(Number);
    const endDate = new Date(y, m - 1, d + 6);
    const end = endDate.toISOString().split('T')[0];
    result = result.filter((s) => s.date >= start && s.date <= end);
  } else if (filter?.dateRange) {
    result = result.filter(
      (s) => s.date >= filter.dateRange!.start && s.date <= filter.dateRange!.end
    );
  }

  if (filter?.departmentId) {
    result = result.filter((s) => s.departmentId === filter.departmentId);
  }
  if (filter?.employeeId) {
    result = result.filter((s) => s.employeeId === filter.employeeId);
  }
  if (filter?.locationId) {
    result = result.filter((s) => s.locationId === filter.locationId);
  }
  if (filter?.status) {
    result = result.filter((s) => s.status === filter.status);
  }

  return result.sort((a, b) =>
    a.date !== b.date ? a.date.localeCompare(b.date) : a.startTime.localeCompare(b.startTime)
  );
}

export async function getShift(id: string): Promise<Shift | null> {
  await mockDelay(100, 300);
  return shiftsStore.find((s) => s.id === id) ?? null;
}

export async function createShift(input: CreateShiftInput): Promise<Shift> {
  await mockDelay();
  const newShift: Shift = {
    id: generateId('shift'),
    employeeId: input.employeeId,
    date: input.date,
    startTime: input.startTime,
    endTime: input.endTime,
    breakMinutes: input.breakMinutes ?? 30,
    roleId: input.roleId,
    departmentId: input.departmentId,
    locationId: input.locationId,
    status: input.employeeId ? 'draft' : 'open',
    notes: input.notes,
    requiredSkills: input.requiredSkills,
  };
  shiftsStore.push(newShift);
  return newShift;
}

export async function updateShift(id: string, patch: UpdateShiftInput): Promise<Shift> {
  await mockDelay();
  const index = shiftsStore.findIndex((s) => s.id === id);
  if (index === -1) throw new Error(`Shift ${id} not found`);
  shiftsStore[index] = { ...shiftsStore[index], ...patch };
  return shiftsStore[index];
}

export async function deleteShift(id: string): Promise<void> {
  await mockDelay(150, 400);
  const index = shiftsStore.findIndex((s) => s.id === id);
  if (index === -1) throw new Error(`Shift ${id} not found`);
  shiftsStore.splice(index, 1);
}

export async function publishWeek(weekStart: string): Promise<{ published: number }> {
  await mockDelay(400, 800);
  const [y, m, d] = weekStart.split('-').map(Number);
  const endDate = new Date(y, m - 1, d + 6);
  const weekEnd = endDate.toISOString().split('T')[0];
  const now = new Date().toISOString();

  let published = 0;
  shiftsStore = shiftsStore.map((shift) => {
    if (
      shift.date >= weekStart &&
      shift.date <= weekEnd &&
      (shift.status === 'draft' || shift.status === 'filled') &&
      !shift.publishedAt
    ) {
      published++;
      return {
        ...shift,
        status: shift.employeeId ? 'filled' : 'open',
        publishedAt: now,
      };
    }
    return shift;
  });

  return { published };
}

export async function assignShift(
  shiftId: string,
  employeeId: string
): Promise<Shift> {
  return updateShift(shiftId, { employeeId, status: 'filled' });
}

export async function unassignShift(shiftId: string): Promise<Shift> {
  return updateShift(shiftId, { employeeId: null, status: 'open' });
}
