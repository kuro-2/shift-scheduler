'use client';

import { Trash2 } from 'lucide-react';

export function DeleteRowButton({
  onClick,
  label = 'Remove row',
}: {
  onClick: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      style={{
        width: 34,
        height: 36,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 7,
        border: '1px solid var(--border)',
        background: 'var(--surface-2)',
        color: 'var(--text-muted)',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.color = 'var(--conflict-text)';
        (e.currentTarget as HTMLButtonElement).style.background = 'var(--conflict-bg)';
        (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--conflict-border)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)';
        (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-2)';
        (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
      }}
    >
      <Trash2 size={15} />
    </button>
  );
}
