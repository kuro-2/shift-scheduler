import { NextRequest } from 'next/server';
import { executeQuery, executeStatement, sfText, SF_DB, type SnowflakeBinding } from '@/lib/snowflake';
import type { AttendanceEvent } from '@/types';

interface SfAttendance {
  LABOR_KEY: string;
  EMPLOYEE_KEY: string;
  EMPLOYEE_ID: string;
  LOCATION_KEY: string;
  LOCATION_ID: string;
  WORK_DATE: string;
  CLOCK_IN_TIME: string | null;
  CLOCK_OUT_TIME: string | null;
  SCHEDULED_START_TIME: string | null;
  SCHEDULED_END_TIME: string | null;
  REGULAR_HOURS: string | null;
  OVERTIME_HOURS: string | null;
  BREAK_HOURS: string | null;
  TOTAL_HOURS: string | null;
  REGULAR_HOURLY_RATE: string | null;
  REGULAR_COST: string | null;
  OVERTIME_COST: string | null;
  TOTAL_LABOR_COST: string | null;
  ATTENDANCE_STATUS: string | null;
  IS_LATE: string | null;
  IS_NO_SHOW: string | null;
  LATE_MINUTES: string | null;
  TIPS_RECEIVED: string | null;
}

// Snowflake SQL REST API returns TIMESTAMP_NTZ as Unix epoch seconds (float string),
// DATE as days-since-epoch integer string, and TIME as seconds-since-midnight float string.
function sfTimestamp(v: string | null): string | undefined {
  if (!v) return undefined;
  const secs = parseFloat(v);
  if (isNaN(secs)) return undefined;
  return new Date(secs * 1000).toISOString();
}

