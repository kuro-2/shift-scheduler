'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, Check } from 'lucide-react';
import { toast } from 'sonner';
import type { TimeOffRequest, TimeOffType } from '@/types';
import { getEmployeeById } from '@/services/employees.service';
import { approveTimeOffRequest, rejectTimeOffRequest } from '@/services/time-off.service';
import { Avatar } from '@/components/common/Avatar';
import { formatLongDate, formatRelative, daysBetween, parseISO, isSameDay } from '@/lib/date';

interface RequestCardProps {
  request: TimeOffRequest;
}

const TYPE_PILL: Record<TimeOffType, { bg: string; text: string; label: string }> = {
  vacation: { bg: 'var(--pending-bg)', text: 'var(--pending-text)', label: 'Vacation' },
  sick: { bg: 'var(--open-bg)', text: 'var(--open-text)', label: 'Sick' },
  personal: { bg: 'var(--draft-bg)', text: 'var(--draft-text)', label: 'Personal' },
  unpaid: { bg: 'var(--draft-bg)', text: 'var(--draft-text)', label: 'Unpaid' },
};

/**
 * Derives a plausible coverage-impact message for a time-off request.
 * In a real system this would come from a scheduling engine; here we
 * derive a deterministic, believable message from the request's data.
 */
function getImpact(request: TimeOffRequest, employeeName: string): { hasConflict: boolean; message: string } {
  const days = daysBetween(request.startDate, request.endDate);
  // Deterministic pseudo-randomness based on id so the message is stable across renders.
  const hash = request.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const hasConflict = request.status === 'pending' && hash % 2 === 0;

  if (hasConflict) {
    const shiftsUncovered = Math.max(1, Math.min(days, (hash % 3) + 1));
    return {
      hasConflict: true,
      message: `No backup scheduled for ${employeeName} — ${shiftsUncovered} shift${shiftsUncovered > 1 ? 's' : ''} uncovered`,
    };
  }

  return { hasConflict: false, message: 'No conflicts detected' };
}

export function RequestCard({ request }: RequestCardProps) {
  const queryClient = useQueryClient();
  const employee = getEmployeeById(request.employeeId);
  const pill = TYPE_PILL[request.type];
  const days = daysBetween(request.startDate, request.endDate);
  const sameDay = isSameDay(parseISO(request.startDate), parseISO(request.endDate));
  const impact = getImpact(request, employee?.name ?? 'this employee');

  const approveMutation = useMutation({
    mutationFn: () => approveTimeOffRequest(request.id, 'emp_004'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-off-requests'] });
      toast.success('Request approved');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: () => rejectTimeOffRequest(request.id, 'emp_004'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-off-requests'] });
      toast('Request declined');
    },
  });

  const isPending = request.status === 'pending';
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
      <Avatar
        initials={employee?.initials ?? '?'}
        color={employee?.avatarColor ?? 'var(--text-dim)'}
        size={36}
      />

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Row 1: name + type pill + relative time */}
        <div className="flex items-center" style={{ gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
            {employee?.name ?? 'Unknown employee'}
          </span>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              paddingInline: 8,
              paddingBlock: 2,
              borderRadius: 99,
              background: pill.bg,
              color: pill.text,
              fontSize: 11,
              fontWeight: 500,
            }}
          >
            {pill.label}
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>
            requested {formatRelative(request.submittedAt)}
          </span>
        </div>

        {/* Row 2: date range + days + reason */}
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
          <span style={{ fontWeight: 600, color: 'var(--text)' }}>
            {sameDay
              ? formatLongDate(request.startDate)
              : `${formatLongDate(request.startDate)} – ${formatLongDate(request.endDate)}`}
          </span>
          <span>
            {' '}
            · {days} day{days > 1 ? 's' : ''}
            {request.reason ? ` · ${request.reason}` : ''}
          </span>
        </div>

        {/* Row 3: impact line */}
        <div className="flex items-center" style={{ gap: 6, marginTop: 8 }}>
          {impact.hasConflict ? (
            <AlertTriangle size={14} style={{ color: 'var(--conflict-text)', flexShrink: 0 }} />
          ) : (
            <Check size={14} style={{ color: 'var(--filled-text)', flexShrink: 0 }} />
          )}
          <span
            style={{
              fontSize: 12,
              color: impact.hasConflict ? 'var(--conflict-text)' : 'var(--filled-text)',
            }}
          >
            {impact.message}
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
