interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  detail: string;
}

const AUDIT_EVENTS: AuditEvent[] = [
  {
    id: 'evt_010',
    timestamp: '2026-06-29 18:42:11',
    actor: 'Sarah Kim',
    action: 'Published week of Jun 22',
    detail: '192.168.1.42',
  },
  {
    id: 'evt_009',
    timestamp: '2026-06-29 16:05:37',
    actor: 'Sarah Kim',
    action: 'Approved time-off request for Alex Mercer',
    detail: '192.168.1.42',
  },
  {
    id: 'evt_008',
    timestamp: '2026-06-29 11:21:04',
    actor: 'Priya Shah',
    action: 'Updated role permissions for Manager',
    detail: '10.0.4.18',
  },
  {
    id: 'evt_007',
    timestamp: '2026-06-28 22:09:55',
    actor: 'System',
    action: 'Auto-detected scheduling conflict for Jordan Park',
    detail: 'automated',
  },
  {
    id: 'evt_006',
    timestamp: '2026-06-28 14:33:02',
    actor: 'Priya Shah',
    action: 'Added new employee Riley Hayes',
    detail: '10.0.4.18',
  },
  {
    id: 'evt_005',
    timestamp: '2026-06-27 09:15:48',
    actor: 'Sarah Kim',
    action: 'Rejected swap request between Naomi West and Devon Lee',
    detail: '192.168.1.42',
  },
  {
    id: 'evt_004',
    timestamp: '2026-06-26 17:50:19',
    actor: 'Sarah Kim',
    action: 'Created shift template "Opening — Floor"',
    detail: '192.168.1.42',
  },
  {
    id: 'evt_003',
    timestamp: '2026-06-25 13:02:33',
    actor: 'Priya Shah',
    action: 'Generated new API key "Reporting pipeline"',
    detail: '10.0.4.18',
  },
  {
    id: 'evt_002',
    timestamp: '2026-06-24 08:47:21',
    actor: 'System',
    action: 'Sent SMS shift reminders to 12 employees',
    detail: 'automated',
  },
  {
    id: 'evt_001',
    timestamp: '2026-06-23 10:30:00',
    actor: 'Sarah Kim',
    action: 'Connected Slack integration',
    detail: '192.168.1.42',
  },
];

export default function AuditLogSettingsPage() {
  return (
    <div style={{ maxWidth: 980 }}>
      {/* ── Header ── */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)', margin: 0 }}>
          Audit log
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
          A record of administrative and scheduling actions across your workspace.
        </p>
      </div>

      {/* ── Table ── */}
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          overflow: 'hidden',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ textAlign: 'left', padding: '12px 20px', color: 'var(--text-muted)', fontWeight: 500, fontSize: 12 }}>
                Timestamp
              </th>
              <th style={{ textAlign: 'left', padding: '12px 20px', color: 'var(--text-muted)', fontWeight: 500, fontSize: 12 }}>
                Actor
              </th>
              <th style={{ textAlign: 'left', padding: '12px 20px', color: 'var(--text-muted)', fontWeight: 500, fontSize: 12 }}>
                Action
              </th>
              <th style={{ textAlign: 'left', padding: '12px 20px', color: 'var(--text-muted)', fontWeight: 500, fontSize: 12 }}>
                IP / details
              </th>
            </tr>
          </thead>
          <tbody>
            {AUDIT_EVENTS.map((evt, idx) => (
              <tr key={evt.id} style={{ borderTop: idx > 0 ? '1px solid var(--border)' : 'none' }}>
                <td
                  style={{
                    padding: '12px 20px',
                    color: 'var(--text-muted)',
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: 12,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {evt.timestamp}
                </td>
                <td style={{ padding: '12px 20px', color: 'var(--text)', fontWeight: 500, whiteSpace: 'nowrap' }}>
                  {evt.actor}
                </td>
                <td style={{ padding: '12px 20px', color: 'var(--text)' }}>{evt.action}</td>
                <td
                  style={{
                    padding: '12px 20px',
                    color: 'var(--text-dim)',
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: 12,
                  }}
                >
                  {evt.detail}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
