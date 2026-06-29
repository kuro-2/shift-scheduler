import type { TimeOffRequest, TimeOffFilter, RequestStatus } from '@/types';
import { mockDelay, generateId } from '@/lib/utils';

// ─── Seed Data ────────────────────────────────────────────────────────────────

const SEED_TIME_OFF: TimeOffRequest[] = [
  // Pending requests
  {
    id: 'tor_001',
    employeeId: 'emp_006',
    type: 'vacation',
    startDate: '2026-07-07',
    endDate: '2026-07-11',
    reason: 'Annual family vacation to visit relatives in Portland.',
    status: 'pending',
    submittedAt: '2026-06-25T09:14:00Z',
  },
  {
    id: 'tor_002',
    employeeId: 'emp_008',
    type: 'personal',
    startDate: '2026-07-03',
    endDate: '2026-07-03',
    reason: 'Medical appointment that could not be scheduled outside work hours.',
    status: 'pending',
    submittedAt: '2026-06-27T11:30:00Z',
  },
  {
    id: 'tor_003',
    employeeId: 'emp_009',
    type: 'sick',
    startDate: '2026-06-30',
    endDate: '2026-07-01',
    reason: 'Recovering from flu.',
    status: 'pending',
    submittedAt: '2026-06-29T07:45:00Z',
  },

  // Approved requests
  {
    id: 'tor_004',
    employeeId: 'emp_002',
    type: 'vacation',
    startDate: '2026-07-14',
    endDate: '2026-07-18',
    reason: 'Pre-booked summer vacation.',
    status: 'approved',
    submittedAt: '2026-06-01T10:00:00Z',
    decidedAt: '2026-06-03T14:22:00Z',
    decidedBy: 'emp_004',
    managerComment: 'Approved. Please ensure handover notes are complete before departure.',
  },
  {
    id: 'tor_005',
    employeeId: 'emp_003',
    type: 'personal',
    startDate: '2026-07-04',
    endDate: '2026-07-04',
    reason: 'Independence Day — attending family event.',
    status: 'approved',
    submittedAt: '2026-06-10T16:00:00Z',
    decidedAt: '2026-06-11T09:15:00Z',
    decidedBy: 'emp_004',
    managerComment: 'Approved. Happy holiday!',
  },
  {
    id: 'tor_006',
    employeeId: 'emp_005',
    type: 'sick',
    startDate: '2026-06-18',
    endDate: '2026-06-19',
    reason: 'Stomach flu.',
    status: 'approved',
    submittedAt: '2026-06-17T22:10:00Z',
    decidedAt: '2026-06-18T06:30:00Z',
    decidedBy: 'emp_001',
  },
  {
    id: 'tor_007',
    employeeId: 'emp_007',
    type: 'vacation',
    startDate: '2026-08-04',
    endDate: '2026-08-08',
    reason: 'Annual leave.',
    status: 'approved',
    submittedAt: '2026-06-05T11:00:00Z',
    decidedAt: '2026-06-06T10:00:00Z',
    decidedBy: 'emp_004',
  },

  // Rejected requests
  {
    id: 'tor_008',
    employeeId: 'emp_001',
    type: 'vacation',
    startDate: '2026-06-29',
    endDate: '2026-07-04',
    reason: 'Extended 4th of July break.',
    status: 'rejected',
    submittedAt: '2026-06-15T14:00:00Z',
    decidedAt: '2026-06-16T09:30:00Z',
    decidedBy: 'emp_004',
    managerComment: 'Cannot approve — short-staffed this period. Please consider rescheduling to August.',
  },
  {
    id: 'tor_009',
    employeeId: 'emp_006',
    type: 'unpaid',
    startDate: '2026-07-21',
    endDate: '2026-07-25',
    reason: 'Personal travel.',
    status: 'rejected',
    submittedAt: '2026-06-20T10:00:00Z',
    decidedAt: '2026-06-22T15:45:00Z',
    decidedBy: 'emp_004',
    managerComment: 'Denied due to insufficient notice and operational needs.',
  },
];

// ─── In-Memory Store ──────────────────────────────────────────────────────────

let timeOffStore: TimeOffRequest[] = [...SEED_TIME_OFF];

// ─── Service Functions ────────────────────────────────────────────────────────

export async function getTimeOffRequests(filter?: TimeOffFilter): Promise<TimeOffRequest[]> {
  await mockDelay();
  let result = [...timeOffStore];

  if (filter?.status) {
    result = result.filter((r) => r.status === filter.status);
  }
  if (filter?.employeeId) {
    result = result.filter((r) => r.employeeId === filter.employeeId);
  }
  if (filter?.type) {
    result = result.filter((r) => r.type === filter.type);
  }

  return result.sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );
}

export async function getTimeOffRequest(id: string): Promise<TimeOffRequest | null> {
  await mockDelay(100, 300);
  return timeOffStore.find((r) => r.id === id) ?? null;
}

export async function createTimeOffRequest(
  input: Omit<TimeOffRequest, 'id' | 'status' | 'submittedAt'>
): Promise<TimeOffRequest> {
  await mockDelay();
  const newRequest: TimeOffRequest = {
    id: generateId('tor'),
    status: 'pending',
    submittedAt: new Date().toISOString(),
    ...input,
  };
  timeOffStore.push(newRequest);
  return newRequest;
}

export async function updateTimeOffRequest(
  id: string,
  patch: Partial<TimeOffRequest>
): Promise<TimeOffRequest> {
  await mockDelay();
  const index = timeOffStore.findIndex((r) => r.id === id);
  if (index === -1) throw new Error(`Time off request ${id} not found`);
  timeOffStore[index] = { ...timeOffStore[index], ...patch };
  return timeOffStore[index];
}

export async function approveTimeOffRequest(
  id: string,
  decidedBy: string,
  managerComment?: string
): Promise<TimeOffRequest> {
  return updateTimeOffRequest(id, {
    status: 'approved',
    decidedAt: new Date().toISOString(),
    decidedBy,
    managerComment,
  });
}

export async function rejectTimeOffRequest(
  id: string,
  decidedBy: string,
  managerComment?: string
): Promise<TimeOffRequest> {
  return updateTimeOffRequest(id, {
    status: 'rejected',
    decidedAt: new Date().toISOString(),
    decidedBy,
    managerComment,
  });
}

export async function getPendingCount(): Promise<number> {
  await mockDelay(50, 150);
  return timeOffStore.filter((r) => r.status === 'pending').length;
}
