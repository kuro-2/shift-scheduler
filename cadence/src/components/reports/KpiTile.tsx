import { ChevronUp, ChevronDown } from 'lucide-react';

interface KpiTileProps {
  label: string;
  value: string;
  delta: number;
  deltaLabel?: string;
  goodDirection: 'up' | 'down';
}

export function KpiTile({ label, value, delta, deltaLabel, goodDirection }: KpiTileProps) {
  const direction: 'up' | 'down' = delta >= 0 ? 'up' : 'down';
  const isGood = direction === goodDirection;
  const Arrow = direction === 'up' ? ChevronUp : ChevronDown;

  const chipBg = isGood ? 'var(--filled-bg)' : 'var(--conflict-bg)';
  const chipText = isGood ? 'var(--filled-text)' : 'var(--conflict-text)';

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: 18,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
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
        {label}
      </span>

      {/* Big value */}
      <div
        style={{
          fontSize: 28,
          fontWeight: 600,
          lineHeight: 1,
          color: 'var(--text)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </div>

      {/* Delta chip */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 2,
            fontSize: 12,
            fontWeight: 600,
            color: chipText,
            background: chipBg,
            borderRadius: 4,
            paddingInline: 6,
            paddingBlock: 2,
          }}
        >
          <Arrow size={12} strokeWidth={2.5} />
          {Math.abs(delta).toFixed(1)}%
        </span>
        {deltaLabel && (
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{deltaLabel}</span>
        )}
      </div>
    </div>
  );
}
