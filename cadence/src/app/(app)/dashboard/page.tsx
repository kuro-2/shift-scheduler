import { Download, CalendarDays } from 'lucide-react';
import { LiveNowTile } from '@/components/dashboard/LiveNowTile';
import { CoverageTile } from '@/components/dashboard/CoverageTile';
import { LaborCostTile } from '@/components/dashboard/LaborCostTile';
import { HoursTile } from '@/components/dashboard/HoursTile';
import { NeedsAttentionPanel } from '@/components/dashboard/NeedsAttentionPanel';
import { TodayShiftsPanel } from '@/components/dashboard/TodayShiftsPanel';
import { RecentActivityPanel } from '@/components/dashboard/RecentActivityPanel';

export default function DashboardPage() {
  return (
    <div
      style={{
        maxWidth: 1440,
        margin: '0 auto',
        padding: '28px 32px 60px',
      }}
    >
      {/* ── Greeting block ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 24,
          gap: 16,
        }}
      >
        <div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>
            Sunday, June 29
          </div>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: 'var(--text)',
              margin: 0,
              lineHeight: 1.25,
            }}
          >
            Good morning, Sarah
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
            Here&apos;s what&apos;s happening at Northgate today.
          </p>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              fontWeight: 500,
              color: 'var(--text)',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '7px 13px',
              cursor: 'pointer',
            }}
          >
            <Download size={14} />
            Export
          </button>
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              fontWeight: 500,
              color: '#FFFFFF',
              background: 'var(--accent)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              padding: '7px 13px',
              cursor: 'pointer',
            }}
          >
            <CalendarDays size={14} />
            Open scheduler
          </button>
        </div>
      </div>

      {/* ── KPI Tiles Row ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.4fr 1fr 1fr 1fr',
          gap: 14,
          marginBottom: 14,
        }}
      >
        <LiveNowTile />
        <CoverageTile />
        <LaborCostTile />
        <HoursTile />
      </div>

      {/* ── Bottom Row ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.5fr 1fr',
          gap: 14,
        }}
      >
        <NeedsAttentionPanel />

        {/* Right column: Today's Shifts + Recent Activity stacked */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <TodayShiftsPanel />
          <RecentActivityPanel />
        </div>
      </div>
    </div>
  );
}
