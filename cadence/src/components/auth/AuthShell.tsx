import type { ReactNode } from 'react';
import { Check } from 'lucide-react';

// ─── Starburst SVG (exact reuse from Sidebar.tsx) ─────────────────────────────

function StarburstIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="2" x2="12" y2="8" />
      <line x1="12" y1="16" x2="12" y2="22" />
      <line x1="2" y1="12" x2="8" y2="12" />
      <line x1="16" y1="12" x2="22" y2="12" />
      <line x1="5" y1="5" x2="9" y2="9" />
      <line x1="15" y1="15" x2="19" y2="19" />
      <line x1="5" y1="19" x2="9" y2="15" />
      <line x1="15" y1="9" x2="19" y2="5" />
    </svg>
  );
}

// ─── Logo Lockup ───────────────────────────────────────────────────────────────

export function AuthLogo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          background: 'linear-gradient(135deg, var(--accent), #6D63F5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <StarburstIcon />
      </div>
      <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>Nexora</span>
    </div>
  );
}

// ─── Bullet Row ────────────────────────────────────────────────────────────────

export interface AuthBullet {
  title: string;
  description: string;
}

function BulletRow({ bullet }: { bullet: AuthBullet }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
      <div
        style={{
          width: 28,
          height: 28,
          minWidth: 28,
          borderRadius: 8,
          background: 'var(--filled-bg)',
          color: 'var(--filled-text)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Check size={15} strokeWidth={2.5} />
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>
          {bullet.title}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
          {bullet.description}
        </div>
      </div>
    </div>
  );
}

// ─── Default Marketing Content ────────────────────────────────────────────────

const DEFAULT_BULLETS: AuthBullet[] = [
  {
    title: 'Live conflict detection',
    description: 'Catches double-bookings and overlapping shifts before they happen.',
  },
  {
    title: 'Self-serve swaps',
    description: 'Employees trade shifts with each other without back-and-forth texts.',
  },
  {
    title: 'One source of truth',
    description: 'Schedule, time off, and attendance — all in one place, always in sync.',
  },
];

interface RightPanelProps {
  eyebrow?: string;
  heading?: string;
  body?: string;
  bullets?: AuthBullet[];
}

function RightPanel({
  eyebrow = 'BUILT FOR TEAMS OF 5 TO 5,000',
  heading = "Schedules that respect everyone's time.",
  body = "Nexora cuts down scheduling conflicts before they happen and gives every employee full visibility into their shifts, swaps, and time off — no spreadsheets, no guesswork.",
  bullets = DEFAULT_BULLETS,
}: RightPanelProps) {
  return (
    <div
      className="hidden md:flex"
      style={{
        width: '50%',
        background: 'var(--surface-2)',
        borderLeft: '1px solid var(--border)',
        padding: 60,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ maxWidth: 440 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--accent-text)',
            marginBottom: 16,
          }}
        >
          {eyebrow}
        </div>
        <h2
          style={{
            fontSize: 32,
            fontWeight: 600,
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
            color: 'var(--text)',
            marginBottom: 16,
          }}
        >
          {heading}
        </h2>
        <p
          style={{
            fontSize: 14,
            color: 'var(--text-muted)',
            lineHeight: 1.6,
            maxWidth: 420,
            marginBottom: 36,
          }}
        >
          {body}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {bullets.map((bullet) => (
            <BulletRow key={bullet.title} bullet={bullet} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── AuthShell ─────────────────────────────────────────────────────────────────

interface AuthShellProps {
  children: ReactNode;
  rightPanel?: RightPanelProps;
}

export function AuthShell({ children, rightPanel }: AuthShellProps) {
  return (
    <div className="flex min-h-screen">
      {/* Left: form */}
      <div
        className="flex flex-1"
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          padding: 40,
        }}
      >
        <div style={{ width: '100%', maxWidth: 520 }}>{children}</div>
      </div>

      {/* Right: marketing panel */}
      <RightPanel {...rightPanel} />
    </div>
  );
}
