import {
  format,
  parseISO,
  startOfWeek,
  endOfWeek,
  addDays,
  addWeeks,
  subWeeks,
  isSameDay,
  isToday,
  isWithinInterval,
  differenceInMinutes,
  differenceInHours,
  differenceInCalendarDays,
  eachDayOfInterval,
  getDay,
  setHours,
  setMinutes,
  startOfDay,
  endOfDay,
  formatDistanceToNow,
  isPast,
  isFuture,
  isValid,
  parse,
} from 'date-fns';

// ─── Week Helpers ─────────────────────────────────────────────────────────────

/**
 * Returns the Monday of the week containing the given date.
 */
export function getWeekStart(date: Date | string): Date {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return startOfWeek(d, { weekStartsOn: 1 });
}

/**
 * Returns the Sunday of the week containing the given date.
 */
export function getWeekEnd(date: Date | string): Date {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return endOfWeek(d, { weekStartsOn: 1 });
}

/**
 * Returns an array of 7 Date objects for the week (Mon–Sun) containing the given date.
 */
export function getWeekDays(date: Date | string): Date[] {
  const start = getWeekStart(date);
  return eachDayOfInterval({ start, end: addDays(start, 6) });
}

/**
 * Returns the ISO week string "YYYY-MM-DD" for the Monday of the given date's week.
 */
export function getWeekKey(date: Date | string): string {
  return format(getWeekStart(date), 'yyyy-MM-dd');
}

/**
 * Advances a week by n weeks (+/-).
 */
export function shiftWeek(weekStart: Date | string, n: number): Date {
  const d = typeof weekStart === 'string' ? parseISO(weekStart) : weekStart;
  return n >= 0 ? addWeeks(d, n) : subWeeks(d, Math.abs(n));
}

// ─── Formatting ───────────────────────────────────────────────────────────────

/**
 * Formats a date as "Mon, Jun 22"
 */
export function formatDayLabel(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'EEE, MMM d');
}

/**
 * Formats a date as "Jun 22"
 */
export function formatShortDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM d');
}

/**
 * Formats a date as "Monday, June 22, 2026"
 */
export function formatLongDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'EEEE, MMMM d, yyyy');
}

/**
 * Formats a date as "2026-06-22" (ISO date only).
 */
export function formatISODate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Formats a time string "HH:mm" to "9:00 AM"
 */
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const d = setMinutes(setHours(new Date(), hours), minutes);
  return format(d, 'h:mm a');
}

/**
 * Formats a range like "9:00 AM – 5:00 PM"
 */
export function formatTimeRange(startTime: string, endTime: string): string {
  return `${formatTime(startTime)} – ${formatTime(endTime)}`;
}

/**
 * Formats a week range as "Jun 22 – Jun 28, 2026"
 */
export function formatWeekRange(weekStart: Date | string): string {
  const start = typeof weekStart === 'string' ? parseISO(weekStart) : weekStart;
  const end = addDays(start, 6);
  if (format(start, 'MMM yyyy') === format(end, 'MMM yyyy')) {
    return `${format(start, 'MMM d')} – ${format(end, 'd, yyyy')}`;
  }
  return `${format(start, 'MMM d')} – ${format(end, 'MMM d, yyyy')}`;
}

/**
 * Returns a relative time string like "2 hours ago" or "in 3 days"
 */
export function formatRelative(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

/**
 * Formats an ISO datetime to "Jun 22 at 9:00 AM"
 */
export function formatDateTime(datetime: string): string {
  const d = parseISO(datetime);
  return format(d, "MMM d 'at' h:mm a");
}

// ─── Shift Duration ───────────────────────────────────────────────────────────

/**
 * Calculates the net working minutes for a shift (total - break).
 */
export function getShiftMinutes(
  startTime: string,
  endTime: string,
  breakMinutes = 0
): number {
  const base = new Date();
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  const start = setMinutes(setHours(base, sh), sm);
  let end = setMinutes(setHours(base, eh), em);
  // Handle overnight shifts
  if (end <= start) {
    end = new Date(end.getTime() + 24 * 60 * 60 * 1000);
  }
  return Math.max(0, differenceInMinutes(end, start) - breakMinutes);
}

/**
 * Calculates the net working hours for a shift (total - break).
 */
export function getShiftHours(
  startTime: string,
  endTime: string,
  breakMinutes = 0
): number {
  return getShiftMinutes(startTime, endTime, breakMinutes) / 60;
}

// ─── Comparison Helpers ───────────────────────────────────────────────────────

export { isSameDay, isToday, isPast, isFuture, isValid, parseISO, format };

/**
 * Checks if a date string falls within a date range (inclusive).
 */
export function isInRange(date: string, start: string, end: string): boolean {
  const d = parseISO(date);
  return isWithinInterval(d, {
    start: startOfDay(parseISO(start)),
    end: endOfDay(parseISO(end)),
  });
}

/**
 * Returns the number of calendar days between two dates.
 */
export function daysBetween(start: string, end: string): number {
  return Math.abs(differenceInCalendarDays(parseISO(end), parseISO(start))) + 1;
}

/**
 * Returns the number of hours between two ISO datetime strings.
 */
export function hoursBetween(start: string, end: string): number {
  return Math.abs(differenceInHours(parseISO(end), parseISO(start)));
}

/**
 * Returns today's ISO date string (YYYY-MM-DD).
 */
export function today(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

/**
 * Returns the current week's Monday as an ISO date string.
 */
export function currentWeekStart(): string {
  return format(getWeekStart(new Date()), 'yyyy-MM-dd');
}

/**
 * Parses a "HH:mm" time string into total minutes since midnight.
 */
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Converts minutes since midnight to a "HH:mm" string.
 */
export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Checks if two time ranges overlap.
 */
export function timesOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);
  return s1 < e2 && e1 > s2;
}

// Re-export commonly used date-fns functions
export { addDays, addWeeks, subWeeks, getDay, eachDayOfInterval };
