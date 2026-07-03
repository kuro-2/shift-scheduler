'use client';

import { useQuery } from '@tanstack/react-query';
import { getTopPerformers } from '@/services/reports.service';

// ─── Grade Helpers ──────────────────────────────────────────────────────────

function gradeFromScore(score: number): string {
  if (score >= 98) return 'A+';
  if (score >= 95) return 'A';
  if (score >= 92) return 'A-';
  if (score >= 88) return 'B+';
  if (score >= 84) return 'B';
  if (score >= 80) return 'B-';
  if (score >= 75) return 'C+';
  return 'C';
}

function gradeColors(grade: string): { bg: string; text: string } {
  if (grade.startsWith('A')) return { bg: 'var(--filled-bg)', text: 'var(--filled-text)' };
  if (grade.startsWith('B')) return { bg: 'var(--pending-bg)', text: 'var(--pending-text)' };
  return { bg: 'var(--open-bg)', text: 'var(--open-text)' };
}

export function TopPerformers() {
  const { data, isLoading } = useQuery({
    queryKey: ['reports', 'top-performers'],
    queryFn: () => getTopPerformers(),
  });

  const performers = data ?? [];

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
          Top performers
        </span>
      </div>

      {/* List */}
      {isLoading || performers.length === 0 ? (
        <div style={{ fontSize: 13, color: 'var(--text-dim)', padding: '8px 0' }}>
          {isLoading ? 'Loading…' : 'No data available'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {performers.map((perf) => {
            const grade = gradeFromScore(perf.punctualityScore);
            const { bg, text } = gradeColors(grade);
            return (
              <div
                key={perf.employeeId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  paddingBlock: 8,
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: perf.avatarColor,
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 600,
                    flexShrink: 0,
                  }}
                >
                  {perf.initials}
                </div>

                {/* Name + sub-label */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', lineHeight: 1.3 }}>
                    {perf.name}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>
                    {perf.punctualityScore.toFixed(1)}% on-time · {perf.hoursWorked}h
                  </div>
                </div>

                {/* Grade chip */}
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    background: bg,
                    color: text,
                    borderRadius: 4,
                    paddingInline: 8,
                    paddingBlock: 3,
                    flexShrink: 0,
                  }}
                >
                  {grade}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
