'use client';

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const HOURS_DATA = [75, 68, 82, 72, 65, 30, 20];
const MAX_H = Math.max(...HOURS_DATA);

function MiniBarChart() {
  return (
    <div
      className="flex items-end gap-1"
      style={{ height: 32 }}
      aria-hidden
    >
      {HOURS_DATA.map((h, i) => {
        const isToday = i === 6; // Sunday Jun 28 is "today" for the week view
        const pct = (h / MAX_H) * 100;
        return (
          <div
            key={i}
            className="flex flex-col items-center gap-0.5"
            style={{ flex: 1 }}
          >
            <div
              style={{
                width: '100%',
                height: `${pct}%`,
                background: isToday ? 'var(--accent)' : 'var(--accent-soft)',
                borderRadius: '2px 2px 0 0',
                minHeight: 2,
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

export function HoursTile() {
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
        Hours This Week
      </span>

      {/* Big metric */}
      <div className="flex items-baseline gap-1">
        <span
          style={{
            fontSize: 32,
            fontWeight: 600,
            lineHeight: 1,
            color: 'var(--text)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          412
        </span>
        <span
          style={{
            fontSize: 14,
            color: 'var(--text-dim)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          / 480
        </span>
      </div>

      {/* Sub */}
      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>86% of planned hours</span>

      {/* Bar chart */}
      <div style={{ marginTop: 6 }}>
        <MiniBarChart />
        <div className="flex gap-1" style={{ marginTop: 3 }}>
          {DAY_LABELS.map((l, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                textAlign: 'center',
                fontSize: 9,
                color: i === 6 ? 'var(--accent)' : 'var(--text-dim)',
                fontWeight: i === 6 ? 700 : 400,
              }}
            >
              {l}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
