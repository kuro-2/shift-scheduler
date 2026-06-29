'use client';

import { Rows3 } from 'lucide-react';
import { useUIStore } from '@/store/ui.store';

export function DensityToggle() {
  const density = useUIStore((s) => s.density);
  const toggleDensity = useUIStore((s) => s.toggleDensity);

  const label = density === 'comfortable' ? 'Cozy' : 'Compact';

  return (
    <button
      onClick={toggleDensity}
      aria-label={`Switch to ${density === 'comfortable' ? 'compact' : 'comfortable'} density`}
      style={{
        height: 32,
        paddingInline: 10,
        borderRadius: 7,
        border: '1px solid var(--border)',
        background: 'transparent',
        color: 'var(--text-muted)',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        cursor: 'pointer',
        fontSize: 13,
        fontWeight: 500,
        transition: 'background 0.15s ease, color 0.15s ease',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-2)';
        (e.currentTarget as HTMLButtonElement).style.color = 'var(--text)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
        (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)';
      }}
    >
      <Rows3 size={14} />
      {label}
    </button>
  );
}
