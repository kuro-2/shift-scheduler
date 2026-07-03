'use client';

import { useRouter } from 'next/navigation';
import { AlertTriangle, CalendarX, ArrowLeftRight, Clock } from 'lucide-react';

interface AttentionItem {
  id: string;
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  sub: string;
  action: string;
  href: string;
}

const ITEMS: AttentionItem[] = [
  {
    id: 'conflict',
    icon: <AlertTriangle size={16} />,
    iconBg: 'var(--conflict-bg)',
    title: 'Scheduling conflict · Tuesday',
    sub: 'Jordan Park is double-booked 9:00–17:30',
    action: 'Resolve',
    href: '/schedule',
  },
  {
    id: 'open-shifts',
    icon: <CalendarX size={16} />,
    iconBg: 'var(--open-bg)',
    title: '3 open shifts this week',
    sub: 'Tue · Wed · Sat still need coverage',
    action: 'Assign',
    href: '/schedule',
  },
  {
    id: 'swaps',
    icon: <ArrowLeftRight size={16} />,
    iconBg: 'var(--pending-bg)',
    title: '2 shift swap requests pending',
    sub: 'Naomi ↔ Devon · Riley ↔ Sam',
    action: 'Review',
    href: '/time-off',
  },
  {
    id: 'time-off',
    icon: <Clock size={16} />,
    iconBg: 'var(--pending-bg)',
    title: '4 time-off requests waiting',
    sub: 'Oldest from Marcus Chen, submitted 3 days ago',
    action: 'Review',
    href: '/time-off',
  },
];

const ICON_TEXT: Record<string, string> = {
  conflict: 'var(--conflict-text)',
  'open-shifts': 'var(--open-text)',
  swaps: 'var(--pending-text)',
  'time-off': 'var(--pending-text)',
};

export function NeedsAttentionPanel() {
  const router = useRouter();

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: 18,
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2" style={{ marginBottom: 16 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
          Needs attention
        </span>
        <span
          style={{
            minWidth: 20,
            height: 20,
            borderRadius: 99,
            background: 'var(--conflict-bg)',
            color: 'var(--conflict-text)',
            fontSize: 11,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            paddingInline: 6,
          }}
        >
          7
        </span>
        <span style={{ flex: 1 }} />
        <button
          onClick={() => router.push('/schedule')}
          style={{
            background: 'none',
            border: 'none',
            fontSize: 12,
            color: 'var(--accent)',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          View all →
        </button>
      </div>

      {/* Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {ITEMS.map((item, i) => (
          <div
            key={item.id}
            className="flex items-start gap-3"
            style={{
              paddingBlock: 12,
              borderTop: i === 0 ? 'none' : '1px solid var(--border)',
            }}
          >
            {/* Icon tile */}
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 'var(--radius-sm)',
                background: item.iconBg,
                color: ICON_TEXT[item.id],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {item.icon}
            </div>

            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', lineHeight: 1.4 }}>
                {item.title}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2, lineHeight: 1.4 }}>
                {item.sub}
              </div>
            </div>

            {/* Action button */}
            <button
              onClick={() => router.push(item.href)}
              style={{
                flexShrink: 0,
                fontSize: 12,
                fontWeight: 500,
                color: 'var(--accent-text)',
                background: 'var(--accent-soft)',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                padding: '4px 10px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {item.action}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
