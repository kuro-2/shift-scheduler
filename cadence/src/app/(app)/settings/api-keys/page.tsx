'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

interface ApiKey {
  id: string;
  name: string;
  preview: string;
  createdAt: string;
  lastUsed: string;
}

const INITIAL_KEYS: ApiKey[] = [
  {
    id: 'key_001',
    name: 'Production server',
    preview: 'sk_live_••••4f2a',
    createdAt: 'Jan 14, 2026',
    lastUsed: '2 hours ago',
  },
  {
    id: 'key_002',
    name: 'Reporting pipeline',
    preview: 'sk_live_••••91bd',
    createdAt: 'Nov 3, 2025',
    lastUsed: 'Yesterday',
  },
  {
    id: 'key_003',
    name: 'Staging environment',
    preview: 'sk_test_••••c732',
    createdAt: 'Aug 22, 2025',
    lastUsed: '14 days ago',
  },
];

function randomHex(len: number) {
  return Array.from({ length: len }, () => Math.floor(Math.random() * 16).toString(16)).join('');
}

export default function ApiKeysSettingsPage() {
  const [keys, setKeys] = useState<ApiKey[]>(INITIAL_KEYS);

  function handleGenerate() {
    const suffix = randomHex(4);
    const newKey: ApiKey = {
      id: `key_${Date.now()}`,
      name: `New key ${keys.length + 1}`,
      preview: `sk_live_••••${suffix}`,
      createdAt: 'Just now',
      lastUsed: 'Never',
    };
    setKeys((prev) => [newKey, ...prev]);
    toast.success(`New API key generated: sk_live_••••${suffix}`);
  }

  function handleRevoke(key: ApiKey) {
    setKeys((prev) => prev.filter((k) => k.id !== key.id));
    toast.error(`API key "${key.name}" revoked`);
  }

  return (
    <div style={{ maxWidth: 920 }}>
      {/* ── Header ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 24,
          gap: 16,
        }}
      >
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)', margin: 0 }}>
            API keys
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            Manage keys used to access the Nexora API programmatically.
          </p>
        </div>
        <button
          onClick={handleGenerate}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 13,
            fontWeight: 500,
            color: '#FFFFFF',
            background: 'var(--accent)',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            padding: '7px 13px',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          <Plus size={14} />
          Generate new key
        </button>
      </div>

      {/* ── Table ── */}
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          overflow: 'hidden',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ textAlign: 'left', padding: '12px 20px', color: 'var(--text-muted)', fontWeight: 500, fontSize: 12 }}>Name</th>
              <th style={{ textAlign: 'left', padding: '12px 20px', color: 'var(--text-muted)', fontWeight: 500, fontSize: 12 }}>Key</th>
              <th style={{ textAlign: 'left', padding: '12px 20px', color: 'var(--text-muted)', fontWeight: 500, fontSize: 12 }}>Created</th>
              <th style={{ textAlign: 'left', padding: '12px 20px', color: 'var(--text-muted)', fontWeight: 500, fontSize: 12 }}>Last used</th>
              <th style={{ textAlign: 'right', padding: '12px 20px', color: 'var(--text-muted)', fontWeight: 500, fontSize: 12 }} />
            </tr>
          </thead>
          <tbody>
            {keys.map((key, idx) => (
              <tr key={key.id} style={{ borderTop: idx > 0 ? '1px solid var(--border)' : 'none' }}>
                <td style={{ padding: '14px 20px', color: 'var(--text)', fontWeight: 500 }}>{key.name}</td>
                <td
                  style={{
                    padding: '14px 20px',
                    color: 'var(--text-muted)',
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: 12,
                  }}
                >
                  {key.preview}
                </td>
                <td style={{ padding: '14px 20px', color: 'var(--text-muted)' }}>{key.createdAt}</td>
                <td style={{ padding: '14px 20px', color: 'var(--text-muted)' }}>{key.lastUsed}</td>
                <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                  <button
                    onClick={() => handleRevoke(key)}
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: 'var(--conflict-text)',
                      background: 'transparent',
                      border: '1px solid var(--conflict-border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '6px 11px',
                      cursor: 'pointer',
                    }}
                  >
                    Revoke
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
