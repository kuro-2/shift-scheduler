'use client';

import { useState } from 'react';
import { Pencil, Trash2, Plus, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { getDepartments, getEmployees } from '@/services/employees.service';
import type { Department } from '@/types';

const COLOR_PALETTE = [
  '#5B7FD4', '#7C6AC4', '#5A9B6E', '#C76054', '#D4A04A',
  '#3D4D8A', '#4A9B8F', '#C45C8A', '#7A8A3D', '#8A5C3D',
];

interface EditState {
  id: string;
  name: string;
  color: string;
}

export default function DepartmentsSettingsPage() {
  const { data: departments = [], refetch } = useQuery({
    queryKey: ['departments'],
    queryFn: getDepartments,
  });
  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: () => getEmployees(),
  });

  const [editing, setEditing] = useState<EditState | null>(null);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(COLOR_PALETTE[0]);
  const [localDepts, setLocalDepts] = useState<Department[] | null>(null);

  const displayed = localDepts ?? departments;

  const countsByDept = employees.reduce<Record<string, number>>((acc, emp) => {
    acc[emp.departmentId] = (acc[emp.departmentId] ?? 0) + 1;
    return acc;
  }, {});

  function handleDelete(dept: Department) {
    setLocalDepts((prev) => (prev ?? departments).filter((d) => d.id !== dept.id));
    toast.error(`Department "${dept.name}" deleted`);
  }

  function handleSaveEdit() {
    if (!editing) return;
    setLocalDepts((prev) =>
      (prev ?? departments).map((d) =>
        d.id === editing.id ? { ...d, name: editing.name, color: editing.color } : d
      )
    );
    toast.success(`Department "${editing.name}" updated`);
    setEditing(null);
  }

  function handleAdd() {
    if (!newName.trim()) { toast.error('Department name is required'); return; }
    const newDept: Department = {
      id: `dept_${Date.now()}`,
      name: newName.trim(),
      color: newColor,
    };
    setLocalDepts((prev) => [...(prev ?? departments), newDept]);
    toast.success(`Department "${newDept.name}" added`);
    setNewName('');
    setNewColor(COLOR_PALETTE[0]);
    setAdding(false);
  }

  return (
    <div style={{ maxWidth: 760 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)', margin: 0 }}>
          Departments
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
          Organize your team into departments for scheduling and reporting.
        </p>
      </div>

      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          marginBottom: 16,
          overflow: 'hidden',
        }}
      >
        {displayed.map((dept, idx) => {
          const count = countsByDept[dept.id] ?? 0;
          const isEditing = editing?.id === dept.id;
          return (
            <div
              key={dept.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '14px 20px',
                borderTop: idx > 0 ? '1px solid var(--border)' : 'none',
              }}
            >
              {isEditing ? (
                <>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginRight: 4 }}>
                    {COLOR_PALETTE.map((c) => (
                      <button
                        key={c}
                        onClick={() => setEditing((e) => e ? { ...e, color: c } : e)}
                        style={{
                          width: 18, height: 18, borderRadius: '50%', background: c,
                          border: editing?.color === c ? '2px solid var(--text)' : '2px solid transparent',
                          cursor: 'pointer',
                        }}
                      />
                    ))}
                  </div>
                  <input
                    value={editing.name}
                    onChange={(e) => setEditing((s) => s ? { ...s, name: e.target.value } : s)}
                    autoFocus
                    style={{
                      flex: 1, height: 32, padding: '0 10px', fontSize: 13,
                      border: '1px solid var(--border)', borderRadius: 7,
                      background: 'var(--surface-2)', color: 'var(--text)',
                    }}
                  />
                  <button onClick={handleSaveEdit} style={{ padding: '4px 10px', fontSize: 12, fontWeight: 500, color: '#fff', background: 'var(--accent)', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
                    <Check size={14} />
                  </button>
                  <button onClick={() => setEditing(null)} style={{ padding: '4px 8px', fontSize: 12, color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                    <X size={14} />
                  </button>
                </>
              ) : (
                <>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: dept.color, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>{dept.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                      {count} {count === 1 ? 'employee' : 'employees'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      onClick={() => setEditing({ id: dept.id, name: dept.name, color: dept.color })}
                      aria-label={`Edit ${dept.name}`}
                      style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'transparent', borderRadius: 7, color: 'var(--text-muted)', cursor: 'pointer' }}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(dept)}
                      aria-label={`Delete ${dept.name}`}
                      style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'transparent', borderRadius: 7, color: 'var(--text-muted)', cursor: 'pointer' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {adding ? (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {COLOR_PALETTE.map((c) => (
              <button
                key={c}
                onClick={() => setNewColor(c)}
                style={{ width: 18, height: 18, borderRadius: '50%', background: c, border: newColor === c ? '2px solid var(--text)' : '2px solid transparent', cursor: 'pointer' }}
              />
            ))}
          </div>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setAdding(false); }}
            placeholder="Department name"
            autoFocus
            style={{ flex: 1, height: 32, padding: '0 10px', fontSize: 13, border: '1px solid var(--border)', borderRadius: 7, background: 'var(--surface-2)', color: 'var(--text)' }}
          />
          <button onClick={handleAdd} style={{ padding: '6px 14px', fontSize: 13, fontWeight: 500, color: '#fff', background: 'var(--accent)', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
            Add
          </button>
          <button onClick={() => setAdding(false)} style={{ padding: '6px 10px', fontSize: 13, color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}>
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '12px 0', border: '1px dashed var(--border-strong)', borderRadius: 'var(--radius)', background: 'transparent', color: 'var(--text-muted)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
        >
          <Plus size={14} />
          Add department
        </button>
      )}
    </div>
  );
}
