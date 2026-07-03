import { NextRequest } from 'next/server';
import { executeQuery, sfText, SF_DB } from '@/lib/snowflake';

interface SfWeeklySummary {
  LOCATION_ID: string;
  EMPLOYEE_ID: string;
  WEEK_START_DT: string;
  REG_HOURS: string;
  OT_HOURS: string;
  REG_COST: string;
  OT_COST: string;
  TOTAL_HOURS: string;
  TOTAL_COST: string;
}

interface SfLaborHours {
  DEPARTMENT: string;
  TOTAL_LABOR_COST: string;
  REGULAR_HOURS: string;
  OVERTIME_HOURS: string;
  HEADCOUNT: string;
}

interface SfExpense {
  EXPENSE_TYPE: string;
  EXPENSE_MONTH: string;
  TOTAL_AMT: string;
}

interface SfTopPerformer {
  EMPLOYEE_ID: string;
  FIRST_NAME: string;
  LAST_NAME: string;
  DEPARTMENT: string;
  JOB_TITLE: string;
  TOTAL_HOURS: string;
  TOTAL_LABOR_COST: string;
  REGULAR_HOURS: string;
  OVERTIME_HOURS: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const locationId = searchParams.get('locationId') ?? '';
    const weekStart = searchParams.get('weekStart');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    const from = dateFrom ?? weekStart ?? new Date().toISOString().slice(0, 10);
    const toDate = dateTo ?? (() => {
      const d = new Date(`${from}T00:00:00Z`);
      d.setUTCDate(d.getUTCDate() + 6);
      return d.toISOString().slice(0, 10);
    })();

    // Weekly labor summary KPIs
    const summaryRows = await executeQuery<SfWeeklySummary>(
      `SELECT LOCATION_ID, EMPLOYEE_ID, WEEK_START_DT,
              REG_HOURS, OT_HOURS, REG_COST, OT_COST, TOTAL_HOURS, TOTAL_COST
       FROM ${SF_DB}.STORE_MANUAL_LABOR_WEEKLY_SUMMARY
       WHERE WEEK_START_DT BETWEEN ? AND ?
         AND (? = '' OR LOCATION_ID = ?)
       ORDER BY WEEK_START_DT`,
      {
        '1': sfText(from),
        '2': sfText(toDate),
        '3': sfText(locationId),
        '4': sfText(locationId),
      }
    );

    const totalLaborCost = summaryRows.reduce((s, r) => s + parseFloat(r.TOTAL_COST ?? '0'), 0);
    const totalRegHours = summaryRows.reduce((s, r) => s + parseFloat(r.REG_HOURS ?? '0'), 0);
    const totalOtHours = summaryRows.reduce((s, r) => s + parseFloat(r.OT_HOURS ?? '0'), 0);

    // Department breakdown from FACT_LABOR_HOURS
    const deptRows = await executeQuery<SfLaborHours>(
      `SELECT ec.DEPARTMENT,
              SUM(flh.TOTAL_LABOR_COST)  AS TOTAL_LABOR_COST,
              SUM(flh.REGULAR_HOURS)     AS REGULAR_HOURS,
              SUM(flh.OVERTIME_HOURS)    AS OVERTIME_HOURS,
              COUNT(DISTINCT flh.EMPLOYEE_KEY) AS HEADCOUNT
       FROM ${SF_DB}.FACT_LABOR_HOURS flh
       JOIN ${SF_DB}.DIM_EMPLOYEE_CURATED ec
         ON flh.EMPLOYEE_KEY = ec.EMPLOYEE_KEY AND ec.DEL_TS IS NULL
       JOIN ${SF_DB}.DIM_LOCATION dl
         ON flh.LOCATION_KEY = dl.LOCATION_KEY
       WHERE flh.WORK_DATE BETWEEN ? AND ?
         AND (? = '' OR dl.LOCATION_ID = ?)
       GROUP BY ec.DEPARTMENT
       ORDER BY TOTAL_LABOR_COST DESC`,
      {
        '1': sfText(from),
        '2': sfText(toDate),
        '3': sfText(locationId),
        '4': sfText(locationId),
      }
    );

    const DEPT_COLORS: Record<string, string> = {
      Operations: '#7C6AC4',
      Sales: '#5A9B6E',
      'Front Desk': '#C76054',
      Management: '#3D4D8A',
    };
    const DEPT_IDS: Record<string, string> = {
      Operations: 'dept_ops',
      Sales: 'dept_sales',
      'Front Desk': 'dept_front',
      Management: 'dept_mgmt',
    };

    const totalCostForPct = deptRows.reduce((s, r) => s + parseFloat(r.TOTAL_LABOR_COST ?? '0'), 0) || 1;
    const departmentBreakdown = deptRows.map((r) => {
      const cost = parseFloat(r.TOTAL_LABOR_COST ?? '0');
      const hours = parseFloat(r.REGULAR_HOURS ?? '0') + parseFloat(r.OVERTIME_HOURS ?? '0');
      return {
        departmentId: DEPT_IDS[r.DEPARTMENT] ?? 'dept_ops',
        name: r.DEPARTMENT,
        color: DEPT_COLORS[r.DEPARTMENT] ?? '#999',
        hours: Math.round(hours),
        cost: Math.round(cost),
        headcount: parseInt(r.HEADCOUNT ?? '0', 10),
        percentage: Math.round((cost / totalCostForPct) * 1000) / 10,
      };
    });

