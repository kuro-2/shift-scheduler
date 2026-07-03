'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';
import { createEmployee, getLocations, ROLES, DEPARTMENTS } from '@/services/employees.service';

interface InvitePersonModalProps {
  open: boolean;
  onClose: () => void;
}

const inputStyle: React.CSSProperties = {
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

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: 'var(--text-dim)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  marginBottom: 5,
  display: 'block',
};

export function InvitePersonModal({ open, onClose }: InvitePersonModalProps) {
  const queryClient = useQueryClient();
  const { data: locations } = useQuery({ queryKey: ['locations'], queryFn: () => getLocations() });
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [roleId, setRoleId] = useState(ROLES[0].id);
  const [locationId, setLocationId] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [saving, setSaving] = useState(false);

  function reset() {
    setName('');
    setEmail('');
    setRoleId(ROLES[0].id);
    setHourlyRate('');
  }

  async function handleSubmit() {
    if (!name.trim() || !email.trim()) {
      toast.error('Name and email are required');
      return;
    }
    const role = ROLES.find((r) => r.id === roleId) ?? ROLES[0];
    const department = DEPARTMENTS.find((d) => d.id === role.departmentId);
    const loc = locations?.find((l) => (l.locationId ?? l.id) === locationId);
    const [firstName, ...rest] = name.trim().split(/\s+/);

    setSaving(true);
    try {
      await createEmployee({
        name,
        email,
        firstName,
        lastName: rest.join(' '),
        jobTitle: role.name,
        jobRole: role.name,
        department: department?.name ?? '',
        employmentType: 'Full-time',
        hourlyRate: hourlyRate ? Number(hourlyRate) : 0,
        hireDate: new Date().toISOString().slice(0, 10),
        locationId: loc?.locationId ?? loc?.id,
      });
      await queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success(`${name} added — invite sent to ${email}`);
      reset();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to invite person');
    } finally {
      setSaving(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="invite-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)', zIndex: 70 }}
          />
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 71,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 16,
              pointerEvents: 'none',
            }}
          >
          <motion.div
            key="invite-modal"
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.15 }}
            style={{
              width: 400,
              maxWidth: '100%',
              maxHeight: '100%',
              pointerEvents: 'auto',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
            role="dialog"
            aria-label="Invite person"
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                borderBottom: '1px solid var(--border)',
                flexShrink: 0,
              }}
            >
              <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>Invite person</h2>
              <button
                onClick={onClose}
                aria-label="Close"
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 6,
                  border: 'none',
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

            <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto', flex: 1, minHeight: 0 }}>
              <div>
                <label style={labelStyle}>Full name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} placeholder="Jamie Rivera" />
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={inputStyle}
                  placeholder="jamie@nexora.co"
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Role</label>
                  <select value={roleId} onChange={(e) => setRoleId(e.target.value)} style={inputStyle}>
                    {ROLES.map((r) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Hourly rate</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    style={inputStyle}
                    placeholder="20.00"
                  />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Location</label>
                <select value={locationId} onChange={(e) => setLocationId(e.target.value)} style={inputStyle}>
                  <option value="">Select a location</option>
                  {(locations ?? []).map((l) => (
                    <option key={l.id} value={l.locationId ?? l.id}>{l.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                gap: 10,
                padding: '12px 18px',
                borderTop: '1px solid var(--border)',
                flexShrink: 0,
              }}
            >
              <button
                onClick={onClose}
                disabled={saving}
                style={{
                  flex: 1,
                  height: 36,
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: 'var(--surface-2)',
                  color: 'var(--text)',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: saving ? 'default' : 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                style={{
                  flex: 1,
                  height: 36,
                  borderRadius: 8,
                  border: 'none',
                  background: 'var(--accent)',
                  color: '#FFFFFF',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: saving ? 'default' : 'pointer',
                  opacity: saving ? 0.6 : 1,
                }}
              >
                {saving ? 'Sending…' : 'Send invite'}
              </button>
            </div>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
