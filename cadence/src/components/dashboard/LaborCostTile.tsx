'use client';

const SPARKLINE_POINTS = [520, 480, 610, 540, 580, 350, 400];

function Sparkline() {
  const W = 120;
  const H = 36;
  const min = Math.min(...SPARKLINE_POINTS);
  const max = Math.max(...SPARKLINE_POINTS);
  const range = max - min || 1;

  const points = SPARKLINE_POINTS.map((v, i) => {
    const x = (i / (SPARKLINE_POINTS.length - 1)) * W;
    const y = H - ((v - min) / range) * (H - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  const areaPoints = [
    `0,${H}`,
    ...SPARKLINE_POINTS.map((v, i) => {
      const x = (i / (SPARKLINE_POINTS.length - 1)) * W;
      const y = H - ((v - min) / range) * (H - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }),
    `${W},${H}`,
  ].join(' ');

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.15" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill="url(#sparkGrad)" />
      <polyline
        points={points}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LaborCostTile() {
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
        Labor Cost
      </span>

      {/* Big number */}
      <div
        style={{
          fontSize: 30,
          fontWeight: 600,
          lineHeight: 1,
          color: 'var(--text)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        $3,847
      </div>

      {/* Sub */}
      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
        Today · 28% of weekly budget
      </span>

      {/* Sparkline */}
      <div style={{ marginTop: 4 }}>
        <Sparkline />
      </div>
    </div>
  );
}
