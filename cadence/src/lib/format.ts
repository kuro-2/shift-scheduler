// ─── Currency Formatters ──────────────────────────────────────────────────────

/**
 * Formats a number as USD currency.
 * @example formatCurrency(1234.5) → "$1,234.50"
 */
export function formatCurrency(
  amount: number,
  currency = 'USD',
  locale = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formats a number as compact currency (e.g., "$1.2K", "$45K").
 */
export function formatCurrencyCompact(amount: number, locale = 'en-US'): string {
  if (Math.abs(amount) >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(amount) >= 1_000) {
    return `$${(amount / 1_000).toFixed(1)}K`;
  }
  return formatCurrency(amount, 'USD', locale);
}

/**
 * Formats an hourly rate.
 * @example formatHourlyRate(18.5) → "$18.50/hr"
 */
export function formatHourlyRate(rate: number): string {
  return `${formatCurrency(rate)}/hr`;
}

// ─── Duration Formatters ──────────────────────────────────────────────────────

/**
 * Formats minutes as "Xh Ym" (e.g., "7h 30m").
 */
export function formatDuration(minutes: number): string {
  if (minutes <= 0) return '0m';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/**
 * Formats hours as "X.Xh" (e.g., "7.5h").
 */
export function formatHours(hours: number, decimals = 1): string {
  return `${hours.toFixed(decimals)}h`;
}

/**
 * Formats a number of hours with sign for overtime context.
 * @example formatHoursDelta(2.5) → "+2.5h"  formatHoursDelta(-1) → "-1.0h"
 */
export function formatHoursDelta(hours: number): string {
  const sign = hours >= 0 ? '+' : '';
  return `${sign}${hours.toFixed(1)}h`;
}

/**
 * Formats minutes from shift start/end time strings as "X hr Y min".
 */
export function formatShiftDuration(
  startTime: string,
  endTime: string,
  breakMinutes = 0
): string {
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  let totalMinutes = (eh * 60 + em) - (sh * 60 + sm);
  if (totalMinutes < 0) totalMinutes += 24 * 60; // overnight
  const net = Math.max(0, totalMinutes - breakMinutes);
  return formatDuration(net);
}

// ─── Number Formatters ────────────────────────────────────────────────────────

/**
 * Formats a number with commas.
 * @example formatNumber(1234567) → "1,234,567"
 */
export function formatNumber(n: number, locale = 'en-US'): string {
  return new Intl.NumberFormat(locale).format(n);
}

/**
 * Formats a percentage.
 * @example formatPercent(0.875) → "87.5%"
 */
export function formatPercent(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Formats a percentage change with sign and color hint.
 * @example formatPercentChange(5.2) → "+5.2%"
 */
export function formatPercentChange(change: number, decimals = 1): string {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(decimals)}%`;
}

/**
 * Formats a score out of 100 as "XX%"
 */
export function formatScore(score: number): string {
  return `${Math.round(score)}%`;
}

// ─── Name Formatters ──────────────────────────────────────────────────────────

/**
 * Returns the first name from a full name string.
 */
export function getFirstName(fullName: string): string {
  return fullName.split(' ')[0] ?? fullName;
}

/**
 * Returns a shortened name like "Alex M."
 */
export function formatShortName(fullName: string): string {
  const parts = fullName.trim().split(' ');
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

// ─── Status Label Formatters ─────────────────────────────────────────────────

/**
 * Converts a snake_case status into a human-readable label.
 */
export function formatStatus(status: string): string {
  return status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Formats a TimeOffType into a display label.
 */
export function formatTimeOffType(type: string): string {
  const map: Record<string, string> = {
    vacation: 'Vacation',
    sick: 'Sick Leave',
    personal: 'Personal',
    unpaid: 'Unpaid Leave',
  };
  return map[type] ?? formatStatus(type);
}

/**
 * Formats shift status into a display label.
 */
export function formatShiftStatus(status: string): string {
  const map: Record<string, string> = {
    filled: 'Scheduled',
    open: 'Open',
    conflict: 'Conflict',
    draft: 'Draft',
  };
  return map[status] ?? formatStatus(status);
}

/**
 * Formats an attendance status into a display label.
 */
export function formatAttendanceStatus(status: string): string {
  const map: Record<string, string> = {
    on_time: 'On Time',
    late: 'Late',
    early: 'Left Early',
    no_show: 'No Show',
    on_shift: 'On Shift',
    on_break: 'On Break',
    complete: 'Complete',
    sick: 'Called Sick',
  };
  return map[status] ?? formatStatus(status);
}
