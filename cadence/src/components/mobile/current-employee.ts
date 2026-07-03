// ─── Current Employee (mobile companion) ──────────────────────────────────────
// Hardcoded "logged in" employee for the employee-facing mobile views.
// Sam Reyes (emp_005) — Operations Associate, has shifts + attendance seeded
// for the current week (incl. today, Jun 29 2026: late clock-in on shift_002).

export const CURRENT_EMPLOYEE_ID = 'emp_005';
export const CURRENT_EMPLOYEE_FIRST_NAME = 'Sam';

// The rest of the app's seed data (shifts, attendance, notifications) is
// anchored to Monday June 29, 2026 as "today" — match that here rather than
// the real system clock so the mobile views line up with seeded records.
export const MOCK_TODAY_ISO = '2026-06-29';
