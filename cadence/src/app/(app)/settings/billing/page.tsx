'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

const cardStyle: React.CSSProperties = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  padding: 20,
  marginBottom: 16,
};

interface InvoiceRow {
  id: string;
  date: string;
  amount: string;
  status: 'Paid' | 'Pending' | 'Failed';
}

const INVOICES: InvoiceRow[] = [
  { id: 'inv_2026_06', date: 'Jun 1, 2026', amount: '$249.00', status: 'Paid' },
  { id: 'inv_2026_05', date: 'May 1, 2026', amount: '$249.00', status: 'Paid' },
  { id: 'inv_2026_04', date: 'Apr 1, 2026', amount: '$219.00', status: 'Paid' },
  { id: 'inv_2026_03', date: 'Mar 1, 2026', amount: '$219.00', status: 'Paid' },
];

const SEATS_USED = 47;
const SEATS_TOTAL = 60;

const statusColors: Record<InvoiceRow['status'], { bg: string; text: string }> = {
  Paid: { bg: 'var(--filled-bg)', text: 'var(--filled-text)' },
  Pending: { bg: 'var(--pending-bg)', text: 'var(--pending-text)' },
  Failed: { bg: 'var(--conflict-bg)', text: 'var(--conflict-text)' },
};

function downloadInvoice(row: InvoiceRow) {
  const csv = [
    'Invoice ID,Date,Amount,Status',
    `${row.id},${row.date},${row.amount},${row.status}`,
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${row.id}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success(`Invoice ${row.id} downloaded`);
}

export default function BillingSettingsPage() {
  const seatPct = Math.round((SEATS_USED / SEATS_TOTAL) * 100);
  const [upgrading, setUpgrading] = useState(false);

  function handleUpgrade() {
    setUpgrading(true);
    setTimeout(() => {
      setUpgrading(false);
      toast.success('Plan upgrade initiated — our team will be in touch shortly');
    }, 800);
  }

  return (
    <div style={{ maxWidth: 820 }}>
      {/* ── Header ── */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)', margin: 0 }}>
          Plan & billing
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
          Manage your subscription, seats, and payment history.
        </p>
      </div>

      {/* ── Current plan ── */}
      <div style={cardStyle}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: 16,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>
                Growth plan
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'var(--accent-text)',
                  background: 'var(--accent-soft)',
                  borderRadius: 99,
                  padding: '2px 8px',
                }}
              >
                Active
              </span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
              $249.00 / month · billed monthly
            </div>
          </div>
          <button
            onClick={handleUpgrade}
            disabled={upgrading}
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: '#FFFFFF',
              background: 'var(--accent)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              padding: '8px 16px',
              cursor: upgrading ? 'default' : 'pointer',
              opacity: upgrading ? 0.7 : 1,
              whiteSpace: 'nowrap',
            }}
          >
            {upgrading ? 'Processing…' : 'Upgrade plan'}
          </button>
        </div>

        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 12,
              color: 'var(--text-muted)',
              marginBottom: 6,
            }}
          >
            <span>
              {SEATS_USED} of {SEATS_TOTAL} seats used
            </span>
            <span>{seatPct}%</span>
          </div>
          <div
            style={{
              height: 8,
              borderRadius: 99,
              background: 'var(--surface-3)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${seatPct}%`,
                background: 'var(--accent)',
                borderRadius: 99,
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Billing history ── */}
      <div style={cardStyle}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 14 }}>
          Billing history
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ textAlign: 'left', padding: '0 0 10px', color: 'var(--text-muted)', fontWeight: 500, fontSize: 12 }}>
                Date
              </th>
              <th style={{ textAlign: 'left', padding: '0 0 10px', color: 'var(--text-muted)', fontWeight: 500, fontSize: 12 }}>
                Amount
              </th>
              <th style={{ textAlign: 'left', padding: '0 0 10px', color: 'var(--text-muted)', fontWeight: 500, fontSize: 12 }}>
                Status
              </th>
              <th style={{ textAlign: 'right', padding: '0 0 10px', color: 'var(--text-muted)', fontWeight: 500, fontSize: 12 }}>
                Invoice
              </th>
            </tr>
          </thead>
          <tbody>
            {INVOICES.map((row, idx) => (
              <tr key={row.id} style={{ borderBottom: idx < INVOICES.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <td style={{ padding: '12px 0', color: 'var(--text)' }}>{row.date}</td>
                <td style={{ padding: '12px 0', color: 'var(--text)' }}>{row.amount}</td>
                <td style={{ padding: '12px 0' }}>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: statusColors[row.status].text,
                      background: statusColors[row.status].bg,
                      borderRadius: 99,
                      padding: '2px 10px',
                    }}
                  >
                    {row.status}
                  </span>
                </td>
                <td style={{ padding: '12px 0', textAlign: 'right' }}>
                  <button
                    onClick={() => downloadInvoice(row)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 12,
                      fontWeight: 500,
                      color: 'var(--accent)',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    <Download size={13} />
                    Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
