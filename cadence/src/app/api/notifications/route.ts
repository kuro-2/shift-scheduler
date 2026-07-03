import { NextRequest } from 'next/server';
import { executeQuery, executeStatement, sfText, SF_DB, type SnowflakeBinding } from '@/lib/snowflake';
import type { Notification } from '@/types';

interface SfNotification {
  NOTIFICATION_ID: string;
  RECIPIENT_USERNAME: string;
  LOCATION_ID: string;
  NOTIFICATION_TYPE: string;
  TITLE: string;
  SUBTITLE: string | null;
  ACTOR_EMPLOYEE_ID: string | null;
  IS_READ: string;
  LINK: string | null;
  CREATED_AT: string;
}

const TABLE = `${SF_DB}.APP_NOTIFICATIONS`;

async function tableExists(): Promise<boolean> {
  try {
    await executeQuery(`SELECT COUNT(*) FROM ${TABLE} LIMIT 1`);
    return true;
  } catch {
    return false;
  }
}

function mapNotification(r: SfNotification): Notification {
  return {
    id: r.NOTIFICATION_ID,
    type: r.NOTIFICATION_TYPE as Notification['type'],
    title: r.TITLE,
    subtitle: r.SUBTITLE ?? '',
    actorId: r.ACTOR_EMPLOYEE_ID ?? undefined,
    unread: r.IS_READ === 'false' || r.IS_READ === '0' || r.IS_READ === 'FALSE',
    createdAt: r.CREATED_AT,
    link: r.LINK ?? undefined,
  };
}

export async function GET(request: NextRequest) {
  try {
    if (!(await tableExists())) return Response.json([]);

    const { searchParams } = request.nextUrl;
    const username = searchParams.get('username') ?? '';
    const locationId = searchParams.get('locationId') ?? '';

    const rows = await executeQuery<SfNotification>(
      `SELECT NOTIFICATION_ID, RECIPIENT_USERNAME, LOCATION_ID,
              NOTIFICATION_TYPE, TITLE, SUBTITLE, ACTOR_EMPLOYEE_ID,
              IS_READ, LINK, CREATED_AT
       FROM ${TABLE}
       WHERE (? = '' OR RECIPIENT_USERNAME = ?)
         AND (? = '' OR LOCATION_ID = ?)
         AND (EXPIRES_AT IS NULL OR EXPIRES_AT > CURRENT_TIMESTAMP())
       ORDER BY CREATED_AT DESC
       LIMIT 50`,
      {
        '1': sfText(username),
        '2': sfText(username),
        '3': sfText(locationId),
        '4': sfText(locationId),
      }
    );

    return Response.json(rows.map(mapNotification));
  } catch (err) {
    console.error('[api/notifications GET]', err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    if (!(await tableExists())) return Response.json({ success: true });

    const { ids, markAll } = await request.json() as { ids?: string[]; markAll?: boolean };

    if (markAll) {
      await executeStatement(
        `UPDATE ${TABLE} SET IS_READ = TRUE WHERE IS_READ = FALSE`
      );
    } else if (ids && ids.length > 0) {
      const placeholders = ids.map((_, i) => `?`).join(', ');
      const bindings: Record<string, SnowflakeBinding> = {};
      ids.forEach((id, i) => {
        bindings[String(i + 1)] = sfText(id);
      });
      await executeStatement(
        `UPDATE ${TABLE} SET IS_READ = TRUE WHERE NOTIFICATION_ID IN (${placeholders})`,
        bindings
      );
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error('[api/notifications PATCH]', err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}