function sfDate(v: string | null): string {
  if (!v) return '';
  const days = parseInt(v, 10);
  if (isNaN(days)) return v; // already a formatted date string
  const d = new Date(0);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function sfTime(v: string | null): string | undefined {
  if (!v) return undefined;
  const totalSecs = parseFloat(v);
  if (isNaN(totalSecs)) return v; // already formatted
  const h = Math.floor(totalSecs / 3600) % 24;
  const m = Math.floor((totalSecs % 3600) / 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function mapAttendance(r: SfAttendance): AttendanceEvent {
  return {
    id: `att_${r.LABOR_KEY}`,
    employeeId: r.EMPLOYEE_ID,
    shiftId: '',
    clockIn: sfTimestamp(r.CLOCK_IN_TIME),
    clockOut: sfTimestamp(r.CLOCK_OUT_TIME),
    breaks: [],
    gpsVerified: false,
    locationId: r.LOCATION_ID,
    status: (r.ATTENDANCE_STATUS as AttendanceEvent['status']) ?? 'scheduled',
    notes: undefined,
    // Snowflake FACT_LABOR_HOURS fields
    laborKey: parseInt(r.LABOR_KEY, 10),
    employeeKey: parseInt(r.EMPLOYEE_KEY, 10),
    locationKey: parseInt(r.LOCATION_KEY, 10),
    workDate: sfDate(r.WORK_DATE),
    scheduledStartTime: sfTime(r.SCHEDULED_START_TIME),
    scheduledEndTime: sfTime(r.SCHEDULED_END_TIME),
    regularHours: parseFloat(r.REGULAR_HOURS ?? '0'),
    overtimeHours: parseFloat(r.OVERTIME_HOURS ?? '0'),
    breakHours: parseFloat(r.BREAK_HOURS ?? '0'),
    totalHours: parseFloat(r.TOTAL_HOURS ?? '0'),
    regularHourlyRate: parseFloat(r.REGULAR_HOURLY_RATE ?? '0'),
    regularCost: parseFloat(r.REGULAR_COST ?? '0'),
    overtimeCost: parseFloat(r.OVERTIME_COST ?? '0'),
    totalLaborCost: parseFloat(r.TOTAL_LABOR_COST ?? '0'),
    lateMinutes: parseInt(r.LATE_MINUTES ?? '0', 10),
    tipsReceived: parseFloat(r.TIPS_RECEIVED ?? '0'),
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const date = searchParams.get('date');
    const locationId = searchParams.get('locationId');
    const employeeId = searchParams.get('employeeId');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    const bindings: Record<string, SnowflakeBinding> = {};
    let bindIdx = 1;
    let sql = `
      SELECT flh.LABOR_KEY, flh.EMPLOYEE_KEY, ec.EMPLOYEE_ID,
             flh.LOCATION_KEY, dl.LOCATION_ID,
             flh.WORK_DATE, flh.CLOCK_IN_TIME, flh.CLOCK_OUT_TIME,
             flh.SCHEDULED_START_TIME, flh.SCHEDULED_END_TIME,
             flh.REGULAR_HOURS, flh.OVERTIME_HOURS, flh.BREAK_HOURS, flh.TOTAL_HOURS,
             flh.REGULAR_HOURLY_RATE, flh.REGULAR_COST, flh.OVERTIME_COST, flh.TOTAL_LABOR_COST,
             flh.ATTENDANCE_STATUS, flh.IS_LATE, flh.IS_NO_SHOW, flh.LATE_MINUTES, flh.TIPS_RECEIVED
      FROM ${SF_DB}.FACT_LABOR_HOURS flh
      JOIN ${SF_DB}.DIM_EMPLOYEE_CURATED ec
        ON flh.EMPLOYEE_KEY = ec.EMPLOYEE_KEY AND ec.DEL_TS IS NULL
      JOIN ${SF_DB}.DIM_LOCATION dl
        ON flh.LOCATION_KEY = dl.LOCATION_KEY
      WHERE 1=1
    `;

    if (date) {
      sql += ` AND flh.WORK_DATE = TO_DATE(?)`;
      bindings[String(bindIdx++)] = sfText(date);
    } else if (dateFrom && dateTo) {
      sql += ` AND flh.WORK_DATE BETWEEN TO_DATE(?) AND TO_DATE(?)`;
      bindings[String(bindIdx++)] = sfText(dateFrom);
      bindings[String(bindIdx++)] = sfText(dateTo);
    }

    if (locationId) {
      sql += ` AND dl.LOCATION_ID = ?`;
      bindings[String(bindIdx++)] = sfText(locationId);
    }
    if (employeeId) {
      sql += ` AND ec.EMPLOYEE_ID = ?`;
      bindings[String(bindIdx++)] = sfText(employeeId);
    }

    sql += ` ORDER BY flh.WORK_DATE DESC, flh.CLOCK_IN_TIME DESC LIMIT 200`;

    const rows = await executeQuery<SfAttendance>(sql, bindings);
    return Response.json(rows.map(mapAttendance));
  } catch (err) {
    console.error('[api/attendance GET]', err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { laborKey, status, clockIn, clockOut } = await request.json() as {
      laborKey: number;
      status?: string;
      clockIn?: string;
      clockOut?: string;
    };

    const sets: string[] = [];
    const bindings: Record<string, SnowflakeBinding> = {};
    let bindIdx = 1;

    if (status) {
      sets.push(`ATTENDANCE_STATUS = ?`);
      bindings[String(bindIdx++)] = sfText(status);
    }
    if (clockIn !== undefined) {
      sets.push(`CLOCK_IN_TIME = ?`);
      bindings[String(bindIdx++)] = sfText(clockIn);
    }
    if (clockOut !== undefined) {
      sets.push(`CLOCK_OUT_TIME = ?`);
      bindings[String(bindIdx++)] = sfText(clockOut);
    }

    if (sets.length === 0) {
      return Response.json({ success: true });
    }

    sets.push(`UPDATED_AT = CURRENT_TIMESTAMP()`);
    bindings[String(bindIdx++)] = sfText(String(laborKey));

    await executeStatement(
      `UPDATE ${SF_DB}.FACT_LABOR_HOURS
       SET ${sets.join(', ')}
       WHERE LABOR_KEY = ?`,
      bindings
    );

    return Response.json({ success: true });
  } catch (err) {
    console.error('[api/attendance PATCH]', err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}

