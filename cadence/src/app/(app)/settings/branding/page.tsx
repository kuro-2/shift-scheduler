'use client';

import { useRef, useState } from 'react';
import { Building2, Check } from 'lucide-react';
import { toast } from 'sonner';

const cardStyle: React.CSSProperties = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  padding: 20,
  marginBottom: 16,
};

interface AccentOption {
  id: string;
  label: string;
  color: string;
}

const ACCENT_OPTIONS: AccentOption[] = [
  { id: 'indigo', label: 'Indigo', color: '#4F46E5' },
  { id: 'violet', label: 'Violet', color: '#7C6AC4' },
  { id: 'forest', label: 'Forest', color: '#5A9B6E' },
  { id: 'clay', label: 'Clay', color: '#C76054' },
  { id: 'navy', label: 'Navy', color: '#3D4D8A' },
  { id: 'amber', label: 'Amber', color: '#D4A04A' },
];

export default function BrandingSettingsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selected, setSelected] = useState('indigo');
  const activeColor = ACCENT_OPTIONS.find((o) => o.id === selected)?.color ?? '#4F46E5';

  return (
    <div style={{ maxWidth: 760 }}>
      {/* ── Header ── */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)', margin: 0 }}>
          Branding
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
          Customize how Nexora looks for your workspace.
        </p>
      </div>

      {/* ── Logo upload ── */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 'var(--radius)',
              background: 'var(--surface-2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Building2 size={26} style={{ color: 'var(--text-dim)' }} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
              Workspace logo
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
              Appears in the sidebar, login screen, and emails.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/svg+xml"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) toast.success(`Logo "${file.name}" uploaded`);
                e.target.value = '';
              }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: 'var(--text)',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '7px 13px',
                cursor: 'pointer',
              }}
            >
              Upload logo
            </button>
          </div>
        </div>
      </div>

      {/* ── Brand color ── */}
      <div style={cardStyle}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
          Brand color
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
          Choose an accent color used for buttons, highlights, and links.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {ACCENT_OPTIONS.map((option) => {
            const isSelected = option.id === selected;
            return (
              <button
                key={option.id}
                onClick={() => setSelected(option.id)}
                title={option.label}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: option.color,
                  border: isSelected ? '2px solid var(--text)' : '2px solid transparent',
                  outline: isSelected ? '2px solid var(--surface)' : 'none',
                  outlineOffset: isSelected ? '-4px' : '0',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isSelected && <Check size={16} color="#FFFFFF" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Preview ── */}
      <div style={cardStyle}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>
          Preview
        </div>
        <div
          style={{
            width: 220,
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: 52,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '0 14px',
              borderBottom: '1px solid var(--border)',
              background: 'var(--surface)',
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: 7,
                background: `linear-gradient(135deg, ${activeColor}, ${activeColor}CC)`,
                flexShrink: 0,
              }}
            />
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Nexora</div>
          </div>
          <div style={{ padding: 12, background: 'var(--surface)', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: activeColor,
                background: `${activeColor}1A`,
                borderRadius: 7,
                padding: '6px 10px',
              }}
            >
              Dashboard
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', padding: '6px 10px' }}>
              Schedule
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', padding: '6px 10px' }}>
              People
            </div>
          </div>
        </div>
      </div>

      {/* ── Save ── */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={() => toast.success('Branding settings saved')}
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: '#FFFFFF',
            background: 'var(--accent)',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            padding: '8px 16px',
            cursor: 'pointer',
          }}
        >
          Save changes
        </button>
      </div>
    </div>
  );
}
