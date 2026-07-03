'use client';

import { useState } from 'react';
import { Pencil, Trash2, Plus, Clock, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { DEPARTMENTS, ROLES } from '@/services/employees.service';

interface ShiftTemplate {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  roleId: string;
  departmentId: string;
}

const INITIAL_TEMPLATES: ShiftTemplate[] = [
  { id: 'tpl_opening_floor', name: 'Opening — Floor', startTime: '06:00', endTime: '14:00', roleId: 'role_ops_associate', departmentId: 'dept_ops' },
  { id: 'tpl_closing_floor', name: 'Closing — Floor', startTime: '14:00', endTime: '22:00', roleId: 'role_ops_associate', departmentId: 'dept_ops' },
  { id: 'tpl_sales_midday', name: 'Sales — Midday', startTime: '11:00', endTime: '19:00', roleId: 'role_sales_rep', departmentId: 'dept_sales' },
  { id: 'tpl_front_desk_evening', name: 'Front Desk — Evening', startTime: '15:00', endTime: '23:00', roleId: 'role_receptionist', departmentId: 'dept_front' },
];

function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${m.toString().padStart(2, '0')} ${period}`;
}

export default function ShiftTemplatesSettingsPage() {
  const router = useRouter();
  const deptById = new Map(DEPARTMENTS.map((d) => [d.id, d]));
  const roleById = new Map(ROLES.map((r) => [r.id, r]));

  const [templates, setTemplates] = useState<ShiftTemplate[]>(INITIAL_TEMPLATES);
  const [editing, setEditing] = useState<ShiftTemplate | null>(null);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');

  function handleDelete(tpl: ShiftTemplate) {
    setTemplates((prev) => prev.filter((t) => t.id !== tpl.id));
    toast.error(`Template "${tpl.name}" deleted`);
  }

  function handleUse(tpl: ShiftTemplate) {
    toast.success(`Template "${tpl.name}" applied — Create Shift drawer opened`);
    router.push('/schedule');
  }

  function handleSaveEdit() {
    if (!editing) return;
    setTemplates((prev) => prev.map((t) => t.id === editing.id ? editing : t));
    toast.success(`Template "${editing.name}" updated`);
    setEditing(null);
  }

  function handleAdd() {
    if (!newName.trim()) { toast.error('Template name is required'); return; }
    const newTpl: ShiftTemplate = {
      id: `tpl_${Date.now()}`,
      name: newName.trim(),
      startTime: '09:00',
      endTime: '17:00',
      roleId: ROLES[0]?.id ?? '',
      departmentId: DEPARTMENTS[0]?.id ?? '',
    };
    setTemplates((prev) => [...prev, newTpl]);
    toast.success(`Template "${newTpl.name}" created`);
    setNewName('');
    setAdding(false);
  }

  return (
    <div style={{ maxWidth: 920 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)', margin: 0 }}>Shift templates</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            Reusable shift patterns to speed up building the schedule.
          </p>
        </div>
        <button
          onClick={() => setAdding(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500, color: '#FFFFFF', background: 'var(--accent)', border: 'none', borderRadius: 'var(--radius-sm)', padding: '7px 13px', cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          <Plus size={14} />
          New template
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {adding && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--accent)', borderRadius: 'var(--radius)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setAdding(false); }}
              placeholder="Template name (e.g. Morning — Cashier)"
              autoFocus
              style={{ flex: 1, height: 34, padding: '0 10px', fontSize: 13, border: '1px solid var(--border)', borderRadius: 7, background: 'var(--surface-2)', color: 'var(--text)' }}
            />
            <button onClick={handleAdd} style={{ padding: '6px 14px', fontSize: 13, fontWeight: 500, color: '#fff', background: 'var(--accent)', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Add</button>
            <button onClick={() => setAdding(false)} style={{ padding: '6px 10px', fontSize: 13, color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}>Cancel</button>
          </div>
        )}

        {templates.map((tpl) => {
          const dept = deptById.get(tpl.departmentId);
          const role = roleById.get(tpl.roleId);
          const isEditing = editing?.id === tpl.id;

          return (
            <div
              key={tpl.id}
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}
            >
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: dept?.color ?? 'var(--text-dim)', flexShrink: 0 }} />

              {isEditing ? (
                <input
                  value={editing.name}
                  onChange={(e) => setEditing((s) => s ? { ...s, name: e.target.value } : s)}
                  autoFocus
                  style={{ flex: 1, height: 32, padding: '0 10px', fontSize: 14, fontWeight: 600, border: '1px solid var(--border)', borderRadius: 7, background: 'var(--surface-2)', color: 'var(--text)' }}
                />
              ) : (
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{tpl.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                    <Clock size={12} />
                    {formatTime(tpl.startTime)} – {formatTime(tpl.endTime)}
                    <span style={{ color: 'var(--text-dim)' }}>·</span>
                    {role?.name}
                    <span style={{ color: 'var(--text-dim)' }}>·</span>
                    {dept?.name}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                {isEditing ? (
                  <>
                    <button onClick={handleSaveEdit} style={{ padding: '7px 13px', fontSize: 13, fontWeight: 500, color: '#fff', background: 'var(--accent)', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}><Check size={13} /> Save</button>
                    <button onClick={() => setEditing(null)} style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'transparent', borderRadius: 7, color: 'var(--text-muted)', cursor: 'pointer' }}><X size={14} /></button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleUse(tpl)}
                      style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '7px 13px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                    >
                      Use template
                    </button>
                    <button onClick={() => setEditing(tpl)} aria-label={`Edit ${tpl.name}`} style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'transparent', borderRadius: 7, color: 'var(--text-muted)', cursor: 'pointer' }}>
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDelete(tpl)} aria-label={`Delete ${tpl.name}`} style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'transparent', borderRadius: 7, color: 'var(--text-muted)', cursor: 'pointer' }}>
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
