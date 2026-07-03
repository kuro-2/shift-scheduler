'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Eye, EyeOff, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { AuthLogo, AuthShell } from '@/components/auth/AuthShell';
import { signIn } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';

// ─── Store locations seeded in APP_USER_ACCOUNTS ──────────────────────────────

const LOCATIONS = [
  'SS-212',
  'SS-223',
  'SS-225B',
  'SS-227B',
  'SS-232B',
  'SS-235B',
  'SS-300B',
  'SS-401B',
  'SS-600B',
  'SS-601',
];

// ─── SSO Logo Marks ────────────────────────────────────────────────────────────

function GoogleLogo() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48">
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}

function MicrosoftLogo() {
  return (
    <svg width="16" height="16" viewBox="0 0 23 23">
      <rect x="1" y="1" width="10" height="10" fill="#F25022" />
      <rect x="12" y="1" width="10" height="10" fill="#7FBA00" />
      <rect x="1" y="12" width="10" height="10" fill="#00A4EF" />
      <rect x="12" y="12" width="10" height="10" fill="#FFB900" />
    </svg>
  );
}

// ─── Field Label ────────────────────────────────────────────────────────────────

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

// ─── Login Page ─────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [username, setUsername] = useState('');
  const [locationId, setLocationId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter your username and password.');
      return;
    }
    if (!locationId) {
      setError('Please select your location.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const user = await signIn(username.trim(), password, locationId);
      setUser(user);
      toast.success(`Welcome back, ${user.username}!`);
      router.push('/schedule');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed. Please try again.';
      // Extract the server-provided error message from the fetch response
      const match = msg.match(/API error \d+ .*?: (.+)/);
      setError(match ? match[1] : 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
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
        Welcome back
      </h1>
      <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 28 }}>
        Sign in to your Northgate Co. workspace.
      </p>

      {/* SSO buttons */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <button
          type="button"
          onClick={() => toast.info('Google SSO coming soon — use username & password for now')}
          style={{
            flex: 1,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--surface)',
            color: 'var(--text)',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          <GoogleLogo />
          Continue with Google
        </button>
        <button
          type="button"
          onClick={() => toast.info('Microsoft SSO coming soon — use username & password for now')}
          style={{
            flex: 1,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--surface)',
            color: 'var(--text)',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          <MicrosoftLogo />
          Microsoft SSO
        </button>
      </div>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>or with username</span>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      </div>

      <form onSubmit={handleSubmit}>
        {/* Username */}
        <div style={{ marginBottom: 16 }}>
          <FieldLabel>Username</FieldLabel>
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="admin"
            autoComplete="username"
            style={{
              width: '100%',
              height: 40,
              padding: '0 12px',
              fontSize: 14,
              outline: 'none',
            }}
          />
        </div>

        {/* Location dropdown */}
        <div style={{ marginBottom: 16 }}>
          <FieldLabel>Location</FieldLabel>
          <div style={{ position: 'relative' }}>
            <select
              required
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              style={{
                width: '100%',
                height: 40,
                padding: '0 32px 0 12px',
                fontSize: 14,
                outline: 'none',
                appearance: 'none',
                cursor: 'pointer',
                background: 'var(--surface)',
              }}
            >
              <option value="" disabled>
                Select your store
              </option>
              {LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              style={{
                position: 'absolute',
                right: 10,
                top: 12,
                pointerEvents: 'none',
                color: 'var(--text-dim)',
              }}
            />
          </div>
        </div>

        {/* Password */}
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 6,
            }}
          >
            <FieldLabel>Password</FieldLabel>
            <a href="/forgot" style={{ fontSize: 13 }}>
              Forgot?
            </a>
          </div>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
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
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
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
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 24,
            fontSize: 13,
            color: 'var(--text-muted)',
            cursor: 'pointer',
          }}
        >
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            style={{ width: 14, height: 14, accentColor: 'var(--accent)' }}
          />
          Remember me
        </label>

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
            cursor: loading ? 'default' : 'pointer',
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
              Sign in
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
        First time here?{' '}
        <a href="/onboarding" style={{ fontWeight: 500 }}>
          Set up a workspace
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
