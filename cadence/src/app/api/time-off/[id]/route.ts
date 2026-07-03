import { NextRequest } from 'next/server';
import { executeStatement, sfText, SF_DB, type SnowflakeBinding } from '@/lib/snowflake';

const TABLE = `${SF_DB}.APP_TIME_OFF_REQUESTS`;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json() as {
      status?: string;
      managerComment?: string;
      decidedBy?: string;
    };

    const sets: string[] = [];
    const bindings: Record<string, SnowflakeBinding> = {};
    let bindIdx = 1;

    if (body.status) {
      sets.push(`STATUS = ?`, `DECIDED_AT = CURRENT_TIMESTAMP()`);
      bindings[String(bindIdx++)] = sfText(body.status);
    }
    if (body.managerComment !== undefined) {
      sets.push(`MANAGER_COMMENT = ?`);
      bindings[String(bindIdx++)] = sfText(body.managerComment);
    }
    if (body.decidedBy !== undefined) {
      sets.push(`DECIDED_BY = ?`);
      bindings[String(bindIdx++)] = sfText(body.decidedBy);
    }

    if (sets.length === 0) return Response.json({ success: true });

    sets.push(`UPDATED_AT = CURRENT_TIMESTAMP()`);
    bindings[String(bindIdx++)] = sfText(id);

    await executeStatement(
      `UPDATE ${TABLE} SET ${sets.join(', ')} WHERE REQUEST_ID = ?`,
      bindings
    );

    return Response.json({ success: true });
  } catch (err) {
    console.error('[api/time-off/[id] PATCH]', err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
