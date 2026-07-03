import type { Shift } from '@/types';

function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function shiftsOverlap(a: Shift, b: Shift): boolean {
  const aStart = toMinutes(a.startTime);
  const aEnd = toMinutes(a.endTime);
  const bStart = toMinutes(b.startTime);
  const bEnd = toMinutes(b.endTime);
  return aStart < bEnd && bStart < aEnd;
}

/** IDs of shifts that double-book the same employee on the same day (overlapping times). */
export function getConflictingShiftIds(shifts: Shift[]): Set<string> {
  const byEmployeeDay = new Map<string, Shift[]>();
  for (const shift of shifts) {
    if (!shift.employeeId) continue;
    const key = `${shift.employeeId}_${shift.date}`;
    if (!byEmployeeDay.has(key)) byEmployeeDay.set(key, []);
    byEmployeeDay.get(key)!.push(shift);
  }

  const conflicting = new Set<string>();
  for (const dayShifts of byEmployeeDay.values()) {
    for (let i = 0; i < dayShifts.length; i++) {
      for (let j = i + 1; j < dayShifts.length; j++) {
        if (shiftsOverlap(dayShifts[i], dayShifts[j])) {
          conflicting.add(dayShifts[i].id);
          conflicting.add(dayShifts[j].id);
        }
      }
    }
  }
  return conflicting;
}
