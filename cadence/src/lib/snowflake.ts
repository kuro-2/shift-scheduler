/**
 * Snowflake SQL REST API v2 client using Programmatic Access Token (PAT) auth.
 * Server-only — never import this in client components or service files.
 */

const ACCOUNT = process.env.SNOWFLAKE_ACCOUNT!;
const PAT = process.env.SNOWFLAKE_PAT!;
const DATABASE = process.env.SNOWFLAKE_DATABASE ?? 'DEV_NEXORA';
const SCHEMA = process.env.SNOWFLAKE_SCHEMA ?? 'ANALYTICS';
const RAW_SCHEMA = process.env.SNOWFLAKE_RAW_SCHEMA ?? 'RAW';
const WAREHOUSE = process.env.SNOWFLAKE_WAREHOUSE ?? 'DEV_NEXORA_WH';
const ROLE = process.env.SNOWFLAKE_ROLE;

const BASE_URL = `https://${ACCOUNT}.snowflakecomputing.com/api/v2/statements`;

/** Fully-qualified `DATABASE.SCHEMA` prefix for table names in SQL strings. */
export const SF_DB = `${DATABASE}.${SCHEMA}`;

/** Fully-qualified `DATABASE.RAW` prefix — STORE_MANUAL_LABOR_HOURS lives here, not in ANALYTICS. */
export const SF_RAW = `${DATABASE}.${RAW_SCHEMA}`;

const SF_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
  Authorization: `Bearer ${PAT}`,
  'X-Snowflake-Authorization-Token-Type': 'PROGRAMMATIC_ACCESS_TOKEN',
};

export interface SnowflakeBinding {
  type: 'TEXT' | 'FIXED' | 'REAL' | 'BOOLEAN' | 'DATE' | 'TIME' | 'TIMESTAMP_NTZ';
  value: string;
}

interface SfResult {
  code: string;
  message?: string;
  statementHandle: string;
  resultSetMetaData: { rowType: Array<{ name: string; type: string }> };
  data: string[][];
}

/** Execute a SQL statement and return results as an array of plain objects. */
export async function executeQuery<T = Record<string, string | null>>(
  statement: string,
  bindings?: Record<string, SnowflakeBinding>
): Promise<T[]> {
  const body: Record<string, unknown> = {
    statement,
    database: DATABASE,
    schema: SCHEMA,
    warehouse: WAREHOUSE,
    ...(ROLE ? { role: ROLE } : {}),
    timeout: 45,
  };
  if (bindings) body.bindings = bindings;

  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: SF_HEADERS,
    body: JSON.stringify(body),
  });

  const json = (await res.json()) as SfResult;

  if (!res.ok && json.code !== '333334') {
    throw new Error(`Snowflake error ${res.status}: ${json.message ?? JSON.stringify(json)}`);
  }

  if (json.code === '333334') {
    return pollHandle<T>(json.statementHandle);
  }

  return toObjects<T>(json);
}

/** Execute a DML statement (INSERT/UPDATE/DELETE/MERGE). Returns rows-affected count. */
export async function executeStatement(
  statement: string,
  bindings?: Record<string, SnowflakeBinding>
): Promise<number> {
  const rows = await executeQuery<{ 'number of rows affected': string }>(statement, bindings);
  const first = rows[0];
  if (!first) return 0;
  const val = Object.values(first)[0];
  return parseInt(val ?? '0', 10);
}

async function pollHandle<T>(handle: string): Promise<T[]> {
  for (let i = 0; i < 15; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const res = await fetch(`${BASE_URL}/${handle}`, { headers: SF_HEADERS });
    const json = (await res.json()) as SfResult;
    if (json.code === '090001') return toObjects<T>(json);
  }
  throw new Error('Snowflake query timed out after 30 seconds');
}

function toObjects<T>(result: SfResult): T[] {
  const cols = result.resultSetMetaData.rowType.map((c) => c.name);
  return (result.data ?? []).map((row) => {
    const obj: Record<string, string | null> = {};
    row.forEach((val, i) => {
      obj[cols[i]] = val;
    });
    return obj as unknown as T;
  });
}

// ── Binding helpers ──────────────────────────────────────────────────────────

export const sfText = (v: unknown): SnowflakeBinding => ({
  type: 'TEXT',
  value: v == null ? '' : String(v),
});

export const sfNum = (v: unknown): SnowflakeBinding => ({
  type: 'FIXED',
  value: v == null ? '0' : String(v),
});

export const sfBool = (v: unknown): SnowflakeBinding => ({
  type: 'BOOLEAN',
  value: v ? 'true' : 'false',
});

export const sfDate = (v: unknown): SnowflakeBinding => ({
  type: 'DATE',
  value: v == null ? '' : String(v),
});
