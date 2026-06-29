import type {
  ShiftStatus,
  EmployeeStatus,
  RequestStatus,
  AttendanceStatus,
  StatusConfig,
} from '@/types';

// ─── Shift Status ─────────────────────────────────────────────────────────────

export const SHIFT_STATUS_CONFIG: Record<ShiftStatus, StatusConfig> = {
  filled: {
    bg: 'var(--filled-bg)',
    text: 'var(--filled-text)',
    dot: 'var(--filled-dot)',
    border: 'var(--filled-border)',
    label: 'Scheduled',
  },
  open: {
    bg: 'var(--open-bg)',
    text: 'var(--open-text)',
    dot: 'var(--open-dot)',
    border: 'var(--open-border)',
    label: 'Open',
  },
  conflict: {
    bg: 'var(--conflict-bg)',
    text: 'var(--conflict-text)',
    dot: 'var(--conflict-dot)',
    border: 'var(--conflict-border)',
    label: 'Conflict',
  },
  draft: {
    bg: 'var(--draft-bg)',
    text: 'var(--draft-text)',
    dot: 'var(--draft-dot)',
    border: 'var(--draft-border)',
    label: 'Draft',
  },
};

export function getShiftStatusConfig(status: ShiftStatus): StatusConfig {
  return SHIFT_STATUS_CONFIG[status] ?? SHIFT_STATUS_CONFIG.draft;
}

// ─── Request Status ───────────────────────────────────────────────────────────

export const REQUEST_STATUS_CONFIG: Record<RequestStatus, StatusConfig> = {
  pending: {
    bg: 'var(--pending-bg)',
    text: 'var(--pending-text)',
    dot: 'var(--pending-dot)',
    border: 'var(--pending-border)',
    label: 'Pending',
  },
  approved: {
    bg: 'var(--filled-bg)',
    text: 'var(--filled-text)',
    dot: 'var(--filled-dot)',
    border: 'var(--filled-border)',
    label: 'Approved',
  },
  rejected: {
    bg: 'var(--conflict-bg)',
    text: 'var(--conflict-text)',
    dot: 'var(--conflict-dot)',
    border: 'var(--conflict-border)',
    label: 'Rejected',
  },
};

export function getRequestStatusConfig(status: RequestStatus): StatusConfig {
  return REQUEST_STATUS_CONFIG[status] ?? REQUEST_STATUS_CONFIG.pending;
}

// ─── Employee Status ──────────────────────────────────────────────────────────

export const EMPLOYEE_STATUS_CONFIG: Record<EmployeeStatus, StatusConfig> = {
  active: {
    bg: 'var(--filled-bg)',
    text: 'var(--filled-text)',
    dot: 'var(--filled-dot)',
    border: 'var(--filled-border)',
    label: 'Active',
  },
  'part-time': {
    bg: 'var(--pending-bg)',
    text: 'var(--pending-text)',
    dot: 'var(--pending-dot)',
    border: 'var(--pending-border)',
    label: 'Part-time',
  },
  inactive: {
    bg: 'var(--draft-bg)',
    text: 'var(--draft-text)',
    dot: 'var(--draft-dot)',
    border: 'var(--draft-border)',
    label: 'Inactive',
  },
};

export function getEmployeeStatusConfig(status: EmployeeStatus): StatusConfig {
  return EMPLOYEE_STATUS_CONFIG[status] ?? EMPLOYEE_STATUS_CONFIG.inactive;
}

// ─── Attendance Status ────────────────────────────────────────────────────────

export const ATTENDANCE_STATUS_CONFIG: Record<AttendanceStatus, StatusConfig> = {
  on_time: {
    bg: 'var(--filled-bg)',
    text: 'var(--filled-text)',
    dot: 'var(--filled-dot)',
    border: 'var(--filled-border)',
    label: 'On Time',
  },
  late: {
    bg: 'var(--conflict-bg)',
    text: 'var(--conflict-text)',
    dot: 'var(--conflict-dot)',
    border: 'var(--conflict-border)',
    label: 'Late',
  },
  early: {
    bg: 'var(--open-bg)',
    text: 'var(--open-text)',
    dot: 'var(--open-dot)',
    border: 'var(--open-border)',
    label: 'Left Early',
  },
  no_show: {
    bg: 'var(--conflict-bg)',
    text: 'var(--conflict-text)',
    dot: 'var(--conflict-dot)',
    border: 'var(--conflict-border)',
    label: 'No Show',
  },
  on_shift: {
    bg: 'var(--filled-bg)',
    text: 'var(--filled-text)',
    dot: 'var(--filled-dot)',
    border: 'var(--filled-border)',
    label: 'On Shift',
  },
  on_break: {
    bg: 'var(--open-bg)',
    text: 'var(--open-text)',
    dot: 'var(--open-dot)',
    border: 'var(--open-border)',
    label: 'On Break',
  },
  complete: {
    bg: 'var(--filled-bg)',
    text: 'var(--filled-text)',
    dot: 'var(--filled-dot)',
    border: 'var(--filled-border)',
    label: 'Complete',
  },
  sick: {
    bg: 'var(--draft-bg)',
    text: 'var(--draft-text)',
    dot: 'var(--draft-dot)',
    border: 'var(--draft-border)',
    label: 'Called Sick',
  },
};

export function getAttendanceStatusConfig(status: AttendanceStatus): StatusConfig {
  return ATTENDANCE_STATUS_CONFIG[status] ?? ATTENDANCE_STATUS_CONFIG.complete;
}

// ─── Warning Config ───────────────────────────────────────────────────────────

export const WARNING_CONFIG: Record<
  NonNullable<import('@/types').ShiftWarning>,
  { label: string; icon: string }
> = {
  overtime: { label: 'Overtime Alert', icon: 'clock' },
  overlap: { label: 'Shift Overlap', icon: 'alert-triangle' },
  missing_skill: { label: 'Missing Skill', icon: 'alert-circle' },
  underage_hours: { label: 'Under Contracted Hours', icon: 'trending-down' },
};

// ─── Department Colors ────────────────────────────────────────────────────────

export const DEPARTMENT_COLORS: Record<string, string> = {
  operations: '#7C6AC4',
  sales: '#5A9B6E',
  'front-desk': '#C76054',
  management: '#3D4D8A',
};

/**
 * Returns a consistent avatar background color for an employee
 * based on their avatar color string (which is seeded per-employee).
 */
export function getAvatarStyle(avatarColor: string): {
  backgroundColor: string;
  color: string;
} {
  return {
    backgroundColor: avatarColor + '22', // 13% opacity
    color: avatarColor,
  };
}
