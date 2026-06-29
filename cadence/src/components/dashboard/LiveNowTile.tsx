'use client';

import { AvatarStack } from '@/components/common/AvatarStack';

const LIVE_AVATARS = [
  { initials: 'AM', color: '#7C6AC4' },
  { initials: 'JP', color: '#5A9B6E' },
  { initials: 'SR', color: '#D4A04A' },
  { initials: 'PS', color: '#C76054' },
  { initials: 'MC', color: '#3D4D8A' },
  { initials: 'NW', color: '#C9936B' },
  { initials: 'DL', color: '#6373B5' },
  { initials: 'RH', color: '#B5736E' },
  { initials: 'SK', color: '#4A9B8E' },
  { initials: 'TB', color: '#8A7A5E' },
  { initials: 'BL', color: '#7C6AC4' },
  { initials: 'KM', color: '#5A9B6E' },
  { initials: 'TX', color: '#D4A04A' },
  { initials: 'FW', color: '#C76054' },
];

export function LiveNowTile() {
  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: 18,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <span
          className="animate-pulse-live"
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#5A9B6E',
            boxShadow: '0 0 0 3px rgba(90,155,110,0.25)',
            flexShrink: 0,
            display: 'block',
          }}
        />
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
          }}
        >
          Live · Right Now
        </span>
      </div>

      {/* Big number */}
      <div>
        <div className="flex items-baseline gap-2">
          <span
            style={{
              fontSize: 36,
              fontWeight: 600,
              lineHeight: 1,
              color: 'var(--text)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            14
          </span>
          <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>people on shift</span>
        </div>
      </div>

      {/* Avatar stack */}
      <AvatarStack avatars={LIVE_AVATARS} max={5} size={28} />

      {/* Footer stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          paddingTop: 12,
          borderTop: '1px solid var(--border)',
          gap: 4,
        }}
      >
        {[
          { label: 'Clocked in', value: '13' },
          { label: 'On break', value: '2' },
          { label: 'Next', value: '4' },
        ].map((stat) => (
          <div key={stat.label} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: 'var(--text)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {stat.value}
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
