'use client';

import { useState, type FormEvent } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    setError('');
    setLoading(true);
    await mockDelay(600, 900);
    setLoading(false);
    setSent(true);
  }

  return (
    <AuthShell>
      <div style={{ marginBottom: 36 }}>
        <AuthLogo />
      </div>

      {sent ? (
        <div>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: 'var(--filled-bg)',
              color: 'var(--filled-text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
            }}
          >
            <CheckCircle2 size={22} />
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
            Check your email
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 28, lineHeight: 1.6 }}>
            We sent a reset link to <strong style={{ color: 'var(--text)' }}>{email}</strong>. Follow
            the link to choose a new password.
          </p>
          <a
            href="/login"
            style={{ fontSize: 13, fontWeight: 500, color: 'var(--accent)' }}
          >
            ← Back to sign in
          </a>
        </div>
      ) : (
        <>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: 'var(--text)',
              marginBottom: 8,
            }}
          >
            Reset your password
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 28 }}>
            Enter the email associated with your account.
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <FieldLabel>Email</FieldLabel>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                style={{
                  width: '100%',
                  height: 40,
                  padding: '0 12px',
                  fontSize: 14,
                  outline: 'none',
                }}
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
                  Send reset link
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
        </>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </AuthShell>
  );
}
