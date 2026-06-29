'use client';

import { cn } from '@/lib/utils';

interface AvatarProps {
  initials: string;
  color: string; // hex
  size?: number; // default 32
  className?: string;
}

export function Avatar({ initials, color, size = 32, className }: AvatarProps) {
  const fontSize = Math.round(size * 0.375);

  return (
    <div
      className={cn('flex items-center justify-center shrink-0 select-none', className)}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        color: '#FFFFFF',
        fontSize,
        fontWeight: 600,
        letterSpacing: '0.02em',
      }}
    >
      {initials}
    </div>
  );
}
