'use client';

import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, ChevronDown, MoreHorizontal, UserCog, UserX } from 'lucide-react';
import { toast } from 'sonner';
import {
  getEmployees,
  getDepartmentById,
  updateEmployee,
  DEPARTMENTS,
  ROLES,
} from '@/services/employees.service';
import { Avatar } from '@/components/common/Avatar';
import { StatusPill } from '@/components/common/StatusPill';
import { EmployeeProfileDrawer } from '@/components/people/EmployeeProfileDrawer';
import type { Employee, EmployeeStatus } from '@/types';

// ─── Filter option lists ──────────────────────────────────────────────────────

const STATUS_OPTIONS: { value: EmployeeStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'inactive', label: 'Inactive' },
];

// ─── Select wrapper (native select styled to match design) ───────────────────

function FilterSelect({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
}) {
  return (
    <div style={{ position: 'relative' }}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          height: 34,
          padding: '0 28px 0 12px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border)',
          background: 'var(--surface)',
          color: 'var(--text)',
          fontSize: 13,
          fontWeight: 500,
          outline: 'none',
          appearance: 'none',
          cursor: 'pointer',
        }}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        style={{
          position: 'absolute',
          right: 9,
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--text-dim)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}

// ─── Table row ────────────────────────────────────────────────────────────────

function PersonRow({
  employee,
  onClick,
}: {
  employee: Employee;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const department = getDepartmentById(employee.departmentId);
  const queryClient = useQueryClient();

  async function handleDeactivate() {
    if (!window.confirm(`Deactivate ${employee.name}? They will be marked inactive.`)) return;
    try {
      await updateEmployee(employee.id, { status: 'inactive', employmentStatus: 'Terminated' });
      await queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success(`${employee.name} deactivated`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to deactivate employee');
    }
  }

  return (
    <tr
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        cursor: 'pointer',
        background: hovered ? 'var(--surface-2)' : 'transparent',
        transition: 'background 0.1s ease',
      }}
    >
      {/* Name + avatar + email */}
      <td style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar initials={employee.initials} color={employee.avatarColor} size={32} />
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: 'var(--text)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {employee.name}
            </div>
            <div
              style={{
                fontSize: 12,
                color: 'var(--text-dim)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {employee.email}
            </div>
          </div>
        </div>
      </td>

      {/* Role */}
      <td style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)' }}>
        <span style={{ fontSize: 13, color: 'var(--text)' }}>
          {employee.jobTitle || employee.roleId}
        </span>
      </td>

      {/* Department */}
      <td style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: department?.color ?? 'var(--text-dim)',
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: 13, color: 'var(--text)' }}>
            {department?.name ?? employee.departmentId}
          </span>
        </div>
      </td>

      {/* Hours */}
      <td style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)' }}>
        <span
          style={{
            fontSize: 13,
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)',
          }}
        >
          {employee.scheduledHours} / {employee.contractHours}
        </span>
      </td>

      {/* Status */}
      <td style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)' }}>
        <StatusPill status={employee.status} size="sm" />
      </td>

      {/* Actions */}
      <td style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', width: 1, position: 'relative' }}>
        <button
          onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
          aria-label="More actions"
          style={{
            width: 28,
            height: 28,
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: menuOpen ? 'var(--surface-2)' : 'transparent',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <MoreHorizontal size={16} />
        </button>
        {menuOpen && (
          <>
            <div
              onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }}
              style={{ position: 'fixed', inset: 0, zIndex: 60 }}
            />
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'absolute',
                top: '100%',
                right: 16,
                marginTop: 2,
                zIndex: 61,
                minWidth: 170,
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                boxShadow: 'var(--shadow-lg)',
                padding: 4,
              }}
            >
              <button
                onClick={() => { setMenuOpen(false); onClick(); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  width: '100%',
                  padding: '7px 10px',
                  borderRadius: 6,
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: 12,
                  color: 'var(--text)',
                  textAlign: 'left',
                }}
              >
                <UserCog size={13} />
                Edit profile
              </button>
              <button
                onClick={() => { setMenuOpen(false); handleDeactivate(); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  width: '100%',
                  padding: '7px 10px',
                  borderRadius: 6,
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: 12,
                  color: 'var(--conflict-text)',
                  textAlign: 'left',
                }}
              >
                <UserX size={13} />
                Deactivate
              </button>
            </div>
          </>
        )}
      </td>
    </tr>
  );
}

// ─── PeopleTable ──────────────────────────────────────────────────────────────

export function PeopleTable() {
  const [search, setSearch] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [roleId, setRoleId] = useState('');
  const [status, setStatus] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  const { data: employees, isLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: () => getEmployees(),
  });

  const filtered = useMemo(() => {
    if (!employees) return [];
    const term = search.trim().toLowerCase();
    return employees.filter((e) => {
      if (term && !e.name.toLowerCase().includes(term) && !e.email.toLowerCase().includes(term)) {
        return false;
      }
      if (departmentId && e.departmentId !== departmentId) return false;
      if (roleId && e.roleId !== roleId) return false;
      if (status && e.status !== status) return false;
      return true;
    });
  }, [employees, search, departmentId, roleId, status]);

  const total = employees?.length ?? 0;

  return (
    <>
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          overflow: 'hidden',
        }}
      >
        {/* ── Filter bar ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 16px',
            borderBottom: '1px solid var(--border)',
          }}
        >
          {/* Search */}
          <div style={{ position: 'relative', maxWidth: 320, flex: '1 1 320px' }}>
            <Search
              size={14}
              style={{
                position: 'absolute',
                left: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-dim)',
              }}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search people…"
              style={{
                width: '100%',
                height: 34,
                padding: '0 12px 0 32px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                color: 'var(--text)',
                fontSize: 13,
                outline: 'none',
              }}
            />
          </div>

          <FilterSelect
            value={departmentId}
            onChange={setDepartmentId}
            placeholder="All departments"
            options={DEPARTMENTS.map((d) => ({ value: d.id, label: d.name }))}
          />

          <FilterSelect
            value={roleId}
            onChange={setRoleId}
            placeholder="All roles"
            options={ROLES.map((r) => ({ value: r.id, label: r.name }))}
          />

          <FilterSelect
            value={status}
            onChange={setStatus}
            placeholder="All statuses"
            options={STATUS_OPTIONS}
          />

          <span style={{ flex: 1 }} />

          <span
            style={{
              fontSize: 12,
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-dim)',
              whiteSpace: 'nowrap',
            }}
          >
            {filtered.length} of {total}
          </span>
        </div>

        {/* ── Table ── */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--surface-2)' }}>
                {['Name', 'Role', 'Department', 'Hours', 'Status', ''].map((col) => (
                  <th
                    key={col}
                    style={{
                      textAlign: 'left',
                      padding: '9px 16px',
                      borderBottom: '1px solid var(--border)',
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: 'var(--text-muted)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      padding: '32px 16px',
                      textAlign: 'center',
                      color: 'var(--text-dim)',
                      fontSize: 13,
                    }}
                  >
                    Loading people…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      padding: '32px 16px',
                      textAlign: 'center',
                      color: 'var(--text-dim)',
                      fontSize: 13,
                    }}
                  >
                    No people match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((employee) => (
                  <PersonRow
                    key={employee.id}
                    employee={employee}
                    onClick={() => setSelectedEmployeeId(employee.id)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <EmployeeProfileDrawer
        employeeId={selectedEmployeeId}
        onClose={() => setSelectedEmployeeId(null)}
      />
    </>
  );
}
