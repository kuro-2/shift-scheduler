import { NextRequest } from 'next/server';
import { executeQuery, executeStatement, sfText, SF_DB, type SnowflakeBinding } from '@/lib/snowflake';
import type { TimeOffRequest } from '@/types';

interface SfTimeOff {
  REQUEST_ID: string;
  EMPLOYEE_ID: string;
  LOCATION_ID: string;
  REQUEST_TYPE: string;
  START_DATE: string;
  END_DATE: string;
  REASON: string | null;
  STATUS: string;
  SUBMITTED_AT: string | null;
  DECIDED_AT: string | null;
  DECIDED_BY: string | null;
  MANAGER_COMMENT: string | null;
}

const TABLE = `${SF_DB}.APP_TIME_OFF_REQUESTS`;

async function ensureTable(): Promise<boolean> {
  try {
    await executeQuery(`SELECT COUNT(*) FROM ${TABLE} LIMIT 1`);
    return true;
  } catch {
    return false;
  }
}

function mapTimeOff(r: SfTimeOff): TimeOffRequest {
  return {
    id: r.REQUEST_ID,
    employeeId: r.EMPLOYEE_ID,
    type: r.REQUEST_TYPE as TimeOffRequest['type'],
    startDate: r.START_DATE,
    endDate: r.END_DATE,
    reason: r.REASON ?? '',
    status: r.STATUS as TimeOffRequest['status'],
    submittedAt: r.SUBMITTED_AT ?? new Date().toISOString(),
    decidedAt: r.DECIDED_AT ?? undefined,
    decidedBy: r.DECIDED_BY ?? undefined,
    managerComment: r.MANAGER_COMMENT ?? undefined,
  };
}

export async function GET(request: NextRequest) {
  try {
    if (!(await ensureTable())) return Response.json([]);

    const { searchParams } = request.nextUrl;
    const status = searchParams.get('status');
    const employeeId = searchParams.get('employeeId');
    const locationId = searchParams.get('locationId');

    const bindings: Record<string, SnowflakeBinding> = {};
    let bindIdx = 1;
    let sql = `SELECT REQUEST_ID, EMPLOYEE_ID, LOCATION_ID, REQUEST_TYPE,
                      START_DATE, END_DATE, REASON, STATUS, SUBMITTED_AT,
                      DECIDED_AT, DECIDED_BY, MANAGER_COMMENT
               FROM ${TABLE} WHERE 1=1`;

    if (status) {
      sql += ` AND STATUS = ?`;
      bindings[String(bindIdx++)] = sfText(status);
    }
    if (employeeId) {
      sql += ` AND EMPLOYEE_ID = ?`;
      bindings[String(bindIdx++)] = sfText(employeeId);
    }
    if (locationId) {
      sql += ` AND LOCATION_ID = ?`;
      bindings[String(bindIdx++)] = sfText(locationId);
    }
    sql += ` ORDER BY SUBMITTED_AT DESC LIMIT 100`;

    const rows = await executeQuery<SfTimeOff>(sql, bindIdx > 1 ? bindings : undefined);
    return Response.json(rows.map(mapTimeOff));
  } catch (err) {
    console.error('[api/time-off GET]', err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await ensureTable())) {
      return Response.json({ error: 'APP_TIME_OFF_REQUESTS table does not exist. Run the DDL in SCHEMA_MAPPING.md Â§4 first.' }, { status: 503 });
    }

    const body = await request.json() as Partial<TimeOffRequest> & { locationId?: string };
    const id = `TOR_${Date.now()}`;

    await executeStatement(
      `INSERT INTO ${TABLE} (REQUEST_ID, EMPLOYEE_ID, LOCATION_ID, REQUEST_TYPE,
        START_DATE, END_DATE, REASON, STATUS, SUBMITTED_AT, CREATED_AT, UPDATED_AT)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP())`,
      {
        '1': sfText(id),
        '2': sfText(body.employeeId ?? ''),
        '3': sfText(body.locationId ?? ''),
        '4': sfText(body.type ?? 'personal'),
        '5': sfText(body.startDate ?? ''),
        '6': sfText(body.endDate ?? ''),
        '7': sfText(body.reason ?? ''),
      }
    );

    const created: TimeOffRequest = {
      id,
      employeeId: body.employeeId ?? '',
      type: body.type ?? 'personal',
      startDate: body.startDate ?? '',
      endDate: body.endDate ?? '',
      reason: body.reason ?? '',
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };

    return Response.json(created, { status: 201 });
  } catch (err) {
    console.error('[api/time-off POST]', err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}

