import type { TimeOffRequest, TimeOffFilter, RequestStatus, ShiftSwap } from '@/types';

export type ShiftSwapWithInfo = ShiftSwap & {
  fromShiftInfo: { dayLabel: string; startTime: string; endTime: string; role: string };
  toShiftInfo: { startTime: string; endTime: string; role: string };
};
import { apiFetch } from '@/lib/api-url';

// ─── Time-Off Requests ────────────────────────────────────────────────────────

export async function getTimeOffRequests(filter?: TimeOffFilter): Promise<TimeOffRequest[]> {
  const params = new URLSearchParams();
  if (filter?.status) params.set('status', filter.status);
  if (filter?.employeeId) params.set('employeeId', filter.employeeId);
  if (filter?.locationId) params.set('locationId', filter.locationId);
  const qs = params.toString();
  try {
    return await apiFetch<TimeOffRequest[]>(`/api/time-off${qs ? `?${qs}` : ''}`);
  } catch {
    return [];
  }
}

export async function createTimeOffRequest(
  input: Omit<TimeOffRequest, 'id' | 'status' | 'submittedAt'> & { locationId?: string }
): Promise<TimeOffRequest> {
  return apiFetch<TimeOffRequest>('/api/time-off', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
}

export async function updateTimeOffRequest(
  id: string,
  patch: { status?: RequestStatus; managerComment?: string; decidedBy?: string }
): Promise<TimeOffRequest> {
  await apiFetch(`/api/time-off/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  return { id } as TimeOffRequest;
}

export async function approveTimeOffRequest(id: string, decidedBy?: string): Promise<TimeOffRequest> {
  return updateTimeOffRequest(id, { status: 'approved', decidedBy });
}

export async function rejectTimeOffRequest(
  id: string,
  managerComment?: string,
  decidedBy?: string
): Promise<TimeOffRequest> {
  return updateTimeOffRequest(id, { status: 'rejected', managerComment, decidedBy });
}

// ─── Shift Swaps (in-memory only — no Snowflake table yet) ───────────────────

const swapsStore: ShiftSwap[] = [];

const EMPTY_SHIFT_INFO = { dayLabel: '', startTime: '', endTime: '', role: '' };

export async function getShiftSwaps(_filter?: TimeOffFilter): Promise<ShiftSwapWithInfo[]> {
  return swapsStore.map((s) => ({
    ...s,
    fromShiftInfo: EMPTY_SHIFT_INFO,
    toShiftInfo: EMPTY_SHIFT_INFO,
  }));
}

export async function createShiftSwap(
  input: Omit<ShiftSwap, 'id' | 'status' | 'submittedAt'>
): Promise<ShiftSwap> {
  const swap: ShiftSwap = {
    ...input,
    id: `swap_${Date.now()}`,
    status: 'pending',
    submittedAt: new Date().toISOString(),
  };
  swapsStore.push(swap);
  return swap;
}

export async function approveShiftSwap(id: string): Promise<ShiftSwap> {
  const idx = swapsStore.findIndex((s) => s.id === id);
  if (idx !== -1) swapsStore[idx] = { ...swapsStore[idx], status: 'approved' };
  return swapsStore[idx] ?? ({ id, status: 'approved' } as ShiftSwap);
}

export async function rejectShiftSwap(id: string): Promise<ShiftSwap> {
  const idx = swapsStore.findIndex((s) => s.id === id);
  if (idx !== -1) swapsStore[idx] = { ...swapsStore[idx], status: 'rejected' };
  return swapsStore[idx] ?? ({ id, status: 'rejected' } as ShiftSwap);
}
