'use client';

import { Info } from 'lucide-react';

export function InfoBanner({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 8,
        background: 'var(--accent-soft)',
        padding: 12,
        borderRadius: 8,
        marginBottom: 20,
      }}
    >
      <Info size={15} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 1 }} />
      <p style={{ fontSize: 12.5, color: 'var(--accent-text)', lineHeight: 1.5 }}>
        {children}
      </p>
    </div>
  );
}
