'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, Check } from 'lucide-react';
import { toast } from 'sonner';
import { getEmployeeById } from '@/services/employees.service';
import {
  approveShiftSwap,
  rejectShiftSwap,
  type ShiftSwapWithInfo,
} from '@/services/time-off.service';
import { Avatar } from '@/components/common/Avatar';
import { formatRelative } from '@/lib/date';

interface SwapCardProps {
  swap: ShiftSwapWithInfo;
}

export function SwapCard({ swap }: SwapCardProps) {
  const queryClient = useQueryClient();
  const fromEmployee = getEmployeeById(swap.fromEmployeeId);
  const toEmployee = getEmployeeById(swap.toEmployeeId);

  const approveMutation = useMutation({
    mutationFn: () => approveShiftSwap(swap.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shift-swaps'] });
      toast.success('Request approved');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: () => rejectShiftSwap(swap.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shift-swaps'] });
      toast('Request declined');
    },
  });

  const isPending = swap.status === 'pending';
  const isBusy = approveMutation.isPending || rejectMutation.isPending;

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: 16,
        display: 'flex',
        flexDirection: 'row',
        gap: 14,
      }}
    >
      {/* Overlapping avatars */}
      <div className="flex items-center" style={{ flexShrink: 0 }}>
        <Avatar
          initials={fromEmployee?.initials ?? '?'}
          color={fromEmployee?.avatarColor ?? 'var(--text-dim)'}
          size={36}
          className="z-10"
          style={{ border: '2px solid var(--surface)' }}
        />
        <Avatar
          initials={toEmployee?.initials ?? '?'}
          color={toEmployee?.avatarColor ?? 'var(--text-dim)'}
          size={36}
          style={{ marginLeft: -10, border: '2px solid var(--surface)' }}
        />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Row 1: title + pill + relative time */}
        <div className="flex items-center" style={{ gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
            {fromEmployee?.name ?? 'Unknown'} &harr; {toEmployee?.name ?? 'Unknown'}
          </span>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              paddingInline: 8,
              paddingBlock: 2,
              borderRadius: 99,
              background: 'var(--accent-soft)',
              color: 'var(--accent-text)',
              fontSize: 11,
              fontWeight: 500,
            }}
          >
            Shift swap
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>
            requested {formatRelative(swap.submittedAt)}
          </span>
        </div>

        {/* Row 2: description */}
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
          <span style={{ fontWeight: 600, color: 'var(--text)' }}>{swap.fromShiftInfo.dayLabel}</span> —{' '}
          {fromEmployee?.name ?? 'Unknown'}&apos;s {swap.fromShiftInfo.startTime}–{swap.fromShiftInfo.endTime}{' '}
          {swap.fromShiftInfo.role} in exchange for {toEmployee?.name ?? 'Unknown'}&apos;s{' '}
          {swap.toShiftInfo.startTime}–{swap.toShiftInfo.endTime} {swap.toShiftInfo.role}
        </div>

        {/* Row 3: conflict line */}
        <div className="flex items-center" style={{ gap: 6, marginTop: 8 }}>
          {swap.conflictCheck.hasConflict ? (
            <AlertTriangle size={14} style={{ color: 'var(--open-text)', flexShrink: 0 }} />
          ) : (
            <Check size={14} style={{ color: 'var(--filled-text)', flexShrink: 0 }} />
          )}
          <span
            style={{
              fontSize: 12,
              color: swap.conflictCheck.hasConflict ? 'var(--open-text)' : 'var(--filled-text)',
            }}
          >
            {swap.conflictCheck.hasConflict
              ? swap.conflictCheck.reasons[0] ?? 'Potential conflict detected'
              : 'No conflicts · Both have required skills'}
          </span>
        </div>
      </div>

      {isPending && (
        <div className="flex items-center" style={{ gap: 8, flexShrink: 0 }}>
          <button
            onClick={() => rejectMutation.mutate()}
            disabled={isBusy}
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: 'var(--text)',
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '7px 14px',
              cursor: isBusy ? 'default' : 'pointer',
              opacity: isBusy ? 0.6 : 1,
            }}
          >
            Decline
          </button>
          <button
            onClick={() => approveMutation.mutate()}
            disabled={isBusy}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--accent)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--text)';
            }}
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: '#FFFFFF',
              background: 'var(--text)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              padding: '7px 14px',
              cursor: isBusy ? 'default' : 'pointer',
              opacity: isBusy ? 0.6 : 1,
              transition: 'background 0.15s ease',
            }}
          >
            Approve
          </button>
        </div>
      )}
    </div>
  );
}
