'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { RequestStatus, TimeOffRequest } from '@/types';
import { getTimeOffRequests, getShiftSwaps, type ShiftSwapWithInfo } from '@/services/time-off.service';
import { RequestCard } from '@/components/time-off/RequestCard';
import { SwapCard } from '@/components/time-off/SwapCard';

type TabKey = 'pending' | 'approved' | 'rejected' | 'all';

type UnifiedItem =
  | { kind: 'request'; submittedAt: string; data: TimeOffRequest }
  | { kind: 'swap'; submittedAt: string; data: ShiftSwapWithInfo };

const TABS: { key: TabKey; label: string }[] = [
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'all', label: 'All requests' },
];

export function TimeOffTabs() {
  const [activeTab, setActiveTab] = useState<TabKey>('pending');

  const { data: requests = [] } = useQuery({
    queryKey: ['time-off-requests'],
    queryFn: () => getTimeOffRequests(),
  });

  const { data: swaps = [] } = useQuery({
    queryKey: ['shift-swaps'],
    queryFn: () => getShiftSwaps(),
  });

  const counts = {
    pending:
      requests.filter((r) => r.status === 'pending').length +
      swaps.filter((s) => s.status === 'pending').length,
    approved:
      requests.filter((r) => r.status === 'approved').length +
      swaps.filter((s) => s.status === 'approved').length,
    rejected:
      requests.filter((r) => r.status === 'rejected').length +
      swaps.filter((s) => s.status === 'rejected').length,
  };

  const statusFilter: RequestStatus | null =
    activeTab === 'all' ? null : (activeTab as RequestStatus);

  const unified: UnifiedItem[] = [
    ...requests.map((r): UnifiedItem => ({ kind: 'request', submittedAt: r.submittedAt, data: r })),
    ...swaps.map((s): UnifiedItem => ({ kind: 'swap', submittedAt: s.submittedAt, data: s })),
  ]
    .filter((item) => (statusFilter ? item.data.status === statusFilter : true))
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

  return (
    <div>
      {/* Tab row */}
      <div
        className="flex items-center"
        style={{ borderBottom: '1px solid var(--border)', gap: 24, marginBottom: 16 }}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const count = tab.key === 'all' ? null : counts[tab.key];

          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex items-center"
              style={{
                gap: 6,
                paddingBlock: 10,
                background: 'none',
                border: 'none',
                borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                marginBottom: -1,
                fontSize: 13,
                fontWeight: 500,
                color: isActive ? 'var(--text)' : 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              {tab.label}
              {count !== null && (
                <span
                  style={{
                    minWidth: 18,
                    height: 18,
                    borderRadius: 99,
                    background: isActive ? 'var(--accent-soft)' : 'var(--surface-2)',
                    color: isActive ? 'var(--accent-text)' : 'var(--text-dim)',
                    fontSize: 11,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingInline: 5,
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* List */}
      <div className="flex flex-col" style={{ gap: 10 }}>
        {unified.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '40px 0',
              fontSize: 13,
              color: 'var(--text-dim)',
            }}
          >
            No requests in this view.
          </div>
        )}
        {unified.map((item) =>
          item.kind === 'request' ? (
            <RequestCard key={item.data.id} request={item.data} />
          ) : (
            <SwapCard key={item.data.id} swap={item.data} />
          )
        )}
      </div>
    </div>
  );
}
