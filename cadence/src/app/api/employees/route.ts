import { NextRequest } from 'next/server';
import { executeQuery, executeStatement, sfText, sfNum, SF_DB, type SnowflakeBinding } from '@/lib/snowflake';
import type { Employee, EmploymentType, EmploymentStatus } from '@/types';

// ── Colour palette — deterministic from EMPLOYEE_KEY ─────────────────────────
const PALETTE = [
  '#7C6AC4', '#5A9B6E', '#C76054', '#3D4D8A', '#D4A04A',
  '#C9936B', '#6373B5', '#4A9B8E', '#B5736E', '#8A7A5E',
];

const DEPT_MAP: Record<string, string> = {
  Operations: 'dept_ops',
  Sales: 'dept_sales',
  'Front Desk': 'dept_front',
  Management: 'dept_mgmt',
};

const ROLE_MAP: Record<string, string> = {
  'Shift Lead': 'role_shift_lead',
  'Operations Associate': 'role_ops_associate',
  'Sales Representative': 'role_sales_rep',
  'Senior Sales Representative': 'role_senior_sales',
  Receptionist: 'role_receptionist',
  Concierge: 'role_concierge',
  'Location Manager': 'role_manager',
  Manager: 'role_manager',
};

const REVERSE_DEPT_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(DEPT_MAP).map(([name, id]) => [id, name])
);

const REVERSE_ROLE_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(ROLE_MAP).map(([name, id]) => [id, name])
);

interface SfEmployee {
  EMPLOYEE_KEY: string;
  EMPLOYEE_ID: string;
  FIRST_NAME: string;
  LAST_NAME: string;
  EMAIL: string;
  PHONE_NUMBER: string | null;
  JOB_TITLE: string;
  JOB_ROLE: string;
  DEPARTMENT: string;
  EMPLOYMENT_TYPE: string;
  HOURLY_RATE: string | null;
  SALARY_ANNUAL: string | null;
  EMPLOYMENT_STATUS: string;
  HIRE_DATE: string;
  TERMINATION_DATE: string | null;
  LOCATION_KEY: string;
  LOCATION_ID: string;
  BRAND_KEY: string;
  MANAGER_EMPLOYEE_KEY: string | null;
}

