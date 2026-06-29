'use client';

export function CoverageTile() {
  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: 18,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      {/* Label */}
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
        }}
      >
        Coverage Today
      </span>

      {/* Big metric */}
      <div className="flex items-center gap-2">
        <span
          style={{
            fontSize: 32,
            fontWeight: 600,
            lineHeight: 1,
            color: 'var(--text)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          94%
        </span>
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--filled-text)',
            background: 'var(--filled-bg)',
            borderRadius: 99,
            paddingInline: 7,
            paddingBlock: 2,
            whiteSpace: 'nowrap',
          }}
        >
          +2.1
        </span>
      </div>

      {/* Sub label */}
      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
        17 of 18 needed shifts filled
      </span>

      {/* 3-segment progress bar */}
      <div
        style={{
          display: 'flex',
          height: 6,
          borderRadius: 99,
          overflow: 'hidden',
          gap: 2,
        }}
      >
        <div style={{ flex: 78, background: '#5A9B6E', borderRadius: '99px 0 0 99px' }} />
        <div style={{ flex: 16, background: '#D4A04A' }} />
        <div style={{ flex: 6, background: 'var(--surface-3)', borderRadius: '0 99px 99px 0' }} />
      </div>

      {/* Footer */}
      <div style={{ paddingTop: 4 }}>
        <span style={{ fontSize: 12, color: 'var(--text-dim)', fontVariantNumeric: 'tabular-nums' }}>
          14 filled ·{' '}
          <span style={{ color: 'var(--open-text)' }}>3 pending</span>{' '}
          · <span style={{ color: 'var(--conflict-text)' }}>1 open</span>
        </span>
      </div>
    </div>
  );
}
