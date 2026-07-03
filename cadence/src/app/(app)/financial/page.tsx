import { Wallet } from 'lucide-react';
import { ComingSoon } from '@/components/common/ComingSoon';

export default function FinancialPage() {
  return <ComingSoon title="Financials" description="Financial tracking is coming soon." Icon={Wallet} />;
}

// ─── Original implementation (commented out — tab re-enabled with a
// "Coming soon" placeholder while this section is rebuilt; nothing deleted) ───
// import { Wallet } from 'lucide-react';
// 
// export default function FinancialPage() {
//   return (
//     <div
//       style={{
//         maxWidth: 1440,
//         margin: '0 auto',
//         padding: '28px 32px 60px',
//       }}
//     >
//       {/* ── Header ── */}
//       <div style={{ marginBottom: 24 }}>
//         <h1
//           style={{
//             fontSize: 22,
//             fontWeight: 600,
//             letterSpacing: '-0.02em',
//             color: 'var(--text)',
//             margin: 0,
//             lineHeight: 1.25,
//           }}
//         >
//           Financials
//         </h1>
//         <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
//           Budgets and spend tracking, coming soon.
//         </p>
//       </div>
// 
//       {/* ── Empty state ── */}
//       <div
//         style={{
//           display: 'flex',
//           flexDirection: 'column',
//           alignItems: 'center',
//           justifyContent: 'center',
//           gap: 12,
//           padding: '80px 20px',
//           background: 'var(--surface)',
//           border: '1px solid var(--border)',
//           borderRadius: 'var(--radius)',
//         }}
//       >
//         <div
//           style={{
//             width: 44,
//             height: 44,
//             borderRadius: 10,
//             background: 'var(--surface-2)',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//           }}
//         >
//           <Wallet size={20} style={{ color: 'var(--text-dim)' }} />
//         </div>
//         <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
//           Financials is coming soon
//         </div>
//         <p style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 360, textAlign: 'center' }}>
//           We&apos;re working on budgets and spend tracking for your workspace.
//         </p>
//       </div>
//     </div>
//   );
// }
