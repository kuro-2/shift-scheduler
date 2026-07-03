'use client';

import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { MessageSquare, CalendarDays, Receipt, Database } from 'lucide-react';
import { toast } from 'sonner';

interface Integration {
  id: string;
  name: string;
  description: string;
  Icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  status: 'connected' | 'available' | 'coming_soon';
}

const DEFAULT_INTEGRATIONS: Integration[] = [
  {
    id: 'slack',
    name: 'Slack',
    description: 'Send shift notifications and schedule updates directly to Slack channels.',
    Icon: MessageSquare,
    iconColor: '#5A9B6E',
    iconBg: 'var(--filled-bg)',
    status: 'connected',
  },
  {
    id: 'google_calendar',
    name: 'Google Calendar',
    description: 'Sync published shifts to employees’ personal Google Calendars.',
    Icon: CalendarDays,
    iconColor: '#3D4D8A',
    iconBg: 'var(--pending-bg)',
    status: 'available',
  },
  {
    id: 'quickbooks',
    name: 'QuickBooks',
    description: 'Export approved timesheets and labor costs straight to payroll.',
    Icon: Receipt,
    iconColor: '#D4A04A',
    iconBg: 'var(--open-bg)',
    status: 'available',
  },
  {
    id: 'snowflake',
    name: 'Snowflake',
    description: 'Connect your Snowflake data warehouse for reporting and analytics.',
    Icon: Database,
    iconColor: '#4F46E5',
    iconBg: 'var(--accent-soft)',
    status: 'coming_soon',
  },
];

function StatusBadge({ status }: { status: Integration['status'] }) {
  if (status === 'connected') {
    return (
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: 'var(--filled-text)',
          background: 'var(--filled-bg)',
          borderRadius: 99,
          padding: '3px 9px',
        }}
      >
        Connected
      </span>
    );
  }
  if (status === 'coming_soon') {
    return (
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: 'var(--text-dim)',
          background: 'var(--surface-2)',
          borderRadius: 99,
          padding: '3px 9px',
        }}
      >
        Coming soon
      </span>
    );
  }
  return null;
}

export default function IntegrationsSettingsPage() {
  const [integrations, setIntegrations] = useState(DEFAULT_INTEGRATIONS);

  function handleConnect(id: string, name: string) {
    setIntegrations((list) => list.map((i) => (i.id === id ? { ...i, status: 'connected' } : i)));
    toast.success(`${name} connected`);
  }

  function handleManage(id: string, name: string) {
    if (!window.confirm(`Disconnect ${name}?`)) return;
    setIntegrations((list) => list.map((i) => (i.id === id ? { ...i, status: 'available' } : i)));
    toast.success(`${name} disconnected`);
  }

  return (
    <div style={{ maxWidth: 920 }}>
      {/* ── Header ── */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)', margin: 0 }}>
          Integrations
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
          Connect Nexora to the tools your team already uses.
        </p>
      </div>

      {/* ── Grid ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 14,
        }}
      >
        {integrations.map((integration) => {
          const isComingSoon = integration.status === 'coming_soon';
          const isConnected = integration.status === 'connected';
          return (
            <div
              key={integration.id}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding: 20,
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 9,
                    background: integration.iconBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <integration.Icon size={18} style={{ color: integration.iconColor }} />
                </div>
                <StatusBadge status={integration.status} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                  {integration.name}
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.5 }}>
                  {integration.description}
                </p>
              </div>
              <button
                disabled={isComingSoon}
                onClick={() =>
                  isConnected
                    ? handleManage(integration.id, integration.name)
                    : handleConnect(integration.id, integration.name)
                }
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: isConnected ? 'var(--text)' : isComingSoon ? 'var(--text-dim)' : '#FFFFFF',
                  background: isConnected
                    ? 'var(--surface-2)'
                    : isComingSoon
                      ? 'var(--surface-2)'
                      : 'var(--accent)',
                  border: isConnected || isComingSoon ? '1px solid var(--border)' : 'none',
                  borderRadius: 'var(--radius-sm)',
                  padding: '7px 13px',
                  cursor: isComingSoon ? 'not-allowed' : 'pointer',
                  alignSelf: 'flex-start',
                }}
              >
                {isConnected ? 'Manage' : isComingSoon ? 'Coming soon' : 'Connect'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
