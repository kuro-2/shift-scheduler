'use client';

import { useQuery } from '@tanstack/react-query';
import { X, Edit2, Copy, Trash2, Mail, Clock, Coffee, MapPin, DollarSign } from 'lucide-react';
import { getShift } from '@/services/shifts.service';
import {
  getEmployeeById,
  getRoleById,
  getDepartmentById,
  getLocationById,
} from '@/services/employees.service';
import { useUIStore } from '@/store/ui.store';
import { StatusPill } from '@/components/common/StatusPill';
import { formatShiftDuration } from '@/lib/format';
import type { ShiftStatus } from '@/types';

export function ShiftDetailDrawer() {
  const selectedShiftId = useUIStore((s) => s.selectedShiftId);
  const setSelectedShiftId = useUIStore((s) => s.setSelectedShiftId);

  const { data: shift, isLoading } = useQuery({
    queryKey: ['shift', selectedShiftId],
    queryFn: () => getShift(selectedShiftId!),
    enabled: !!selectedShiftId,
  });

  if (!selectedShiftId) return null;

  const employee = shift?.employeeId ? getEmployeeById(shift.employeeId) : undefined;
  const role = shift ? getRoleById(shift.roleId) : undefined;
  const department = shift ? getDepartmentById(shift.departmentId) : undefined;
  const location = shift ? getLocationById(shift.locationId) : undefined;

  const duration = shift
    ? formatShiftDuration(shift.startTime, shift.endTime, shift.breakMinutes)
    : '—';

  const cost =
    shift && employee?.hourlyRate
      ? (() => {
          const [sh, sm] = shift.startTime.split(':').map(Number);
          const [eh, em] = shift.endTime.split(':').map(Number);
          let mins = eh * 60 + em - (sh * 60 + sm);
          if (mins < 0) mins += 24 * 60;
          const netHours = Math.max(0, mins - shift.breakMinutes) / 60;
          return `$${(netHours * employee.hourlyRate).toFixed(2)}`;
        })()
      : '—';

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => setSelectedShiftId(null)}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 40,
          background: 'rgba(31,26,20,0.18)',
        }}
        aria-hidden
      />

      {/* Drawer */}
      <div
        className="animate-drawer-in"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 360,
          zIndex: 50,
          background: 'var(--surface)',
          borderLeft: '1px solid var(--border)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        role="dialog"
        aria-label="Shift details"
      >
        {isLoading || !shift ? (
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-dim)',
              fontSize: 14,
            }}
          >
            {isLoading ? 'Loading…' : 'Shift not found'}
          </div>
        ) : (
          <>
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                borderBottom: '1px solid var(--border)',
                flexShrink: 0,
              }}
            >
              <StatusPill status={shift.status as ShiftStatus} size="sm" />
              <button
                onClick={() => setSelectedShiftId(null)}
                aria-label="Close"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  background: 'transparent',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={15} />
              </button>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px' }}>
              {/* Day + time */}
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 600,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text)',
                  lineHeight: 1.2,
                  marginBottom: 4,
                }}
              >
                {shift.startTime} – {shift.endTime}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
                {new Date(shift.date + 'T00:00:00').toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>

              {/* Role · Dept */}
              <div
                style={{
                  fontSize: 14,
                  color: 'var(--text)',
                  marginBottom: 20,
                  paddingBottom: 20,
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <strong>{role?.name ?? shift.roleId}</strong>
                {department && (
                  <span style={{ color: 'var(--text-muted)' }}> · {department.name}</span>
                )}
              </div>

              {/* Assigned section */}
              <div style={{ marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-dim)', marginBottom: 10 }}>
                  Assigned
                </div>
                {employee ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        background: employee.avatarColor,
                        color: '#FFFFFF',
                        fontSize: 13,
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {employee.initials}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>
                        {employee.name}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>
                        {employee.email}
                      </div>
                    </div>
                    <button
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        fontSize: 12,
                        fontWeight: 500,
                        color: 'var(--accent-text)',
                        background: 'var(--accent-soft)',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        padding: '5px 10px',
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                    >
                      <Mail size={12} />
                      Message
                    </button>
                  </div>
                ) : (
                  <div style={{ fontSize: 13, color: 'var(--text-dim)' }}>Unassigned</div>
                )}
              </div>

              {/* Info 2×2 grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 12,
                  marginBottom: 20,
                  paddingBottom: 20,
                  borderBottom: '1px solid var(--border)',
                }}
              >
                {[
                  { icon: <Clock size={13} />, label: 'Duration', value: duration },
                  { icon: <Coffee size={13} />, label: 'Break', value: `${shift.breakMinutes}m` },
                  {
                    icon: <MapPin size={13} />,
                    label: 'Location',
                    value: location?.name ?? shift.locationId,
                  },
                  { icon: <DollarSign size={13} />, label: 'Cost', value: cost },
                ].map((info) => (
                  <div key={info.label}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: 11,
                        color: 'var(--text-dim)',
                        marginBottom: 3,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        fontWeight: 600,
                      }}
                    >
                      {info.icon}
                      {info.label}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>
                      {info.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Notes */}
              {shift.notes && (
                <div style={{ marginBottom: 20 }}>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: 'var(--text-dim)',
                      marginBottom: 6,
                    }}
                  >
                    Notes
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: 'var(--text-muted)',
                      lineHeight: 1.5,
                      background: 'var(--surface-2)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '8px 12px',
                    }}
                  >
                    {shift.notes}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              style={{
                display: 'flex',
                gap: 8,
                padding: '12px 16px',
                borderTop: '1px solid var(--border)',
                flexShrink: 0,
              }}
            >
              <button
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 5,
                  fontSize: 13,
                  fontWeight: 500,
                  color: 'var(--text)',
                  background: 'var(--surface-2)',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  padding: '8px 0',
                  cursor: 'pointer',
                }}
              >
                <Edit2 size={13} />
                Edit
              </button>
              <button
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 5,
                  fontSize: 13,
                  fontWeight: 500,
                  color: 'var(--text)',
                  background: 'var(--surface-2)',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  padding: '8px 0',
                  cursor: 'pointer',
                }}
              >
                <Copy size={13} />
                Duplicate
              </button>
              <button
                style={{
                  width: 38,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  fontWeight: 500,
                  color: 'var(--conflict-text)',
                  background: 'var(--conflict-bg)',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
