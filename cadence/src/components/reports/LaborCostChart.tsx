'use client';

import { useQuery } from '@tanstack/react-query';
import { getLaborCostChart } from '@/services/reports.service';
import type { LaborCostDataPoint } from '@/types';

// ─── Chart Geometry ─────────────────────────────────────────────────────────

const VIEW_W = 800;
const VIEW_H = 240;
const PADDING = { top: 12, right: 12, bottom: 28, left: 12 };

interface Point {
  x: number;
  y: number;
}

/**
 * Maps a data array's values into SVG viewBox coordinate space.
 */
function buildPoints(data: LaborCostDataPoint[], accessor: (d: LaborCostDataPoint) => number): Point[] {
  const values = data.map(accessor);
  const min = Math.min(...values, 0);
  const max = Math.max(...values);
  const range = max - min || 1;

  const innerW = VIEW_W - PADDING.left - PADDING.right;
  const innerH = VIEW_H - PADDING.top - PADDING.bottom;

  return data.map((d, i) => {
    const x = PADDING.left + (data.length === 1 ? 0 : (i / (data.length - 1)) * innerW);
    const value = accessor(d);
    const y = PADDING.top + innerH - ((value - min) / range) * innerH;
    return { x, y };
  });
}

function pointsToPolyline(points: Point[]): string {
  return points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
}

function pointsToAreaPolygon(points: Point[]): string {
  const baseline = VIEW_H - PADDING.bottom;
  return [
    `${points[0].x.toFixed(1)},${baseline}`,
    ...points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`),
    `${points[points.length - 1].x.toFixed(1)},${baseline}`,
  ].join(' ');
}

function formatDayLabel(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00Z`);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
}

export function LaborCostChart() {
  const { data, isLoading } = useQuery({
    queryKey: ['reports', 'labor-cost-chart'],
    queryFn: () => getLaborCostChart(),
  });

  const chartData = data ?? [];
  const hasData = chartData.length > 0;

  const actualPoints = hasData ? buildPoints(chartData, (d) => d.actual) : [];
  const scheduledPoints = hasData ? buildPoints(chartData, (d) => d.budget) : [];

  // Gridlines: 4 horizontal lines evenly spaced
  const gridLineCount = 4;
  const innerH = VIEW_H - PADDING.top - PADDING.bottom;
  const gridLines = Array.from({ length: gridLineCount + 1 }, (_, i) => {
    return PADDING.top + (i / gridLineCount) * innerH;
  });

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: 20,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
          Daily labor cost
        </span>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="20" height="8" viewBox="0 0 20 8">
              <line x1="0" y1="4" x2="20" y2="4" stroke="var(--accent)" strokeWidth="2" />
            </svg>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Actual</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="20" height="8" viewBox="0 0 20 8">
              <line
                x1="0"
                y1="4"
                x2="20"
                y2="4"
                stroke="var(--text-dim)"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
            </svg>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Scheduled</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      {isLoading || !hasData ? (
        <div
          style={{
            height: 240 + 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-dim)',
            fontSize: 13,
          }}
        >
          {isLoading ? 'Loading chart…' : 'No data available'}
        </div>
      ) : (
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H + 24}`}
          width="100%"
          height={264}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="laborCostGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.16" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Gridlines */}
          {gridLines.map((y, i) => (
            <line
              key={i}
              x1={PADDING.left}
              y1={y}
              x2={VIEW_W - PADDING.right}
              y2={y}
              stroke="var(--border)"
              strokeWidth="1"
            />
          ))}

          {/* Gradient fill under actual line */}
          <polygon points={pointsToAreaPolygon(actualPoints)} fill="url(#laborCostGradient)" />

          {/* Scheduled (dashed) line */}
          <polyline
            points={pointsToPolyline(scheduledPoints)}
            fill="none"
            stroke="var(--text-dim)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Actual (solid) line */}
          <polyline
            points={pointsToPolyline(actualPoints)}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* X-axis labels — every ~4th day */}
          {chartData.map((d, i) => {
            if (i % 4 !== 0 && i !== chartData.length - 1) return null;
            const x = actualPoints[i].x;
            return (
              <text
                key={d.date}
                x={x}
                y={VIEW_H + 16}
                fontSize="10"
                fill="var(--text-dim)"
                textAnchor="middle"
              >
                {formatDayLabel(d.date)}
              </text>
            );
          })}
        </svg>
      )}
    </div>
  );
}
