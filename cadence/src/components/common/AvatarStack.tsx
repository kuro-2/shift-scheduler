'use client';

import { Avatar } from './Avatar';
import { cn } from '@/lib/utils';

interface AvatarItem {
  initials: string;
  color: string;
}

interface AvatarStackProps {
  avatars: AvatarItem[];
  max?: number;
  size?: number;
  className?: string;
}

export function AvatarStack({ avatars, max = 5, size = 28, className }: AvatarStackProps) {
  const visible = avatars.slice(0, max);
  const overflow = avatars.length - max;

  return (
    <div className={cn('flex items-center', className)}>
      {visible.map((avatar, i) => (
        <div
          key={i}
          style={{
            marginLeft: i === 0 ? 0 : -8,
            border: '2px solid var(--surface)',
            borderRadius: '50%',
            zIndex: visible.length - i,
            position: 'relative',
          }}
        >
          <Avatar initials={avatar.initials} color={avatar.color} size={size} />
        </div>
      ))}
      {overflow > 0 && (
        <div
          style={{
            marginLeft: -8,
            width: size,
            height: size,
            borderRadius: '50%',
            background: 'var(--surface-3)',
            border: '2px solid var(--surface)',
            color: 'var(--text-muted)',
            fontSize: Math.round(size * 0.34),
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            zIndex: 0,
          }}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}
