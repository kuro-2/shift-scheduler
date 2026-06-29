'use client';

import { Avatar } from '@/components/common/Avatar';

interface ActivityItem {
  id: string;
  initials: string;
  color: string;
  text: string;
  detail?: string;
  time: string;
}

const ACTIVITIES: ActivityItem[] = [
  {
    id: 'a1',
    initials: 'JP',
    color: '#5A9B6E',
    text: 'Jordan Park accepted Tuesday’s swap',
    time: '5 min ago',
  },
  {
    id: 'a2',
    initials: 'AM',
    color: '#7C6AC4',
    text: 'Alex Mercer requested time off',
    detail: 'Jul 4–7',
    time: '1 h ago',
  },
  {
    id: 'a3',
    initials: 'SK',
    color: '#4A9B8E',
    text: 'You published the week of Jun 22',
    detail: '47 shifts',
    time: '2 h ago',
  },
  {
    id: 'a4',
    initials: 'SR',
    color: '#D4A04A',
    text: 'Sam Reyes clocked in 4 min late',
    time: '3 h ago',
  },
];

export function RecentActivityPanel() {
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
      <div style={{ marginBottom: 14 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
          Recent activity
        </span>
      </div>

      {/* Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {ACTIVITIES.map((item, i) => (
          <div
            key={item.id}
            className="flex items-start gap-3"
            style={{
              paddingBlock: 10,
              borderTop: i === 0 ? 'none' : '1px solid var(--border)',
            }}
          >
            <Avatar initials={item.initials} color={item.color} size={22} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.4 }}>
                {item.text}
              </span>
              {item.detail && (
                <span
                  style={{
                    fontSize: 12,
                    color: 'var(--text-muted)',
                    marginLeft: 4,
                  }}
                >
                  · {item.detail}
                </span>
              )}
            </div>
            <span
              style={{
                fontSize: 11,
                color: 'var(--text-dim)',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                marginTop: 1,
              }}
            >
              {item.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
