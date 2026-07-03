import type { Shift } from '@/types';

/** Net hours worked for a shift (gross time minus break), handling overnight shifts. */
export function netHours(shift: Pick<Shift, 'startTime' | 'endTime' | 'breakMinutes'>): number {
  const [sh, sm] = shift.startTime.split(':').map(Number);
  const [eh, em] = shift.endTime.split(':').map(Number);
  let mins = eh * 60 + em - (sh * 60 + sm);
  if (mins < 0) mins += 24 * 60;
  return Math.max(0, mins - shift.breakMinutes) / 60;
}

/** Formats a dollar amount as "$1,234.56". */
export function formatMoney(amount: number): string {
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
