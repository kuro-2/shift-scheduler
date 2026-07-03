import { NextRequest } from 'next/server';
import { executeQuery, executeStatement, sfText, sfNum, SF_RAW, type SnowflakeBinding } from '@/lib/snowflake';
import type { Shift, CreateShiftInput } from '@/types';

interface SfShift {
  EMPLOYEE_ID: string | null;
  LOCATION_ID: string;
  WORK_DATE: string;
  SHIFT_NO: string;
  DAY_NAME: string | null;
  START_TIME: string;
  END_TIME: string;
  HOURS_WORKED: string;

}

function computeHours(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  let mins = eh * 60 + em - (sh * 60 + sm);
  if (mins < 0) mins += 24 * 60;
  return Math.round((mins / 60) * 100) / 100;
}

function mapShift(r: SfShift): Shift {
  const empId = r.EMPLOYEE_ID && r.EMPLOYEE_ID !== '' ? r.EMPLOYEE_ID : null;
  const shiftNo = parseInt(r.SHIFT_NO, 10);
  const id = `${r.LOCATION_ID}_${r.WORK_DATE}_${shiftNo}_${empId ?? 'open'}`;

  return {
    id,
    employeeId: empId,
    date: r.WORK_DATE,
    startTime: r.START_TIME,
    endTime: r.END_TIME,
    breakMinutes: 30,
    roleId: 'role_ops_associate',
    departmentId: 'dept_ops',
    locationId: r.LOCATION_ID,
    status: empId ? 'filled' : 'open',
    // Snowflake-aligned fields
    shiftNo,
    snowflakeLocationId: r.LOCATION_ID,
    snowflakeEmployeeId: empId ?? '',
    workDate: r.WORK_DATE,
    hoursWorked: r.HOURS_WORKED ? parseFloat(r.HOURS_WORKED) : computeHours(r.START_TIME, r.END_TIME)
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const weekStart = searchParams.get('weekStart');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const locationId = searchParams.get('locationId');
    const employeeId = searchParams.get('employeeId');

    let from = dateFrom;
    let to = dateTo;

    if (weekStart && !from) {
      const d = new Date(`${weekStart}T00:00:00Z`);
      from = weekStart;
      d.setUTCDate(d.getUTCDate() + 6);
      to = d.toISOString().slice(0, 10);
    }

    if (!from) {
      const now = new Date();
      from = now.toISOString().slice(0, 10);
      const end = new Date(now);
      end.setDate(end.getDate() + 6);
      to = end.toISOString().slice(0, 10);
    }

    const bindings: Record<string, SnowflakeBinding> = {
      '1': sfText(from),
      '2': sfText(to!),
    };
    let bindIdx = 3;

    let sql = `
      SELECT slh.EMPLOYEE_ID, slh.LOCATION_ID,
             TO_VARCHAR(slh.WORK_DATE, 'YYYY-MM-DD') AS WORK_DATE, slh.SHIFT_NO,
             slh.DAY_NAME,
             TO_VARCHAR(slh.START_TIME, 'HH24:MI') AS START_TIME,
             TO_VARCHAR(slh.END_TIME, 'HH24:MI') AS END_TIME,
             slh.HOURS_WORKED
      FROM ${SF_RAW}.STORE_MANUAL_LABOR_HOURS slh
      WHERE slh.WORK_DATE BETWEEN ? AND ?
    `;

    if (locationId) {
      sql += ` AND slh.LOCATION_ID = ?`;
      bindings[String(bindIdx++)] = sfText(locationId);
    }
    if (employeeId) {
      sql += ` AND slh.EMPLOYEE_ID = ?`;
      bindings[String(bindIdx++)] = sfText(employeeId);
    }

    sql += ` ORDER BY slh.WORK_DATE, slh.START_TIME LIMIT 5000`;

    const rows = await executeQuery<SfShift>(sql, bindings);
    return Response.json(rows.map(mapShift));
  } catch (err) {
    console.error('[api/shifts GET]', err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as CreateShiftInput;
    const date = new Date(`${body.date}T00:00:00Z`);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });

    const hours = computeHours(body.startTime, body.endTime);

    // Get next shift number for this location + date
    const existing = await executeQuery<{ CNT: string }>(
      `SELECT COUNT(*) AS CNT FROM ${SF_RAW}.STORE_MANUAL_LABOR_HOURS
       WHERE LOCATION_ID = ? AND WORK_DATE = ?`,
      { '1': sfText(body.locationId), '2': sfText(body.date) }
    );
    const shiftNo = parseInt(existing[0]?.CNT ?? '0', 10) + 1;

    await executeStatement(
      `INSERT INTO ${SF_RAW}.STORE_MANUAL_LABOR_HOURS
         (EMPLOYEE_ID, LOCATION_ID, WORK_DATE, SHIFT_NO, DAY_NAME,
          START_TIME, END_TIME, HOURS_WORKED,
          CREATED_AT, CREATED_USER)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP(), CURRENT_USER())`,
      {
        '1': sfText(body.employeeId ?? ''),
        '2': sfText(body.locationId),
        '3': sfText(body.date),
        '4': sfNum(shiftNo),
        '5': sfText(dayName),
        '6': sfText(body.startTime),
        '7': sfText(body.endTime),
        '8': sfNum(hours),
        '9': sfText('HOURLY'),
      }
    );

    const empId = body.employeeId ?? null;
    const id = `${body.locationId}_${body.date}_${shiftNo}_${empId ?? 'open'}`;
    const shift: Shift = {
      id,
      employeeId: empId,
      date: body.date,
      startTime: body.startTime,
      endTime: body.endTime,
      breakMinutes: body.breakMinutes ?? 30,
      roleId: body.roleId,
      departmentId: body.departmentId,
      locationId: body.locationId,
      status: empId ? 'draft' : 'open',
      notes: body.notes,
      requiredSkills: body.requiredSkills,
      shiftNo,
      snowflakeLocationId: body.locationId,
      snowflakeEmployeeId: empId ?? '',
      workDate: body.date,
      hoursWorked: hours,
      payType: 'HOURLY',
    };

    return Response.json(shift, { status: 201 });
  } catch (err) {
    console.error('[api/shifts POST]', err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}

