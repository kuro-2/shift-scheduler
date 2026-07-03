'use client';

import { useState } from 'react';
import { Pencil, Trash2, Plus, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { getRoles, getDepartments } from '@/services/employees.service';
import { toTitleCase } from '@/lib/utils';
import type { Role } from '@/types';

interface EditState {
  id: string;
  name: string;
  defaultBreak: number;
}

export default function RolesSettingsPage() {
  const { data: roles = [] } = useQuery({ queryKey: ['roles'], queryFn: () => getRoles() });
  const { data: departments = [] } = useQuery({ queryKey: ['departments'], queryFn: () => getDepartments() });

  const [localRoles, setLocalRoles] = useState<Role[] | null>(null);
  const [editing, setEditing] = useState<EditState | null>(null);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');

  const displayed = localRoles ?? roles;
  const deptById = new Map(departments.map((d) => [d.id, d]));

  function handleDelete(role: Role) {
    setLocalRoles((prev) => (prev ?? roles).filter((r) => r.id !== role.id));
    toast.error(`Role "${role.name}" deleted`);
  }

  function handleSaveEdit() {
    if (!editing) return;
    setLocalRoles((prev) =>
      (prev ?? roles).map((r) =>
        r.id === editing.id ? { ...r, name: editing.name, defaultBreak: editing.defaultBreak } : r
      )
    );
    toast.success(`Role "${editing.name}" updated`);
    setEditing(null);
  }

  function handleAdd() {
    if (!newName.trim()) { toast.error('Role name is required'); return; }
    const newRole: Role = {
      id: `role_${Date.now()}`,
      name: newName.trim(),
      departmentId: departments[0]?.id ?? '',
      defaultBreak: 30,
      requiredSkills: [],
    };
    setLocalRoles((prev) => [...(prev ?? roles), newRole]);
    toast.success(`Role "${newRole.name}" added`);
    setNewName('');
    setAdding(false);
  }

  return (
    <div style={{ maxWidth: 920 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)', margin: 0 }}>Roles & skills</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            Define roles, default breaks, and the skills required for each.
          </p>
        </div>
        <button
          onClick={() => setAdding(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500, color: '#FFFFFF', background: 'var(--accent)', border: 'none', borderRadius: 'var(--radius-sm)', padding: '7px 13px', cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          <Plus size={14} />
          Add role
        </button>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Role name', 'Department', 'Default break', 'Required skills', ''].map((h) => (
                <th key={h} style={{ textAlign: 'left', padding: '12px 20px', color: 'var(--text-muted)', fontWeight: 500, fontSize: 12 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {adding && (
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
                <td colSpan={5} style={{ padding: '12px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setAdding(false); }}
                      placeholder="Role name"
                      autoFocus
                      style={{ flex: 1, height: 32, padding: '0 10px', fontSize: 13, border: '1px solid var(--border)', borderRadius: 7, background: 'var(--surface)', color: 'var(--text)' }}
                    />
                    <button onClick={handleAdd} style={{ padding: '6px 14px', fontSize: 13, fontWeight: 500, color: '#fff', background: 'var(--accent)', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Add</button>
                    <button onClick={() => setAdding(false)} style={{ padding: '6px 10px', fontSize: 13, color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}>Cancel</button>
                  </div>
                </td>
              </tr>
            )}
            {displayed.map((role, idx) => {
              const dept = deptById.get(role.departmentId);
              const isEditing = editing?.id === role.id;
              return (
                <tr key={role.id} style={{ borderTop: idx > 0 || adding ? '1px solid var(--border)' : 'none' }}>
                  <td style={{ padding: '14px 20px', color: 'var(--text)', fontWeight: 500 }}>
                    {isEditing ? (
                      <input
                        value={editing.name}
                        onChange={(e) => setEditing((s) => s ? { ...s, name: e.target.value } : s)}
                        autoFocus
                        style={{ width: '100%', height: 30, padding: '0 8px', fontSize: 13, border: '1px solid var(--border)', borderRadius: 6, background: 'var(--surface-2)', color: 'var(--text)' }}
                      />
                    ) : role.name}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    {dept && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: dept.color, flexShrink: 0 }} />
                        <span style={{ color: 'var(--text-muted)' }}>{dept.name}</span>
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '14px 20px', color: 'var(--text-muted)' }}>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editing.defaultBreak}
                        onChange={(e) => setEditing((s) => s ? { ...s, defaultBreak: Number(e.target.value) } : s)}
                        style={{ width: 70, height: 30, padding: '0 8px', fontSize: 13, border: '1px solid var(--border)', borderRadius: 6, background: 'var(--surface-2)', color: 'var(--text)' }}
                      />
                    ) : `${role.defaultBreak} min`}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {role.requiredSkills.map((skill) => (
                        <span key={skill} style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', background: 'var(--surface-2)', borderRadius: 99, padding: '3px 9px', whiteSpace: 'nowrap' }}>
                          {toTitleCase(skill)}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                      {isEditing ? (
                        <>
                          <button onClick={handleSaveEdit} style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'var(--accent-soft)', borderRadius: 7, color: 'var(--accent-text)', cursor: 'pointer' }}><Check size={14} /></button>
                          <button onClick={() => setEditing(null)} style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'transparent', borderRadius: 7, color: 'var(--text-muted)', cursor: 'pointer' }}><X size={14} /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => setEditing({ id: role.id, name: role.name, defaultBreak: role.defaultBreak })} aria-label={`Edit ${role.name}`} style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'transparent', borderRadius: 7, color: 'var(--text-muted)', cursor: 'pointer' }}><Pencil size={14} /></button>
                          <button onClick={() => handleDelete(role)} aria-label={`Delete ${role.name}`} style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'transparent', borderRadius: 7, color: 'var(--text-muted)', cursor: 'pointer' }}><Trash2 size={14} /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
