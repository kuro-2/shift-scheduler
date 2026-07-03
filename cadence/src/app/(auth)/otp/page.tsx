'use client';

import { useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { AuthLogo, AuthShell } from '@/components/auth/AuthShell';
import { mockDelay } from '@/lib/utils';

const CODE_LENGTH = 6;
const RESEND_SECONDS = 30;

export default function VerifyOtpPage() {
  const router = useRouter();
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(RESEND_SECONDS);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const code = digits.join('');
  const isComplete = code.length === CODE_LENGTH;

  // ── Resend countdown ──
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setInterval(() => {
      setResendCountdown((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCountdown]);

  function handleChange(index: number, value: string) {
    const char = value.replace(/[^0-9]/g, '').slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[index] = char;
      return next;
    });
    if (char && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, CODE_LENGTH);
    if (!pasted) return;
    const next = Array(CODE_LENGTH).fill('');
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setDigits(next);
    const focusIndex = Math.min(pasted.length, CODE_LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();
  }

  function handleResend() {
    if (resendCountdown > 0) return;
    setResendCountdown(RESEND_SECONDS);
  }

  async function handleSubmit() {
    if (!isComplete) return;
    setLoading(true);
    await mockDelay(600, 900);
    setLoading(false);
    router.push('/schedule');
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
        Verify your email
      </h1>
      <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 28 }}>
        Enter the 6-digit code we sent to your email.
      </p>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            style={{
              width: 48,
              height: 56,
              textAlign: 'center',
              fontSize: 20,
              fontFamily: 'var(--font-mono, monospace)',
              outline: 'none',
              borderColor: digit ? 'var(--accent)' : 'var(--border)',
            }}
          />
        ))}
      </div>

      <div style={{ marginBottom: 28 }}>
        {resendCountdown > 0 ? (
          <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>
            Resend in {resendCountdown}s
          </span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: 'var(--accent)',
              background: 'transparent',
              border: 'none',
              padding: 0,
            }}
          >
            Resend code
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!isComplete || loading}
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
          opacity: !isComplete || loading ? 0.5 : 1,
          cursor: !isComplete || loading ? 'not-allowed' : 'pointer',
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
            Verify
            <ArrowRight size={16} />
          </>
        )}
      </button>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </AuthShell>
  );
}
