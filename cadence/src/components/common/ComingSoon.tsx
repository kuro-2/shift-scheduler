import type { LucideIcon } from 'lucide-react';
import { Sparkles } from 'lucide-react';

interface ComingSoonProps {
  title: string;
  description?: string;
  Icon?: LucideIcon;
}

export function ComingSoon({ title, description, Icon = Sparkles }: ComingSoonProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        minHeight: '60vh',
        padding: '0 24px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: 'var(--accent-soft)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon size={22} style={{ color: 'var(--accent)' }} />
      </div>
      <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)' }}>{title}</div>
      <div style={{ fontSize: 13, color: 'var(--text-dim)', maxWidth: 360 }}>
        {description ?? 'This section is coming soon.'}
      </div>
    </div>
  );
}
