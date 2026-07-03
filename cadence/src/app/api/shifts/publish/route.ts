import { NextRequest } from 'next/server';
import { executeQuery, executeStatement, sfText, sfNum, SF_DB, SF_RAW } from '@/lib/snowflake';

interface SfLaborRow {
  EMPLOYEE_ID: string;
  LOCATION_ID: string;
  HOURS_WORKED: string;
  HOURLY_RATE: string | null;
}

export async function POST(request: NextRequest) {
  try {
    const { weekStart } = await request.json() as { weekStart: string };
    const d = new Date(`${weekStart}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + 6);
    const weekEnd = d.toISOString().slice(0, 10);

    // Touch updated_at on all shifts in the window (marks as published)
    const affected = await executeStatement(
      `UPDATE ${SF_RAW}.STORE_MANUAL_LABOR_HOURS
       SET UPDATED_AT = CURRENT_TIMESTAMP(), UPDATED_USER = CURRENT_USER()
       WHERE WORK_DATE BETWEEN ? AND ?`,
      { '1': sfText(weekStart), '2': sfText(weekEnd) }
    );

    // Compute and upsert weekly labor summaries per employee per location
    const rows = await executeQuery<SfLaborRow>(
      `SELECT slh.EMPLOYEE_ID, slh.LOCATION_ID, slh.HOURS_WORKED, ec.HOURLY_RATE
       FROM ${SF_RAW}.STORE_MANUAL_LABOR_HOURS slh
       LEFT JOIN ${SF_DB}.DIM_EMPLOYEE_CURATED ec ON ec.EMPLOYEE_ID = slh.EMPLOYEE_ID AND ec.DEL_TS IS NULL
       WHERE slh.WORK_DATE BETWEEN ? AND ? AND slh.EMPLOYEE_ID != ''`,
      { '1': sfText(weekStart), '2': sfText(weekEnd) }
    );

    // Aggregate per employee
    const byEmployee: Record<string, { totalHours: number; payType: string; locationId: string; hourlyRate: number }> = {};
    for (const r of rows) {
      const key = `${r.LOCATION_ID}|${r.EMPLOYEE_ID}`;
      if (!byEmployee[key]) {
        byEmployee[key] = {
          totalHours: 0,
          locationId: r.LOCATION_ID,
          hourlyRate: r.HOURLY_RATE ? parseFloat(r.HOURLY_RATE) : 0,
        };
      }
      byEmployee[key].totalHours += parseFloat(r.HOURS_WORKED ?? '0');
    }

    // Upsert STORE_MANUAL_LABOR_WEEKLY_SUMMARY for each employee
    for (const [key, agg] of Object.entries(byEmployee)) {
      const [locId, empId] = key.split('|');
      const regHours = Math.min(agg.totalHours, 40);
      const otHours = Math.max(0, agg.totalHours - 40);
      const rate = agg.hourlyRate;
      const regCost = regHours * rate;
      const otCost = otHours * rate * 1.5;

      await executeStatement(
        `MERGE INTO ${SF_DB}.STORE_MANUAL_LABOR_WEEKLY_SUMMARY tgt
         USING (SELECT ? AS LOCATION_ID, ? AS EMPLOYEE_ID, ? AS WEEK_START_DT) src
            ON (tgt.LOCATION_ID = src.LOCATION_ID
            AND tgt.EMPLOYEE_ID = src.EMPLOYEE_ID
            AND tgt.WEEK_START_DT = src.WEEK_START_DT)
         WHEN MATCHED THEN UPDATE SET
           REG_HOURS = ?, OT_HOURS = ?, REG_COST = ?, OT_COST = ?,
           TOTAL_HOURS = ?, TOTAL_COST = ?,
           UPDATED_AT = CURRENT_TIMESTAMP()
         WHEN NOT MATCHED THEN INSERT
           (LOCATION_ID, EMPLOYEE_ID, WEEK_START_DT,
            REG_HOURS, OT_HOURS, REG_COST, OT_COST,
            TOTAL_HOURS, TOTAL_COST, IS_MANUAL_OVERRIDE, CREATED_AT)
         VALUES
           (src.LOCATION_ID, src.EMPLOYEE_ID, src.WEEK_START_DT,
            ?, ?, ?,
            ?, ?, ?, FALSE, CURRENT_TIMESTAMP())`,
        {
          '1': sfText(locId),
          '2': sfText(empId),
          '3': sfText(weekStart),
          '4': sfNum(regHours),
          '5': sfNum(otHours),
          '6': sfNum(regCost),
          '7': sfNum(otCost),
          '8': sfNum(agg.totalHours),
          '9': sfNum(regCost + otCost),
          '10': sfText(agg.payType),
          '11': sfNum(regHours),
          '12': sfNum(otHours),
          '13': sfNum(regCost),
          '14': sfNum(otCost),
          '15': sfNum(agg.totalHours),
          '16': sfNum(regCost + otCost),
          '17': sfText(agg.payType),
        }
      );
    }

    return Response.json({ published: affected });
  } catch (err) {
    console.error('[api/shifts/publish POST]', err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
