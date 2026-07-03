'use client';

import { Plus } from 'lucide-react';

export function AddRowButton({
  label = 'Add another',
  onClick,
}: {
  label?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        width: '100%',
        height: 38,
        borderRadius: 8,
        border: '1.5px dashed var(--border-strong)',
        background: 'transparent',
        color: 'var(--text-muted)',
        fontSize: 13,
        fontWeight: 500,
        cursor: 'pointer',
        marginTop: 4,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-2)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
      }}
    >
      <Plus size={14} />
      {label}
    </button>
  );
}
