import { NextRequest } from 'next/server';
import { executeQuery, sfText, SF_DB, type SnowflakeBinding } from '@/lib/snowflake';
import type { Location } from '@/types';

interface SfLocation {
  LOCATION_KEY: string;
  LOCATION_ID: string;
  BRAND_KEY: string | null;
  LOCATION_NAME: string;
  LOCATION_CODE: string | null;
  LOCATION_TYPE: string | null;
  ADDRESS_LINE1: string | null;
  ADDRESS_LINE2: string | null;
  CITY: string | null;
  STATE: string | null;
  POSTAL_CODE: string | null;
  COUNTRY: string | null;
  REGION: string | null;
  LATITUDE: string | null;
  LONGITUDE: string | null;
  TIMEZONE: string | null;
  IS_FRANCHISE_FLAG: string | null;
  DRIVE_THRU_FLAG: string | null;
  DELIVERY_ENABLED_FLAG: string | null;
  OPENING_DATE: string | null;
  CLOSING_DATE: string | null;
  LOCATION_STATUS: string | null;
  MANAGER_NAME: string | null;
  PHONE_NUMBER: string | null;
  EMAIL: string | null;
  CUSTOMER_NUMBER: string | null;
}

function mapLocation(r: SfLocation): Location {
  const key = parseInt(r.LOCATION_KEY, 10);
  const locId = r.LOCATION_ID;
  const lat = r.LATITUDE ? parseFloat(r.LATITUDE) : 0;
  const lng = r.LONGITUDE ? parseFloat(r.LONGITUDE) : 0;

  return {
    id: locId,
    name: r.LOCATION_NAME,
    address: [r.ADDRESS_LINE1, r.CITY, r.STATE, r.POSTAL_CODE].filter(Boolean).join(', '),
    coordinates: { lat, lng },
    geofenceRadius: 150,
    locationKey: key,
    locationId: locId,
    locationCode: r.LOCATION_CODE ?? '',
    locationType: r.LOCATION_TYPE ?? '',
    addressLine1: r.ADDRESS_LINE1 ?? '',
    addressLine2: r.ADDRESS_LINE2 ?? undefined,
    city: r.CITY ?? '',
    state: r.STATE ?? '',
    postalCode: r.POSTAL_CODE ?? '',
    country: r.COUNTRY ?? 'US',
    region: r.REGION ?? '',
    latitude: lat,
    longitude: lng,
    timezone: r.TIMEZONE ?? 'America/Chicago',
    isFranchise: r.IS_FRANCHISE_FLAG === 'true' || r.IS_FRANCHISE_FLAG === '1',
    hasDriveThru: r.DRIVE_THRU_FLAG === 'true' || r.DRIVE_THRU_FLAG === '1',
    deliveryEnabled: r.DELIVERY_ENABLED_FLAG === 'true' || r.DELIVERY_ENABLED_FLAG === '1',
    openingDate: r.OPENING_DATE ?? '',
    closingDate: r.CLOSING_DATE ?? null,
    locationStatus: (r.LOCATION_STATUS ?? 'Active') as Location['locationStatus'],
    managerName: r.MANAGER_NAME ?? '',
    locationPhone: r.PHONE_NUMBER ?? undefined,
    locationEmail: r.EMAIL ?? '',
    customerNumber: r.CUSTOMER_NUMBER ?? '',
  };
}

export async function GET(_request: NextRequest) {
  try {
    const rows = await executeQuery<SfLocation>(
      `SELECT LOCATION_KEY, LOCATION_ID, BRAND_KEY, LOCATION_NAME, LOCATION_CODE,
              LOCATION_TYPE, ADDRESS_LINE1, ADDRESS_LINE2, CITY, STATE,
              POSTAL_CODE, COUNTRY, REGION, LATITUDE, LONGITUDE, TIMEZONE,
              IS_FRANCHISE_FLAG, DRIVE_THRU_FLAG, DELIVERY_ENABLED_FLAG,
              OPENING_DATE, CLOSING_DATE, LOCATION_STATUS,
              MANAGER_NAME, PHONE_NUMBER, EMAIL, CUSTOMER_NUMBER
       FROM ${SF_DB}.DIM_LOCATION
       WHERE (LOCATION_STATUS IS NULL OR LOCATION_STATUS != 'Closed')
         AND DEL_TS IS NULL
       ORDER BY LOCATION_NAME
       LIMIT 100`
    );
    return Response.json(rows.map(mapLocation));
  } catch (err) {
    console.error('[api/locations GET]', err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Partial<Location>;
    const locationId = `LOC${Date.now()}`;

    const { executeStatement, sfText: st } = await import('@/lib/snowflake');
    await executeStatement(
        `INSERT INTO ${SF_DB}.DIM_LOCATION (
          LOCATION_ID, LOCATION_NAME, LOCATION_CODE, LOCATION_TYPE,
          ADDRESS_LINE1, CITY, STATE, POSTAL_CODE, COUNTRY, REGION,
          LATITUDE, LONGITUDE, TIMEZONE, LOCATION_STATUS,
          MANAGER_NAME, PHONE_NUMBER, EMAIL, CUSTOMER_NUMBER,
          CREATED_AT
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP())`,
        {
          '1': st(locationId),
          '2': st(body.name ?? ''),
          '3': st(body.locationCode ?? ''),
          '4': st(body.locationType ?? 'Retail'),
          '5': st(body.addressLine1 ?? ''),
          '6': st(body.city ?? ''),
          '7': st(body.state ?? ''),
          '8': st(body.postalCode ?? ''),
          '9': st(body.country ?? 'US'),
          '10': st(body.region ?? ''),
          '11': st(String(body.latitude ?? 0)),
          '12': st(String(body.longitude ?? 0)),
          '13': st(body.timezone ?? 'America/Chicago'),
          '14': st('Active'),
          '15': st(body.managerName ?? ''),
          '16': st(body.locationPhone ?? ''),
          '17': st(body.locationEmail ?? ''),
          '18': st(body.customerNumber ?? ''),
        }
      );

    return Response.json({ id: locationId, locationId, ...body }, { status: 201 });
  } catch (err) {
    console.error('[api/locations POST]', err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json() as Partial<Location> & { id: string };
    const { id } = body;
    const { executeStatement, sfText: st } = await import('@/lib/snowflake');

    const sets: string[] = [];
    const bindings: Record<string, SnowflakeBinding> = {};
    let bindIdx = 1;

    if (body.name) { sets.push(`LOCATION_NAME = ?`); bindings[String(bindIdx++)] = sfText(body.name); }
    if (body.locationStatus) { sets.push(`LOCATION_STATUS = ?`); bindings[String(bindIdx++)] = st(body.locationStatus); }
    if (body.managerName) { sets.push(`MANAGER_NAME = ?`); bindings[String(bindIdx++)] = st(body.managerName); }

    if (sets.length > 0) {
      sets.push(`UPDATED_AT = CURRENT_TIMESTAMP()`);
      bindings[String(bindIdx++)] = sfText(id);
      await executeStatement(
        `UPDATE ${SF_DB}.DIM_LOCATION SET ${sets.join(', ')} WHERE LOCATION_ID = ?`,
        bindings
      );
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error('[api/locations PATCH]', err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}

