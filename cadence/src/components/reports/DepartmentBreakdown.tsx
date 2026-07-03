'use client';

import { useQuery } from '@tanstack/react-query';
import { getDepartmentBreakdown } from '@/services/reports.service';

export function DepartmentBreakdown() {
  const { data, isLoading } = useQuery({
    queryKey: ['reports', 'department-breakdown'],
    queryFn: () => getDepartmentBreakdown(),
  });

  const departments = data ?? [];
  const maxHours = departments.length > 0 ? Math.max(...departments.map((d) => d.hours)) : 1;

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
      <div style={{ marginBottom: 16 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
          Hours by department
        </span>
      </div>

      {/* Rows */}
      {isLoading || departments.length === 0 ? (
        <div style={{ fontSize: 13, color: 'var(--text-dim)', padding: '8px 0' }}>
          {isLoading ? 'Loading…' : 'No data available'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {departments.map((dept) => {
            const widthPct = maxHours > 0 ? (dept.hours / maxHours) * 100 : 0;
            return (
              <div key={dept.departmentId} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {/* Dot */}
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: dept.color,
                    flexShrink: 0,
                  }}
                />

                {/* Name */}
                <span
                  style={{
                    fontSize: 13,
                    color: 'var(--text)',
                    width: 110,
                    flexShrink: 0,
                  }}
                >
                  {dept.name}
                </span>

                {/* Bar */}
                <div
                  style={{
                    flex: 1,
                    height: 8,
                    borderRadius: 4,
                    background: 'var(--surface-2)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${widthPct}%`,
                      background: dept.color,
                      borderRadius: 4,
                    }}
                  />
                </div>

                {/* Hours value */}
                <span
                  style={{
                    fontSize: 13,
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text)',
                    width: 56,
                    textAlign: 'right',
                    flexShrink: 0,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {dept.hours}h
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
