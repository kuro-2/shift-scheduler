'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { X, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useUIStore } from '@/store/ui.store';
import { useAuthStore } from '@/store/auth.store';
import { Avatar } from '@/components/common/Avatar';
import { getEmployees, getLocations, getEmployeeById, DEPARTMENTS } from '@/services/employees.service';
import { createShift, updateShift, getShift } from '@/services/shifts.service';
import type { CreateShiftInput } from '@/types';

// ─── Assigned person (subset of Employee used for the chip UI) ───────────────

interface AssignedPerson {
  id: string;
  name: string;
  initials: string;
  color: string;
}

const REPEAT_OPTIONS = ['Does not repeat', 'Daily', 'Weekly', 'Custom'];

// ─── Form state ───────────────────────────────────────────────────────────────

interface ShiftForm {
  assignedPeople: AssignedPerson[];
  openShift: boolean;
  roleId: string;
  departmentId: string;
  date: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  locationId: string;
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

const DEFAULT_FORM: ShiftForm = {
  assignedPeople: [],
  openShift: false,
  roleId: '',
  departmentId: DEPARTMENTS[0].id,
  date: new Date().toISOString().slice(0, 10),
  startTime: '09:00',
  endTime: '16:30',
  breakMinutes: 30,
  locationId: '',
  notes: '',
  repeat: REPEAT_OPTIONS[0],
};

export function CreateShiftDrawer() {
  const createShiftOpen = useUIStore((s) => s.createShiftOpen);
  const setCreateShiftOpen = useUIStore((s) => s.setCreateShiftOpen);
  const editingShiftId = useUIStore((s) => s.editingShiftId);
  const setEditingShiftId = useUIStore((s) => s.setEditingShiftId);
  const createShiftDefaults = useUIStore((s) => s.createShiftDefaults);
  const setCreateShiftDefaults = useUIStore((s) => s.setCreateShiftDefaults);
  const queryClient = useQueryClient();

  const isEditing = !!editingShiftId;

  const close = useCallback(() => {
    setCreateShiftOpen(false);
    setEditingShiftId(null);
    setCreateShiftDefaults(null);
  }, [setCreateShiftOpen, setEditingShiftId, setCreateShiftDefaults]);

  const [form, setForm] = useState<ShiftForm>(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const sessionLocationId = useAuthStore((s) => s.user?.locationId);
  const { data: employees } = useQuery({ queryKey: ['employees'], queryFn: () => getEmployees() });
  const { data: locations } = useQuery({ queryKey: ['locations'], queryFn: () => getLocations() });
  const { data: editingShift } = useQuery({
    queryKey: ['shift', editingShiftId],
    queryFn: () => getShift(editingShiftId!),
    enabled: !!editingShiftId,
  });

  // Restrict the location picker to the logged-in user's own location — managers
  // create shifts for their own store, not other locations across the company
  const availableLocations = useMemo(
    () =>
      (locations ?? []).filter(
        (l) => !sessionLocationId || (l.locationId ?? l.id) === sessionLocationId
      ),
    [locations, sessionLocationId]
  );

  // Default location (create mode only)
  const defaultLocationId =
    !isEditing && availableLocations.length > 0
      ? (availableLocations[0].locationId ?? availableLocations[0].id)
      : '';
  const effectiveLocationId = form.locationId || defaultLocationId;

  // Role options are the real job titles held by employees at the selected location
  const locationJobTitles = useMemo(() => {
    const titles = new Set<string>();
    for (const e of employees ?? []) {
      if (effectiveLocationId && !e.locationIds.includes(effectiveLocationId)) continue;
      if (e.jobTitle) titles.add(e.jobTitle);
    }
    return Array.from(titles).sort();
  }, [employees, effectiveLocationId]);
  const effectiveRoleId = form.roleId || locationJobTitles[0] || '';

  // Reset the form each time the drawer opens fresh (create mode), applying any prefill
  useEffect(() => {
    if (!createShiftOpen || editingShiftId) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reinitializing local form state when the drawer's open/edit target changes
    setForm({
      ...DEFAULT_FORM,
      date: createShiftDefaults?.date ?? DEFAULT_FORM.date,
      openShift: createShiftDefaults?.openShift ?? DEFAULT_FORM.openShift,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run when the drawer (re)opens fresh, not on every defaults change
  }, [createShiftOpen, editingShiftId]);

  // Pre-fill the assigned person once employees have loaded, if a prefill employee was requested
  useEffect(() => {
    if (!createShiftOpen || editingShiftId || !createShiftDefaults?.employeeId || !employees) return;
    const emp = employees.find((e) => e.id === createShiftDefaults.employeeId);
    if (!emp) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- pre-filling the assigned person once the employees query resolves
    setForm((f) =>
      f.assignedPeople.some((p) => p.id === emp.id)
        ? f
        : {
            ...f,
            openShift: false,
            assignedPeople: [
              ...f.assignedPeople,
              { id: emp.id, name: emp.name, initials: emp.initials, color: emp.avatarColor },
            ],
          }
    );
  }, [createShiftOpen, editingShiftId, createShiftDefaults, employees]);

  // Populate the form from the shift being edited once it loads
  useEffect(() => {
    if (!editingShift) return;
    const emp = editingShift.employeeId ? getEmployeeById(editingShift.employeeId) : undefined;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- pre-filling the form once the async shift-to-edit query resolves
    setForm({
      assignedPeople: emp
        ? [{ id: emp.id, name: emp.name, initials: emp.initials, color: emp.avatarColor }]
        : [],
      openShift: !editingShift.employeeId,
      roleId: editingShift.roleId,
      departmentId: editingShift.departmentId,
      date: editingShift.date,
      startTime: editingShift.startTime,
      endTime: editingShift.endTime,
      breakMinutes: editingShift.breakMinutes,
      locationId: editingShift.locationId,
      notes: editingShift.notes ?? '',
      repeat: REPEAT_OPTIONS[0],
    });
  }, [editingShift]);

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
  const assignedEmployees = useMemo(
    () =>
      form.assignedPeople
        .map((p) => employees?.find((e) => e.id === p.id))
        .filter((e): e is NonNullable<typeof e> => !!e),
    [form.assignedPeople, employees]
  );
  const totalEstimatedCost = assignedEmployees.reduce(
    (sum, e) => sum + hours * (e.hourlyRate ?? 0),
    0
  );

  const removePerson = (id: string) => {
    setForm((f) => ({ ...f, assignedPeople: f.assignedPeople.filter((p) => p.id !== id) }));
  };

  const addPerson = (emp: NonNullable<typeof employees>[number]) => {
    const person = { id: emp.id, name: emp.name, initials: emp.initials, color: emp.avatarColor };
    setForm((f) => {
      if (isEditing) return { ...f, assignedPeople: [person], openShift: false };
      if (f.assignedPeople.some((p) => p.id === emp.id)) return f;
      return { ...f, assignedPeople: [...f.assignedPeople, person] };
    });
    setPickerOpen(false);
  };

  const availableEmployees = useMemo(
    () =>
      (employees ?? []).filter(
        (e) =>
          !form.assignedPeople.some((p) => p.id === e.id) &&
          (!effectiveLocationId || e.locationIds.includes(effectiveLocationId))
      ),
    [employees, form.assignedPeople, effectiveLocationId]
  );

  async function handleSubmit(publish: boolean) {
    if (!effectiveLocationId) {
      toast.error('Select a location first');
      return;
    }
    setSubmitting(true);
    try {
      const base: Omit<CreateShiftInput, 'employeeId'> = {
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
        breakMinutes: form.breakMinutes,
        roleId: effectiveRoleId,
        departmentId: form.departmentId,
        locationId: effectiveLocationId,
        notes: form.notes || undefined,
      };

      const targets: (string | null)[] =
        form.openShift || form.assignedPeople.length === 0
          ? [null]
          : form.assignedPeople.map((p) => p.id);

      const created = await Promise.all(
        targets.map((employeeId) => createShift({ ...base, employeeId }))
      );

      if (publish) {
        await Promise.all(
          created
            .filter((s) => s.employeeId)
            .map((s) => updateShift(s.id, { status: 'filled', publishedAt: new Date().toISOString() }))
        );
      }

      await queryClient.invalidateQueries({ queryKey: ['shifts'] });
      toast.success(publish ? 'Shift published successfully' : 'Shift saved as draft');
      close();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save shift');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSaveEdit() {
    if (!editingShiftId || !effectiveLocationId) return;
    setSubmitting(true);
    try {
      const employeeId = form.openShift ? null : (form.assignedPeople[0]?.id ?? null);
      await updateShift(editingShiftId, {
        employeeId,
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
        breakMinutes: form.breakMinutes,
        roleId: effectiveRoleId,
        departmentId: form.departmentId,
        locationId: effectiveLocationId,
        notes: form.notes || undefined,
        status: employeeId ? 'filled' : 'open',
      });
      await queryClient.invalidateQueries({ queryKey: ['shifts'] });
      await queryClient.invalidateQueries({ queryKey: ['shift', editingShiftId] });
      toast.success('Shift updated');
      close();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update shift');
    } finally {
      setSubmitting(false);
    }
  }

  const currentDepartment = DEPARTMENTS.find((d) => d.id === form.departmentId);

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
                {isEditing ? 'Edit shift' : 'Create shift'}
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

                  {/* Add person chip + picker */}
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={() => setPickerOpen((v) => !v)}
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
                    {pickerOpen && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 34,
                          left: 0,
                          zIndex: 50,
                          minWidth: 200,
                          maxHeight: 220,
                          overflowY: 'auto',
                          background: 'var(--surface)',
                          border: '1px solid var(--border)',
                          borderRadius: 8,
                          boxShadow: 'var(--shadow-lg)',
                          padding: 4,
                        }}
                      >
                        {availableEmployees.length === 0 ? (
                          <div style={{ padding: '8px 10px', fontSize: 12, color: 'var(--text-dim)' }}>
                            No more employees to add
                          </div>
                        ) : (
                          availableEmployees.map((emp) => (
                            <button
                              key={emp.id}
                              onClick={() => addPerson(emp)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                width: '100%',
                                padding: '6px 8px',
                                borderRadius: 6,
                                border: 'none',
                                background: 'transparent',
                                cursor: 'pointer',
                                fontSize: 12,
                                color: 'var(--text)',
                                textAlign: 'left',
                              }}
                            >
                              <Avatar initials={emp.initials} color={emp.avatarColor} size={20} />
                              {emp.name}
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>

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
                        background: currentDepartment?.color ?? 'var(--text-dim)',
                      }}
                    />
                    <select
                      value={effectiveRoleId}
                      onChange={(e) => setForm((f) => ({ ...f, roleId: e.target.value }))}
                      style={{ ...inputStyle, paddingLeft: 24 }}
                    >
                      {locationJobTitles.length === 0 ? (
                        <option value="">No job titles at this location</option>
                      ) : (
                        locationJobTitles.map((title) => (
                          <option key={title} value={title}>
                            {title}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Department</label>
                  <select
                    value={form.departmentId}
                    onChange={(e) => setForm((f) => ({ ...f, departmentId: e.target.value }))}
                    style={inputStyle}
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
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
                    disabled={isEditing}
                    onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                    style={{ ...inputStyle, opacity: isEditing ? 0.6 : 1 }}
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
                    value={effectiveLocationId}
                    disabled={isEditing}
                    onChange={(e) => setForm((f) => ({ ...f, locationId: e.target.value }))}
                    style={{ ...inputStyle, opacity: isEditing ? 0.6 : 1 }}
                  >
                    {(isEditing ? (locations ?? []) : availableLocations).map((l) => (
                      <option key={l.id} value={l.locationId ?? l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                  {isEditing && (
                    <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4 }}>
                      Date &amp; location can&apos;t be changed after creation — delete and recreate instead.
                    </div>
                  )}
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
                  {assignedEmployees.length > 1 ? ` × ${assignedEmployees.length} people` : ''}
                </span>
                {assignedEmployees.length === 0 ? (
                  <> · assign a person to estimate pay</>
                ) : assignedEmployees.length === 1 ? (
                  <>
                    {' · estimated '}
                    <span style={{ color: 'var(--text)', fontWeight: 600 }}>
                      ${totalEstimatedCost.toFixed(2)}
                    </span>{' '}
                    at ${(assignedEmployees[0].hourlyRate ?? 0).toFixed(2)}/h
                  </>
                ) : (
                  <>
                    {' · estimated total '}
                    <span style={{ color: 'var(--text)', fontWeight: 600 }}>
                      ${totalEstimatedCost.toFixed(2)}
                    </span>{' '}
                    across {assignedEmployees.length} people
                  </>
                )}
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
              {isEditing ? (
                <button
                  disabled={submitting}
                  onClick={handleSaveEdit}
                  style={{
                    flex: 1,
                    height: 36,
                    borderRadius: 8,
                    border: 'none',
                    background: 'var(--accent)',
                    color: '#FFFFFF',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: submitting ? 'default' : 'pointer',
                    opacity: submitting ? 0.6 : 1,
                  }}
                >
                  {submitting ? 'Saving…' : 'Save changes'}
                </button>
              ) : (
                <>
                  <button
                    disabled={submitting}
                    onClick={() => handleSubmit(false)}
                    style={{
                      flex: 1,
                      height: 36,
                      borderRadius: 8,
                      border: '1px solid var(--border)',
                      background: 'var(--surface-2)',
                      color: 'var(--text)',
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: submitting ? 'default' : 'pointer',
                      opacity: submitting ? 0.6 : 1,
                    }}
                  >
                    Save as draft
                  </button>
                  <button
                    disabled={submitting}
                    onClick={() => handleSubmit(true)}
                    style={{
                      flex: 1,
                      height: 36,
                      borderRadius: 8,
                      border: 'none',
                      background: 'var(--accent)',
                      color: '#FFFFFF',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: submitting ? 'default' : 'pointer',
                      opacity: submitting ? 0.6 : 1,
                    }}
                  >
                    {submitting ? 'Saving…' : 'Publish shift'}
                  </button>
                </>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
