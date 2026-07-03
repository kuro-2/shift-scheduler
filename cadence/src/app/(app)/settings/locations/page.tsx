'use client';

import { useState } from 'react';
import { MapPin, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { getLocations } from '@/services/employees.service';
import type { Location } from '@/types';

export default function LocationsSettingsPage() {
  const { data: locations = [] } = useQuery({ queryKey: ['locations'], queryFn: getLocations });
  const [localLocs, setLocalLocs] = useState<Location[] | null>(null);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAddress, setNewAddress] = useState('');

  const displayed = localLocs ?? locations;

  function handleAdd() {
    if (!newName.trim()) { toast.error('Location name is required'); return; }
    const newLoc: Location = {
      id: `loc_${Date.now()}`,
      name: newName.trim(),
      address: newAddress.trim() || 'Address TBD',
      geofenceRadius: undefined,
    };
    setLocalLocs((prev) => [...(prev ?? locations), newLoc]);
    toast.success(`Location "${newLoc.name}" added`);
    setNewName('');
    setNewAddress('');
    setAdding(false);
  }

  return (
    <div style={{ maxWidth: 920 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)', margin: 0 }}>Locations</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
          Manage the physical and remote locations your team works from.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
        {displayed.map((loc) => (
          <div
            key={loc.id}
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20 }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <MapPin size={17} style={{ color: 'var(--accent)' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{loc.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.4 }}>{loc.address}</div>
                {loc.geofenceRadius != null && (
                  <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-dim)', marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 5, background: 'var(--surface-2)', borderRadius: 99, padding: '3px 9px' }}>
                    Geofence: {loc.geofenceRadius}m radius
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {adding ? (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>New location</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Location name"
                autoFocus
                style={{ height: 34, padding: '0 10px', fontSize: 13, border: '1px solid var(--border)', borderRadius: 7, background: 'var(--surface-2)', color: 'var(--text)' }}
              />
              <input
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                placeholder="Address (optional)"
                onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setAdding(false); }}
                style={{ height: 34, padding: '0 10px', fontSize: 13, border: '1px solid var(--border)', borderRadius: 7, background: 'var(--surface-2)', color: 'var(--text)' }}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={handleAdd} style={{ flex: 1, padding: '7px 0', fontSize: 13, fontWeight: 500, color: '#fff', background: 'var(--accent)', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Add</button>
                <button onClick={() => setAdding(false)} style={{ padding: '7px 12px', fontSize: 13, color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                  <X size={14} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, minHeight: 88, border: '1px dashed var(--border-strong)', borderRadius: 'var(--radius)', background: 'transparent', color: 'var(--text-muted)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
          >
            <Plus size={14} />
            Add location
          </button>
        )}
      </div>
    </div>
  );
}