    // Top performers
    const topRows = await executeQuery<SfTopPerformer>(
      `SELECT ec.EMPLOYEE_ID, ec.FIRST_NAME, ec.LAST_NAME,
              ec.DEPARTMENT, ec.JOB_TITLE,
              SUM(flh.TOTAL_HOURS)       AS TOTAL_HOURS,
              SUM(flh.TOTAL_LABOR_COST)  AS TOTAL_LABOR_COST,
              SUM(flh.REGULAR_HOURS)     AS REGULAR_HOURS,
              SUM(flh.OVERTIME_HOURS)    AS OVERTIME_HOURS
       FROM ${SF_DB}.FACT_LABOR_HOURS flh
       JOIN ${SF_DB}.DIM_EMPLOYEE_CURATED ec
         ON flh.EMPLOYEE_KEY = ec.EMPLOYEE_KEY AND ec.DEL_TS IS NULL
       JOIN ${SF_DB}.DIM_LOCATION dl
         ON flh.LOCATION_KEY = dl.LOCATION_KEY
       WHERE flh.WORK_DATE BETWEEN ? AND ?
         AND (? = '' OR dl.LOCATION_ID = ?)
       GROUP BY ec.EMPLOYEE_ID, ec.FIRST_NAME, ec.LAST_NAME, ec.DEPARTMENT, ec.JOB_TITLE
       ORDER BY TOTAL_HOURS DESC
       LIMIT 5`,
      {
        '1': sfText(from),
        '2': sfText(toDate),
        '3': sfText(locationId),
        '4': sfText(locationId),
      }
    );

    const PALETTE = ['#7C6AC4', '#5A9B6E', '#C76054', '#3D4D8A', '#D4A04A'];
    const topPerformers = topRows.map((r, i) => ({
      employeeId: r.EMPLOYEE_ID,
      name: `${r.FIRST_NAME} ${r.LAST_NAME}`.trim(),
      initials: `${r.FIRST_NAME?.[0] ?? ''}${r.LAST_NAME?.[0] ?? ''}`.toUpperCase(),
      avatarColor: PALETTE[i % PALETTE.length],
      role: r.JOB_TITLE ?? '',
      department: r.DEPARTMENT ?? '',
      hoursWorked: parseFloat(r.TOTAL_HOURS ?? '0'),
      laborCost: parseFloat(r.TOTAL_LABOR_COST ?? '0'),
      overtimeHours: parseFloat(r.OVERTIME_HOURS ?? '0'),
      attendanceRate: 100,
    }));

    // Monthly expenses
    const expenseRows = await executeQuery<SfExpense>(
      `SELECT EXPENSE_TYPE, EXPENSE_MONTH,
              SUM(EXPENSE_AMT) AS TOTAL_AMT
       FROM ${SF_DB}.STORE_MANUAL_EXPENSES
       WHERE (? = '' OR LOCATION_ID = ?)
       GROUP BY EXPENSE_TYPE, EXPENSE_MONTH
       ORDER BY EXPENSE_MONTH DESC, TOTAL_AMT DESC
       LIMIT 50`,
      { '1': sfText(locationId), '2': sfText(locationId) }
    );

    const totalExpenses = expenseRows.reduce((s, r) => s + parseFloat(r.TOTAL_AMT ?? '0'), 0);

    const summary = {
      totalLaborCost: Math.round(totalLaborCost),
      regularHours: Math.round(totalRegHours),
      overtimeHours: Math.round(totalOtHours),
      totalHours: Math.round(totalRegHours + totalOtHours),
      totalExpenses: Math.round(totalExpenses),
      headcount: [...new Set(summaryRows.map((r) => r.EMPLOYEE_ID))].length,
    };

    // Labor cost trend (one point per week)
    const laborCostData = (() => {
      const byWeek: Record<string, number> = {};
      for (const r of summaryRows) {
        const w = r.WEEK_START_DT;
        byWeek[w] = (byWeek[w] ?? 0) + parseFloat(r.TOTAL_COST ?? '0');
      }
      return Object.entries(byWeek)
        .sort(([a], [b]) => a.localeCompare(b))
        .flatMap(([date, actual]) =>
          Array.from({ length: 7 }, (_, i) => {
            const d = new Date(`${date}T00:00:00Z`);
            d.setUTCDate(d.getUTCDate() + i);
            return {
              date: d.toISOString().slice(0, 10),
              actual: Math.round(actual / 7),
              budget: Math.round((actual / 7) * 1.05),
              projected: Math.round(actual / 7),
            };
          })
        );
    })();

    return Response.json({
      summary,
      laborCostData,
      departmentBreakdown,
      topPerformers,
      expenses: expenseRows.map((r) => ({
        expenseType: r.EXPENSE_TYPE,
        expenseMonth: r.EXPENSE_MONTH,
        totalExpenseAmt: parseFloat(r.TOTAL_AMT ?? '0'),
      })),
    });
  } catch (err) {
    console.error('[api/reports GET]', err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
