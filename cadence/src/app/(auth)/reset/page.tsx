'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { AuthLogo, AuthShell } from '@/components/auth/AuthShell';
import { mockDelay } from '@/lib/utils';

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label
      style={{
        display: 'block',
        fontSize: 13,
        fontWeight: 500,
        color: 'var(--text)',
        marginBottom: 6,
      }}
    >
      {children}
    </label>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  visible,
  onToggleVisible,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  visible: boolean;
  onToggleVisible: () => void;
  placeholder?: string;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div style={{ position: 'relative' }}>
        <input
          type={visible ? 'text' : 'password'}
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? '••••••••'}
          style={{
            width: '100%',
            height: 40,
            padding: '0 40px 0 12px',
            fontSize: 14,
            outline: 'none',
          }}
        />
        <button
          type="button"
          onClick={onToggleVisible}
          aria-label={visible ? 'Hide password' : 'Show password'}
          style={{
            position: 'absolute',
            right: 10,
            top: 0,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-dim)',
          }}
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError('');
    setLoading(true);
    await mockDelay(600, 900);
    setLoading(false);
    toast.success('Password updated — sign in with your new password');
    router.push('/login');
  }

  return (
    <AuthShell>
      <div style={{ marginBottom: 36 }}>
        <AuthLogo />
      </div>

      <h1
        style={{
          fontSize: 28,
          fontWeight: 600,
          letterSpacing: '-0.02em',
          color: 'var(--text)',
          marginBottom: 8,
        }}
      >
        Set a new password
      </h1>
      <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 28 }}>
        Choose a strong password you haven&apos;t used before.
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <PasswordField
            label="New password"
            value={password}
            onChange={setPassword}
            visible={showPassword}
            onToggleVisible={() => setShowPassword((v) => !v)}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <PasswordField
            label="Confirm password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            visible={showConfirm}
            onToggleVisible={() => setShowConfirm((v) => !v)}
          />
        </div>

        {error && (
          <div style={{ fontSize: 13, color: 'var(--conflict-text)', marginBottom: 16 }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            height: 44,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            background: 'var(--accent)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            fontSize: 14,
            fontWeight: 600,
            opacity: loading ? 0.75 : 1,
          }}
        >
          {loading ? (
            <span
              style={{
                width: 16,
                height: 16,
                border: '2px solid rgba(255,255,255,0.4)',
                borderTopColor: '#FFFFFF',
                borderRadius: '50%',
                display: 'inline-block',
                animation: 'spin 0.7s linear infinite',
              }}
            />
          ) : (
            <>
              Reset password
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      <p
        style={{
          textAlign: 'center',
          fontSize: 13,
          color: 'var(--text-muted)',
          marginTop: 24,
        }}
      >
        <a href="/login" style={{ fontWeight: 500 }}>
          ← Back to sign in
        </a>
      </p>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </AuthShell>
  );
}
