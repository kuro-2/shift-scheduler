'use client';

import { useState, useCallback, useEffect } from 'react';
import { X, Plus, ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useUIStore } from '@/store/ui.store';
import { Avatar } from '@/components/common/Avatar';

// ─── Mock data ────────────────────────────────────────────────────────────────

interface AssignedPerson {
  id: string;
  name: string;
  initials: string;
  color: string;
}

const MOCK_PEOPLE: AssignedPerson[] = [
  { id: 'emp_001', name: 'Alex Mercer', initials: 'AM', color: '#5B7FD4' },
];

const ROLES = [
  { id: 'role_1', name: 'Barista', color: '#5B7FD4' },
  { id: 'role_2', name: 'Shift Lead', color: '#7C6AC4' },
  { id: 'role_3', name: 'Cashier', color: '#5A9B6E' },
];

const DEPARTMENTS = ['Front of House', 'Kitchen', 'Management'];
const LOCATIONS = ['Main St.', 'Downtown', 'Eastside'];

const REPEAT_OPTIONS = ['Does not repeat', 'Daily', 'Weekly', 'Custom'];

// ─── Form state ───────────────────────────────────────────────────────────────

interface ShiftForm {
  assignedPeople: AssignedPerson[];
  openShift: boolean;
  roleId: string;
  department: string;
  date: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  location: string;
  notes: string;
  repeat: string;
}

function computeHours(start: string, end: string, breakMin: number): number {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const totalMin = eh * 60 + em - (sh * 60 + sm) - breakMin;
  return Math.max(0, totalMin / 60);
}

// ─── CreateShiftDrawer ────────────────────────────────────────────────────────

