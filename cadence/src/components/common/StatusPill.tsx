'use client';

type Status =
  | 'filled'
  | 'open'
  | 'conflict'
  | 'draft'
  | 'pending'
  | 'active'
  | 'part-time'
  | 'inactive'
  | 'on_time'
  | 'late';

interface StatusPillProps {
  status: Status;
  size?: 'sm' | 'md';
}

const STATUS_CONFIG: Record<
  Status,
  { bg: string; text: string; dot: string; label: string }
> = {
  filled: {
    bg: 'var(--filled-bg)',
    text: 'var(--filled-text)',
    dot: 'var(--filled-dot)',
    label: 'Filled',
  },
  open: {
    bg: 'var(--open-bg)',
    text: 'var(--open-text)',
    dot: 'var(--open-dot)',
    label: 'Open',
  },
  conflict: {
    bg: 'var(--conflict-bg)',
    text: 'var(--conflict-text)',
    dot: 'var(--conflict-dot)',
    label: 'Conflict',
  },
  draft: {
    bg: 'var(--draft-bg)',
    text: 'var(--draft-text)',
    dot: 'var(--draft-dot)',
    label: 'Draft',
  },
  pending: {
    bg: 'var(--pending-bg)',
    text: 'var(--pending-text)',
    dot: 'var(--pending-dot)',
    label: 'Pending',
  },
  active: {
    bg: 'var(--filled-bg)',
    text: 'var(--filled-text)',
    dot: 'var(--filled-dot)',
    label: 'Active',
  },
  'part-time': {
    bg: 'var(--open-bg)',
    text: 'var(--open-text)',
    dot: 'var(--open-dot)',
    label: 'Part-time',
  },
  inactive: {
    bg: 'var(--draft-bg)',
    text: 'var(--draft-text)',
    dot: 'var(--draft-dot)',
    label: 'Inactive',
  },
  on_time: {
    bg: 'var(--filled-bg)',
    text: 'var(--filled-text)',
    dot: 'var(--filled-dot)',
    label: 'On time',
  },
  late: {
    bg: 'var(--conflict-bg)',
    text: 'var(--conflict-text)',
    dot: 'var(--conflict-dot)',
    label: 'Late',
  },
};

export function StatusPill({ status, size = 'md' }: StatusPillProps) {
  const config = STATUS_CONFIG[status];
  const isSm = size === 'sm';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: isSm ? 4 : 5,
        paddingInline: isSm ? 6 : 8,
        paddingBlock: isSm ? 2 : 3,
        borderRadius: 99,
        background: config.bg,
        color: config.text,
        fontSize: isSm ? 11 : 12,
        fontWeight: 500,
        lineHeight: 1.4,
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: isSm ? 5 : 6,
          height: isSm ? 5 : 6,
          borderRadius: '50%',
          background: config.dot,
          flexShrink: 0,
        }}
      />
      {config.label}
    </span>
  );
}
