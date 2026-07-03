import type { AttendanceEvent } from '@/types';
import { apiFetch } from '@/lib/api-url';

export async function getEmployeeAttendance(employeeId: string): Promise<AttendanceEvent[]> {
  return apiFetch<AttendanceEvent[]>(`/api/attendance?employeeId=${encodeURIComponent(employeeId)}`);
}

export async function getAttendanceEvents(
  date?: string,
  locationId?: string
): Promise<AttendanceEvent[]> {
  const params = new URLSearchParams();
  if (date) params.set('date', date);
  if (locationId) params.set('locationId', locationId);
  const qs = params.toString();
  return apiFetch<AttendanceEvent[]>(`/api/attendance${qs ? `?${qs}` : ''}`);
}

export async function getAttendanceByDateRange(
  locationId: string,
  from: string,
  to: string
): Promise<AttendanceEvent[]> {
  const params = new URLSearchParams({ locationId, dateFrom: from, dateTo: to });
  return apiFetch<AttendanceEvent[]>(`/api/attendance?${params}`);
}

export async function getLaborCostSummary(
  locationId: string,
  weekStart: string
): Promise<{ totalCost: number; totalHours: number; overtimeHours: number }> {
  const events = await getAttendanceByDateRange(locationId, weekStart, (() => {
    const d = new Date(`${weekStart}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + 6);
    return d.toISOString().slice(0, 10);
  })());

  return {
    totalCost: events.reduce((s, e) => s + (e.totalLaborCost ?? 0), 0),
    totalHours: events.reduce((s, e) => s + (e.totalHours ?? 0), 0),
    overtimeHours: events.reduce((s, e) => s + (e.overtimeHours ?? 0), 0),
  };
}

export async function updateAttendanceStatus(
  laborKey: number,
  status: AttendanceEvent['status']
): Promise<void> {
  await apiFetch('/api/attendance', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ laborKey, status }),
  });
}

export async function clockIn(employeeId: string, locationId: string): Promise<void> {
  const now = new Date().toISOString();
  await apiFetch('/api/attendance', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ employeeId, locationId, clockIn: now }),
  });
}

export async function clockOut(
  employeeId: string,
  locationId: string,
  _date: string
): Promise<void> {
  const now = new Date().toISOString();
  await apiFetch('/api/attendance', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ employeeId, locationId, clockOut: now }),
  });
}