export function CreateShiftDrawer() {
  const createShiftOpen = useUIStore((s) => s.createShiftOpen);
  const setCreateShiftOpen = useUIStore((s) => s.setCreateShiftOpen);

  const close = useCallback(() => setCreateShiftOpen(false), [setCreateShiftOpen]);

  const selectedRole = ROLES[0];
  const HOURLY_RATE = 23;

  const [form, setForm] = useState<ShiftForm>({
    assignedPeople: [...MOCK_PEOPLE],
    openShift: false,
    roleId: ROLES[0].id,
    department: DEPARTMENTS[0],
    date: new Date().toISOString().slice(0, 10),
    startTime: '09:00',
    endTime: '16:30',
    breakMinutes: 30,
    location: LOCATIONS[0],
    notes: '',
    repeat: REPEAT_OPTIONS[0],
  });

  // Close on Escape
  useEffect(() => {
    if (!createShiftOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [createShiftOpen, close]);

  const hours = computeHours(form.startTime, form.endTime, form.breakMinutes);
  const estimatedCost = Math.round(hours * HOURLY_RATE);

  const removePerson = (id: string) => {
    setForm((f) => ({ ...f, assignedPeople: f.assignedPeople.filter((p) => p.id !== id) }));
  };

  const currentRole = ROLES.find((r) => r.id === form.roleId) ?? ROLES[0];

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

  return (
    <AnimatePresence>
      {createShiftOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="create-backdrop"
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
            key="create-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: 440,
              background: 'var(--surface)',
              borderLeft: '1px solid var(--border)',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 41,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div
              style={{
                height: 60,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 18px',
                borderBottom: '1px solid var(--border)',
                flexShrink: 0,
              }}
            >
              <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>
                Create shift
              </h2>
              <button
                onClick={close}
                aria-label="Close"
                style={{
                  width: 28,
                  height: 28,
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
                <X size={16} />
              </button>
            </div>

            {/* Scrollable body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 18 }}>
              {/* ── Section 1: Assign to ── */}
              <section style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Assign to</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {form.assignedPeople.map((person) => (
                    <div
                      key={person.id}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        height: 30,
                        paddingInline: 8,
                        borderRadius: 99,
                        background: 'var(--surface-2)',
                        border: '1px solid var(--border)',
                        fontSize: 12,
                        fontWeight: 500,
                        color: 'var(--text)',
                      }}
                    >
                      <Avatar
                        initials={person.initials}
                        color={person.color}
                        size={20}
                      />
                      {person.name}
                      <button
                        onClick={() => removePerson(person.id)}
                        style={{
                          display: 'flex',
                          border: 'none',
                          background: 'none',
                          cursor: 'pointer',
                          color: 'var(--text-dim)',
                          padding: 0,
                        }}
                        aria-label={`Remove ${person.name}`}
                      >
                        <X size={11} />
                      </button>
                    </div>
                  ))}

                  {/* Add person chip */}
                  <button
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      height: 30,
                      paddingInline: 10,
                      borderRadius: 99,
                      border: '1.5px dashed var(--border-strong)',
                      background: 'transparent',
                      color: 'var(--text-muted)',
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: 'pointer',
                    }}
                  >
                    <Plus size={12} />
                    Add person
                  </button>

                  {/* Open shift chip */}
                  <button
                    onClick={() =>
                      setForm((f) => ({ ...f, openShift: !f.openShift }))
                    }
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      height: 30,
                      paddingInline: 10,
                      borderRadius: 99,
                      border: `1.5px solid ${form.openShift ? 'var(--open-text)' : 'var(--border)'}`,
                      background: form.openShift ? 'var(--open-bg)' : 'transparent',
                      color: form.openShift ? 'var(--open-text)' : 'var(--text-muted)',
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: 'pointer',
                    }}
                  >
                    Open shift
                  </button>
                </div>
              </section>

              {/* ── Section 2: Role + Department ── */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 12,
                  marginBottom: 20,
                }}
              >
                <div>
                  <label style={labelStyle}>Role</label>
                  <div style={{ position: 'relative' }}>
                    <div
                      style={{
                        position: 'absolute',
                        left: 10,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: currentRole.color,
                      }}
                    />
                    <select
                      value={form.roleId}
                      onChange={(e) => setForm((f) => ({ ...f, roleId: e.target.value }))}
                      style={{ ...inputStyle, paddingLeft: 24 }}
                    >
                      {ROLES.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Department</label>
                  <select
                    value={form.department}
                    onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                    style={inputStyle}
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ── Section 3: Date / Time grid ── */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 12,
                  marginBottom: 20,
                }}
              >
                <div>
                  <label style={labelStyle}>Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Start time</label>
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>End time</label>
                  <input
                    type="time"
                    value={form.endTime}
                    onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Break (min)</label>
                  <input
                    type="number"
                    min={0}
                    max={120}
                    value={form.breakMinutes}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, breakMinutes: Number(e.target.value) }))
                    }
                    style={inputStyle}
                  />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Location</label>
                  <select
                    value={form.location}
                    onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                    style={inputStyle}
                  >
                    {LOCATIONS.map((l) => (
                      <option key={l}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ── Section 4: Estimate strip ── */}
              <div
                style={{
                  borderRadius: 8,
                  background: 'var(--surface-2)',
                  padding: '10px 14px',
                  marginBottom: 20,
                  fontSize: 13,
                  color: 'var(--text-muted)',
                }}
              >
                <span style={{ color: 'var(--text)', fontWeight: 600 }}>
                  {hours.toFixed(1)}h shift
                </span>
                {' · '}estimated{' '}
                <span style={{ color: 'var(--text)', fontWeight: 600 }}>
                  ${estimatedCost}
                </span>{' '}
                at ${HOURLY_RATE}/h
              </div>

              {/* ── Section 5: Notes ── */}
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="Add a note for this shift…"
                  rows={3}
                  style={{
                    ...inputStyle,
                    height: 'auto',
                    padding: '8px 10px',
                    resize: 'vertical',
                  }}
                />
              </div>

              {/* ── Section 6: Repeat ── */}
              <div style={{ marginBottom: 8 }}>
                <label style={labelStyle}>Repeat</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {REPEAT_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setForm((f) => ({ ...f, repeat: opt }))}
                      style={{
                        height: 30,
                        paddingInline: 12,
                        borderRadius: 99,
                        border: `1px solid ${form.repeat === opt ? 'var(--accent)' : 'var(--border)'}`,
                        background:
                          form.repeat === opt ? 'var(--accent-soft)' : 'var(--surface-2)',
                        color:
                          form.repeat === opt ? 'var(--accent-text)' : 'var(--text-muted)',
                        fontSize: 12,
                        fontWeight: 500,
                        cursor: 'pointer',
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                borderTop: '1px solid var(--border)',
                padding: '12px 18px',
                display: 'flex',
                gap: 10,
                flexShrink: 0,
              }}
            >
              <button
                style={{
                  flex: 1,
                  height: 36,
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: 'var(--surface-2)',
                  color: 'var(--text)',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Save as draft
              </button>
              <button
                style={{
                  flex: 1,
                  height: 36,
                  borderRadius: 8,
                  border: 'none',
                  background: 'var(--accent)',
                  color: '#FFFFFF',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Publish shift
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
