'use client';

import { useCallback, useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Mail, Phone, MapPin, Check, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  getEmployee,
  getDepartmentById,
  getRoleById,
  getLocationById,
  updateEmployee,
  deleteEmployee,
  ROLES,
  DEPARTMENTS,
} from '@/services/employees.service';
import { Avatar } from '@/components/common/Avatar';
import { StatusPill } from '@/components/common/StatusPill';
import { formatHourlyRate } from '@/lib/format';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function daysUntil(iso: string): number {
  const target = new Date(iso + 'T00:00:00').getTime();
  const now = new Date('2026-06-30T00:00:00').getTime();
  return Math.round((target - now) / 86_400_000);
}

const editLabelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: 'var(--text-dim)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  marginBottom: 5,
  display: 'block',
};

const editInputStyle: React.CSSProperties = {
  width: '100%',
  height: 34,
  padding: '0 10px',
  borderRadius: 7,
  border: '1px solid var(--border)',
  background: 'var(--surface-2)',
  color: 'var(--text)',
  fontSize: 13,
  outline: 'none',
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface EmployeeProfileDrawerProps {
  employeeId: string | null;
  onClose: () => void;
}

export function EmployeeProfileDrawer({ employeeId, onClose }: EmployeeProfileDrawerProps) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '', hourlyRate: '', roleId: '', departmentId: '' });

  const close = useCallback(() => {
    onClose();
    setEditing(false);
  }, [onClose]);

  const { data: employee, isLoading } = useQuery({
    queryKey: ['employee', employeeId],
    queryFn: () => getEmployee(employeeId!),
    enabled: !!employeeId,
  });

  // Close on Escape
  useEffect(() => {
    if (!employeeId) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [employeeId, close]);

  function startEditing() {
    if (!employee) return;
    setEditForm({
      name: employee.name,
      email: employee.email,
      hourlyRate: employee.hourlyRate ? String(employee.hourlyRate) : '',
      roleId: employee.roleId,
      departmentId: employee.departmentId,
    });
    setEditing(true);
  }

  async function saveEdit() {
    if (!employee) return;
    setSaving(true);
    try {
      await updateEmployee(employee.id, {
        name: editForm.name,
        email: editForm.email,
        hourlyRate: editForm.hourlyRate ? Number(editForm.hourlyRate) : undefined,
        roleId: editForm.roleId,
        departmentId: editForm.departmentId,
      });
      await queryClient.invalidateQueries({ queryKey: ['employee', employee.id] });
      await queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Profile updated');
      setEditing(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove() {
    if (!employee) return;
    if (!window.confirm(`Remove ${employee.name} from the workspace?`)) return;
    try {
      await deleteEmployee(employee.id);
      await queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success(`${employee.name} removed from workspace`);
      close();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to remove employee');
    }
  }

  const role = employee ? getRoleById(employee.roleId) : undefined;
  const department = employee ? getDepartmentById(employee.departmentId) : undefined;
  const locations = employee
    ? employee.locationIds.map((id) => getLocationById(id)).filter(Boolean)
    : [];

  const isOpen = !!employeeId;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="profile-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={close}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.18)',
              zIndex: 40,
            }}
          />

          {/* Drawer */}
          <motion.aside
            key="profile-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: 'min(440px, 100vw)',
              background: 'var(--surface)',
              borderLeft: '1px solid var(--border)',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 41,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
            role="dialog"
            aria-label="Employee profile"
          >
            {isLoading || !employee ? (
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
                {isLoading ? 'Loading…' : 'Employee not found'}
              </div>
            ) : (
              <>
                {/* Header */}
                <div
                  style={{
                    padding: '18px 18px 16px',
                    borderBottom: '1px solid var(--border)',
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      marginBottom: 14,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <Avatar
                        initials={employee.initials}
                        color={employee.avatarColor}
                        size={56}
                      />
                      <div>
                        <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)' }}>
                          {employee.name}
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                          {role?.name ?? employee.roleId}
                          {department && <> · {department.name}</>}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={close}
                      aria-label="Close"
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 'var(--radius-sm)',
                        border: 'none',
                        background: 'transparent',
                        color: 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <StatusPill status={employee.status} size="sm" />
                    <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>
                      Active since {formatDate(employee.startDate)}
                    </span>
                  </div>
                </div>

                {/* Scrollable body */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '18px 18px' }}>
                  {editing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <div>
                        <label style={editLabelStyle}>Name</label>
                        <input
                          value={editForm.name}
                          onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                          style={editInputStyle}
                        />
                      </div>
                      <div>
                        <label style={editLabelStyle}>Email</label>
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                          style={editInputStyle}
                        />
                      </div>
                      <div>
                        <label style={editLabelStyle}>Hourly rate</label>
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={editForm.hourlyRate}
                          onChange={(e) => setEditForm((f) => ({ ...f, hourlyRate: e.target.value }))}
                          style={editInputStyle}
                        />
                      </div>
                      <div>
                        <label style={editLabelStyle}>Role</label>
                        <select
                          value={editForm.roleId}
                          onChange={(e) => setEditForm((f) => ({ ...f, roleId: e.target.value }))}
                          style={editInputStyle}
                        >
                          {ROLES.map((r) => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={editLabelStyle}>Department</label>
                        <select
                          value={editForm.departmentId}
                          onChange={(e) => setEditForm((f) => ({ ...f, departmentId: e.target.value }))}
                          style={editInputStyle}
                        >
                          {DEPARTMENTS.map((d) => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ) : (
                    <>
                  {/* Contact section */}
                  <div
                    style={{
                      marginBottom: 20,
                      paddingBottom: 20,
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        color: 'var(--text-dim)',
                        marginBottom: 10,
                      }}
                    >
                      Contact
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Mail size={14} style={{ color: 'var(--text-dim)', flexShrink: 0 }} />
                        <span style={{ fontSize: 13, color: 'var(--text)' }}>{employee.email}</span>
                      </div>
                      {employee.emergencyContact && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Phone size={14} style={{ color: 'var(--text-dim)', flexShrink: 0 }} />
                          <span style={{ fontSize: 13, color: 'var(--text)' }}>
                            {employee.emergencyContact.phone}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stats 2x2 grid */}
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
                      { label: 'Scheduled hours', value: `${employee.scheduledHours}h` },
                      { label: 'Contract hours', value: `${employee.contractHours}h` },
                      {
                        label: 'Hourly rate',
                        value: employee.hourlyRate ? formatHourlyRate(employee.hourlyRate) : '—',
                      },
                      { label: 'Status', value: null },
                    ].map((stat) => (
                      <div key={stat.label}>
                        <div
                          style={{
                            fontSize: 11,
                            color: 'var(--text-dim)',
                            marginBottom: 3,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            fontWeight: 600,
                          }}
                        >
                          {stat.label}
                        </div>
                        {stat.value !== null ? (
                          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>
                            {stat.value}
                          </div>
                        ) : (
                          <StatusPill status={employee.status} size="sm" />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Skills section */}
                  {employee.skills.length > 0 && (
                    <div
                      style={{
                        marginBottom: 20,
                        paddingBottom: 20,
                        borderBottom: '1px solid var(--border)',
                      }}
                    >
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          color: 'var(--text-dim)',
                          marginBottom: 10,
                        }}
                      >
                        Skills
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {employee.skills.map((skill) => (
                          <span
                            key={skill}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                              fontSize: 12,
                              fontWeight: 500,
                              color: 'var(--filled-text)',
                              background: 'var(--filled-bg)',
                              borderRadius: 99,
                              padding: '4px 10px',
                            }}
                          >
                            <Check size={11} />
                            {skill.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Certifications section */}
                  {employee.certifications.length > 0 && (
                    <div
                      style={{
                        marginBottom: 20,
                        paddingBottom: 20,
                        borderBottom: '1px solid var(--border)',
                      }}
                    >
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          color: 'var(--text-dim)',
                          marginBottom: 10,
                        }}
                      >
                        Certifications
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {employee.certifications.map((cert) => {
                          const remaining = daysUntil(cert.expiresAt);
                          const expiringSoon = remaining >= 0 && remaining <= 30;
                          return (
                            <div
                              key={cert.name}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 8,
                              }}
                            >
                              <span style={{ fontSize: 13, color: 'var(--text)' }}>
                                {cert.name}
                              </span>
                              <span
                                style={{
                                  fontSize: 12,
                                  fontFamily: 'var(--font-mono)',
                                  color: expiringSoon
                                    ? 'var(--conflict-text)'
                                    : 'var(--text-dim)',
                                }}
                              >
                                {expiringSoon ? 'Expires ' : ''}
                                {formatDate(cert.expiresAt)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Locations section */}
                  {locations.length > 0 && (
                    <div>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          color: 'var(--text-dim)',
                          marginBottom: 10,
                        }}
                      >
                        Locations
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {locations.map((loc) => (
                          <div
                            key={loc!.id}
                            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                          >
                            <MapPin
                              size={14}
                              style={{ color: 'var(--text-dim)', flexShrink: 0 }}
                            />
                            <span style={{ fontSize: 13, color: 'var(--text)' }}>
                              {loc!.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                    </>
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
                  {editing ? (
                    <>
                      <button
                        onClick={() => setEditing(false)}
                        disabled={saving}
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          fontSize: 13,
                          fontWeight: 500,
                          color: 'var(--text)',
                          background: 'var(--surface)',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '8px 0',
                          cursor: saving ? 'default' : 'pointer',
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={saveEdit}
                        disabled={saving}
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          fontSize: 13,
                          fontWeight: 600,
                          color: '#FFFFFF',
                          background: 'var(--accent)',
                          border: 'none',
                          borderRadius: 'var(--radius-sm)',
                          padding: '8px 0',
                          cursor: saving ? 'default' : 'pointer',
                          opacity: saving ? 0.6 : 1,
                        }}
                      >
                        {saving ? 'Saving…' : 'Save changes'}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={startEditing}
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          fontSize: 13,
                          fontWeight: 500,
                          color: 'var(--text)',
                          background: 'var(--surface)',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '8px 0',
                          cursor: 'pointer',
                        }}
                      >
                        <Pencil size={13} />
                        Edit profile
                      </button>
                      <button
                        onClick={handleRemove}
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          fontSize: 13,
                          fontWeight: 500,
                          color: 'var(--conflict-text)',
                          background: 'var(--surface)',
                          border: '1px solid var(--conflict-border)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '8px 0',
                          cursor: 'pointer',
                        }}
                      >
                        <Trash2 size={13} />
                        Remove
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
