import { NextRequest } from 'next/server';
import { executeStatement, sfText, sfNum, SF_RAW, type SnowflakeBinding } from '@/lib/snowflake';
import type { UpdateShiftInput } from '@/types';

function parseShiftId(id: string) {
  // id format: {locationId}_{workDate}_{shiftNo}_{employeeId|open}
  const parts = id.split('_');
  return {
    locationId: parts[0],
    workDate: parts[1],
    shiftNo: parseInt(parts[2], 10),
    employeeId: parts[3] === 'open' ? '' : (parts[3] ?? ''),
  };
}

function computeHours(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  let mins = eh * 60 + em - (sh * 60 + sm);
  if (mins < 0) mins += 24 * 60;
  return Math.round((mins / 60) * 100) / 100;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { locationId, workDate, shiftNo, employeeId } = parseShiftId(id);
    const body = await request.json() as UpdateShiftInput;

    const sets: string[] = [];
    const bindings: Record<string, SnowflakeBinding> = {};
    let bindIdx = 1;

    if (body.startTime !== undefined) {
      sets.push(`START_TIME = ?`);
      bindings[String(bindIdx++)] = sfText(body.startTime);
    }
    if (body.endTime !== undefined) {
      sets.push(`END_TIME = ?`);
      bindings[String(bindIdx++)] = sfText(body.endTime);
    }
    if (body.employeeId !== undefined) {
      sets.push(`EMPLOYEE_ID = ?`);
      bindings[String(bindIdx++)] = sfText(body.employeeId ?? '');
    }
    if (body.startTime !== undefined && body.endTime !== undefined) {
      const grossHours = computeHours(body.startTime, body.endTime);
      const netHours = Math.max(0, grossHours - (body.breakMinutes ?? 0) / 60);
      sets.push(`HOURS_WORKED = ?`);
      bindings[String(bindIdx++)] = sfNum(Math.round(netHours * 100) / 100);
    }

    if (sets.length > 0) {
      sets.push(`UPDATED_AT = CURRENT_TIMESTAMP()`, `UPDATED_USER = CURRENT_USER()`);
      bindings[String(bindIdx++)] = sfText(locationId);
      bindings[String(bindIdx++)] = sfText(workDate);
      bindings[String(bindIdx++)] = sfNum(shiftNo);
      bindings[String(bindIdx++)] = sfText(employeeId);

      await executeStatement(
        `UPDATE ${SF_RAW}.STORE_MANUAL_LABOR_HOURS
         SET ${sets.join(', ')}
         WHERE LOCATION_ID = ? AND WORK_DATE = ? AND SHIFT_NO = ? AND EMPLOYEE_ID = ?`,
        bindings
      );
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error('[api/shifts/[id] PATCH]', err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { locationId, workDate, shiftNo, employeeId } = parseShiftId(id);

    await executeStatement(
      `DELETE FROM ${SF_RAW}.STORE_MANUAL_LABOR_HOURS
       WHERE LOCATION_ID = ? AND WORK_DATE = ? AND SHIFT_NO = ? AND EMPLOYEE_ID = ?`,
      {
        '1': sfText(locationId),
        '2': sfText(workDate),
        '3': sfNum(shiftNo),
        '4': sfText(employeeId),
      }
    );

    return Response.json({ success: true });
  } catch (err) {
    console.error('[api/shifts/[id] DELETE]', err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
