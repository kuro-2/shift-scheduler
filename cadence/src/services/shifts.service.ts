import type { Shift, ShiftFilter, CreateShiftInput, UpdateShiftInput } from '@/types';
import { apiFetch } from '@/lib/api-url';

// ─── In-memory cache (populated by getShifts, read by getShiftById) ─────────

let shiftsCache: Shift[] = [];

// ─── Service Functions ────────────────────────────────────────────────────────

export async function getShifts(filter?: ShiftFilter): Promise<Shift[]> {
  const params = new URLSearchParams();
  if (filter?.weekStart) params.set('weekStart', filter.weekStart);
  if (filter?.dateRange?.start) params.set('dateFrom', filter.dateRange.start);
  if (filter?.dateRange?.end) params.set('dateTo', filter.dateRange.end);
  if (filter?.locationId) params.set('locationId', filter.locationId);
  if (filter?.employeeId) params.set('employeeId', filter.employeeId);
  const qs = params.toString();

  const shifts = await apiFetch<Shift[]>(`/api/shifts${qs ? `?${qs}` : ''}`);
  shiftsCache = shifts;

  // Apply status/department filters client-side (not worth extra DB params)
  let result = shifts;
  if (filter?.departmentId) result = result.filter((s) => s.departmentId === filter.departmentId);
  if (filter?.status) result = result.filter((s) => s.status === filter.status);

  return result.sort((a, b) =>
    a.date !== b.date ? a.date.localeCompare(b.date) : a.startTime.localeCompare(b.startTime)
  );
}

export async function getShift(id: string): Promise<Shift | null> {
  return shiftsCache.find((s) => s.id === id) ?? null;
}

export async function createShift(input: CreateShiftInput): Promise<Shift> {
  const shift = await apiFetch<Shift>('/api/shifts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  shiftsCache = [...shiftsCache, shift];
  return shift;
}

export async function updateShift(id: string, patch: UpdateShiftInput): Promise<Shift> {
  await apiFetch(`/api/shifts/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  shiftsCache = shiftsCache.map((s) => {
    if (s.id !== id) return s;
    const updated = { ...s, ...patch };
    if (patch.startTime || patch.endTime || patch.breakMinutes !== undefined) {
      updated.hoursWorked = computeHoursWorked(updated.startTime, updated.endTime, updated.breakMinutes);
    }
    return updated;
  });
  return shiftsCache.find((s) => s.id === id) ?? ({ id, ...patch } as Shift);
}

export async function deleteShift(id: string): Promise<void> {
  await apiFetch(`/api/shifts/${encodeURIComponent(id)}`, { method: 'DELETE' });
  shiftsCache = shiftsCache.filter((s) => s.id !== id);
}

export async function publishWeek(weekStart: string): Promise<{ published: number }> {
  return apiFetch<{ published: number }>('/api/shifts/publish', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ weekStart }),
  });
}

export async function assignShift(shiftId: string, employeeId: string): Promise<Shift> {
  return updateShift(shiftId, { employeeId, status: 'filled' });
}

export async function unassignShift(shiftId: string): Promise<Shift> {
  return updateShift(shiftId, { employeeId: null, status: 'open' });
}

export async function getWeeklyLaborSummary(locationId: string, weekStart: string) {
  return apiFetch<unknown[]>(
    `/api/reports?locationId=${encodeURIComponent(locationId)}&weekStart=${encodeURIComponent(weekStart)}`
  );
}

export async function getShiftTypes() {
  // DIM_SHIFT is read from Snowflake; if unavailable return static list
  return STATIC_SHIFT_TYPES;
}

// ─── Synchronous lookup helper ────────────────────────────────────────────────

export function getShiftById(id: string): Shift | undefined {
  return shiftsCache.find((s) => s.id === id);
}

// ─── Private helpers ──────────────────────────────────────────────────────────

function computeHoursWorked(startTime: string, endTime: string, breakMinutes: number): number {
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  let totalMinutes = eh * 60 + em - (sh * 60 + sm);
  if (totalMinutes < 0) totalMinutes += 24 * 60;
  return Math.round(((totalMinutes - breakMinutes) / 60) * 100) / 100;
}

const STATIC_SHIFT_TYPES = [
  { shiftKey: 1, shiftId: 'ST_MORNING', shiftName: 'Morning', startTime: '06:00', endTime: '14:00', durationHours: 8, shiftType: 'Standard', isOvernight: false, shiftStatus: 'Active' },
  { shiftKey: 2, shiftId: 'ST_DAY', shiftName: 'Day', startTime: '08:00', endTime: '16:30', durationHours: 8, shiftType: 'Standard', isOvernight: false, shiftStatus: 'Active' },
  { shiftKey: 3, shiftId: 'ST_AFTERNOON', shiftName: 'Afternoon', startTime: '13:00', endTime: '21:00', durationHours: 8, shiftType: 'Standard', isOvernight: false, shiftStatus: 'Active' },
  { shiftKey: 4, shiftId: 'ST_EVENING', shiftName: 'Evening', startTime: '14:00', endTime: '22:00', durationHours: 8, shiftType: 'Standard', isOvernight: false, shiftStatus: 'Active' },
  { shiftKey: 5, shiftId: 'ST_OVERNIGHT', shiftName: 'Overnight', startTime: '22:00', endTime: '06:00', durationHours: 8, shiftType: 'Overnight', isOvernight: true, shiftStatus: 'Active' },
  { shiftKey: 6, shiftId: 'ST_PART_AM', shiftName: 'Part-Time AM', startTime: '09:00', endTime: '13:00', durationHours: 4, shiftType: 'Part-Time', isOvernight: false, shiftStatus: 'Active' },
  { shiftKey: 7, shiftId: 'ST_PART_PM', shiftName: 'Part-Time PM', startTime: '13:00', endTime: '17:00', durationHours: 4, shiftType: 'Part-Time', isOvernight: false, shiftStatus: 'Active' },
];