function mapEmployee(r: SfEmployee): Employee {
  const key = parseInt(r.EMPLOYEE_KEY, 10);
  const firstName = r.FIRST_NAME ?? '';
  const lastName = r.LAST_NAME ?? '';
  const empType = r.EMPLOYMENT_TYPE ?? 'Full-time';
  const empStatus = r.EMPLOYMENT_STATUS ?? 'Active';

  let status: Employee['status'] = 'active';
  if (empStatus === 'Inactive' || empStatus === 'Terminated') status = 'inactive';
  else if (empType === 'Part-time') status = 'part-time';

  return {
    id: r.EMPLOYEE_ID,
    name: `${firstName} ${lastName}`.trim(),
    email: r.EMAIL ?? '',
    initials: `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase(),
    avatarColor: PALETTE[key % PALETTE.length],
    roleId: ROLE_MAP[r.JOB_TITLE] ?? 'role_ops_associate',
    departmentId: DEPT_MAP[r.DEPARTMENT] ?? 'dept_ops',
    locationIds: [r.LOCATION_ID],
    scheduledHours: 0,
    contractHours: empType === 'Part-time' ? 32 : 40,
    status,
    skills: [],
    certifications: [],
    hourlyRate: r.HOURLY_RATE ? parseFloat(r.HOURLY_RATE) : 0,
    startDate: r.HIRE_DATE ?? '',
    // DIM_EMPLOYEE_CURATED columns
    employeeKey: key,
    brandKey: r.BRAND_KEY ? parseInt(r.BRAND_KEY, 10) : 1,
    locationKey: r.LOCATION_KEY ? parseInt(r.LOCATION_KEY, 10) : 1,
    locationId: r.LOCATION_ID,
    firstName,
    lastName,
    phoneNumber: r.PHONE_NUMBER ?? undefined,
    jobTitle: r.JOB_TITLE ?? '',
    jobRole: r.JOB_ROLE ?? '',
    department: r.DEPARTMENT ?? '',
    employmentType: empType as EmploymentType,
    hireDate: r.HIRE_DATE ?? '',
    terminationDate: r.TERMINATION_DATE ?? null,
    salaryAnnual: r.SALARY_ANNUAL ? parseFloat(r.SALARY_ANNUAL) : null,
    managerEmployeeKey: r.MANAGER_EMPLOYEE_KEY ? parseInt(r.MANAGER_EMPLOYEE_KEY, 10) : null,
    employmentStatus: empStatus as EmploymentStatus,
  };
}

async function handleUpdate(body: Partial<Employee> & { id?: string }) {
  try {
    const sets: string[] = [];
    const bindings: Record<string, SnowflakeBinding> = {};
    let bindIdx = 1;

    let firstName = body.firstName;
    let lastName = body.lastName;
    if (!firstName && !lastName && body.name) {
      const parts = body.name.trim().split(/\s+/);
      firstName = parts[0];
      lastName = parts.slice(1).join(' ');
    }
    if (firstName !== undefined) {
      sets.push(`FIRST_NAME = ?`);
      bindings[String(bindIdx++)] = sfText(firstName);
    }
    if (lastName !== undefined) {
      sets.push(`LAST_NAME = ?`);
      bindings[String(bindIdx++)] = sfText(lastName);
    }
    if (body.email !== undefined) {
      sets.push(`EMAIL = ?`);
      bindings[String(bindIdx++)] = sfText(body.email);
    }
    if (body.phoneNumber !== undefined) {
      sets.push(`PHONE_NUMBER = ?`);
      bindings[String(bindIdx++)] = sfText(body.phoneNumber);
    }
    if (body.hourlyRate !== undefined) {
      sets.push(`HOURLY_RATE = ?`);
      bindings[String(bindIdx++)] = sfNum(body.hourlyRate);
    }
    if (body.roleId !== undefined) {
      const title = REVERSE_ROLE_MAP[body.roleId];
      if (title) {
        sets.push(`JOB_TITLE = ?`);
        bindings[String(bindIdx++)] = sfText(title);
      }
    }
    if (body.departmentId !== undefined) {
      const dept = REVERSE_DEPT_MAP[body.departmentId];
      if (dept) {
        sets.push(`DEPARTMENT = ?`);
        bindings[String(bindIdx++)] = sfText(dept);
      }
    }
    if (body.employmentStatus !== undefined) {
      sets.push(`EMPLOYMENT_STATUS = ?`);
      bindings[String(bindIdx++)] = sfText(body.employmentStatus);
    } else if (body.status !== undefined) {
      const mapped = body.status === 'inactive' ? 'Inactive' : 'Active';
      sets.push(`EMPLOYMENT_STATUS = ?`);
      bindings[String(bindIdx++)] = sfText(mapped);
    }

    if (sets.length === 0) {
      return Response.json({ success: true });
    }

    bindings[String(bindIdx++)] = sfText(body.id!);

    await executeStatement(
      `UPDATE ${SF_DB}.DIM_EMPLOYEE_CURATED
       SET ${sets.join(', ')}
       WHERE EMPLOYEE_ID = ?`,
      bindings
    );

    return Response.json({ success: true });
  } catch (err) {
    console.error('[api/employees POST update]', err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const status = searchParams.get('status');
    const departmentId = searchParams.get('departmentId');
    const locationId = searchParams.get('locationId');

    let sql = `
      SELECT ec.EMPLOYEE_KEY, ec.EMPLOYEE_ID, ec.FIRST_NAME, ec.LAST_NAME,
             ec.EMAIL, ec.PHONE_NUMBER, ec.JOB_TITLE, ec.JOB_ROLE, ec.DEPARTMENT,
             ec.EMPLOYMENT_TYPE, ec.HOURLY_RATE, ec.SALARY_ANNUAL,
             ec.EMPLOYMENT_STATUS, ec.HIRE_DATE, ec.TERMINATION_DATE,
             ec.LOCATION_KEY, dl.LOCATION_ID, ec.BRAND_KEY, ec.MANAGER_EMPLOYEE_KEY
      FROM ${SF_DB}.DIM_EMPLOYEE_CURATED ec
      LEFT JOIN ${SF_DB}.DIM_LOCATION dl ON ec.LOCATION_KEY = dl.LOCATION_KEY AND dl.DEL_TS IS NULL
      WHERE ec.DEL_TS IS NULL
        AND ec.EMPLOYMENT_STATUS != 'Terminated'
    `;

    const bindings: Record<string, SnowflakeBinding> = {};
    let bindIdx = 1;

    if (locationId) {
      sql += ` AND dl.LOCATION_ID = ?`;
      bindings[String(bindIdx++)] = sfText(locationId);
    }

    sql += ` QUALIFY ROW_NUMBER() OVER (PARTITION BY ec.EMPLOYEE_ID ORDER BY ec.EMPLOYEE_KEY DESC) = 1`;
    sql += ` ORDER BY ec.LAST_NAME, ec.FIRST_NAME LIMIT 200`;

    const rows = await executeQuery<SfEmployee>(sql, bindings);
    let employees = rows.map(mapEmployee);

    // Client-side filters that Snowflake can't easily handle via column name
    if (status) {
      employees = employees.filter((e) => e.status === status);
    }
    if (departmentId) {
      employees = employees.filter((e) => e.departmentId === departmentId);
    }

    return Response.json(employees);
  } catch (err) {
    console.error('[api/employees GET]', err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Partial<Employee> & { id?: string; _action?: string };

    if (body._action === 'update' && body.id) {
      return handleUpdate(body);
    }

    const employeeId = `EMP${Date.now()}`;

    await executeStatement(
      `INSERT INTO ${SF_DB}.DIM_EMPLOYEE_CURATED (
        EMPLOYEE_ID, BRAND_KEY, LOCATION_KEY,
        FIRST_NAME, LAST_NAME, EMAIL, PHONE_NUMBER,
        JOB_TITLE, JOB_ROLE, DEPARTMENT, EMPLOYMENT_TYPE,
        HIRE_DATE, HOURLY_RATE, SALARY_ANNUAL,
        MANAGER_EMPLOYEE_KEY, EMPLOYMENT_STATUS,
        CREATED_TS, CREATED_USER
      ) VALUES (
        ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?,
        CURRENT_TIMESTAMP(), CURRENT_USER()
      )`,
      {
        '1': sfText(employeeId),
        '2': sfNum(body.brandKey ?? 1),
        '3': sfNum(body.locationKey ?? 1),
        '4': sfText(body.firstName ?? ''),
        '5': sfText(body.lastName ?? ''),
        '6': sfText(body.email ?? ''),
        '7': sfText(body.phoneNumber ?? ''),
        '8': sfText(body.jobTitle ?? ''),
        '9': sfText(body.jobRole ?? ''),
        '10': sfText(body.department ?? ''),
        '11': sfText(body.employmentType ?? 'Full-time'),
        '12': sfText(body.hireDate ?? new Date().toISOString().slice(0, 10)),
        '13': sfNum(body.hourlyRate ?? 0),
        '14': sfText(body.salaryAnnual != null ? String(body.salaryAnnual) : ''),
        '15': sfText(body.managerEmployeeKey != null ? String(body.managerEmployeeKey) : ''),
        '16': sfText('Active'),
      }
    );

    // Return the created employee
    const rows = await executeQuery<SfEmployee>(
      `SELECT ec.EMPLOYEE_KEY, ec.EMPLOYEE_ID, ec.FIRST_NAME, ec.LAST_NAME,
              ec.EMAIL, ec.PHONE_NUMBER, ec.JOB_TITLE, ec.JOB_ROLE, ec.DEPARTMENT,
              ec.EMPLOYMENT_TYPE, ec.HOURLY_RATE, ec.SALARY_ANNUAL,
              ec.EMPLOYMENT_STATUS, ec.HIRE_DATE, ec.TERMINATION_DATE,
              ec.LOCATION_KEY, dl.LOCATION_ID, ec.BRAND_KEY, ec.MANAGER_EMPLOYEE_KEY
       FROM ${SF_DB}.DIM_EMPLOYEE_CURATED ec
       LEFT JOIN ${SF_DB}.DIM_LOCATION dl ON ec.LOCATION_KEY = dl.LOCATION_KEY AND dl.DEL_TS IS NULL
       WHERE ec.EMPLOYEE_ID = ?`,
      { '1': sfText(employeeId) }
    );

    return Response.json(rows[0] ? mapEmployee(rows[0]) : { id: employeeId }, { status: 201 });
  } catch (err) {
    console.error('[api/employees POST]', err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
