import { NextRequest } from 'next/server';
import { executeStatement, sfText, SF_DB } from '@/lib/snowflake';

const TABLE = `${SF_DB}.APP_NOTIFICATIONS`;

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await executeStatement(
      `UPDATE ${TABLE} SET IS_READ = TRUE WHERE NOTIFICATION_ID = ?`,
      { '1': sfText(id) }
    );
    return Response.json({ success: true });
  } catch (err) {
    console.error('[api/notifications/[id] PATCH]', err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
