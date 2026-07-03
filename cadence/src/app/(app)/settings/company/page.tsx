import { Settings } from 'lucide-react';
import { ComingSoon } from '@/components/common/ComingSoon';

export default function CompanySettingsPage() {
  return <ComingSoon title="Settings" description="Workspace settings are coming soon." Icon={Settings} />;
}

// ─── Original implementation (commented out — tab re-enabled with a
// "Coming soon" placeholder while this section is rebuilt; nothing deleted) ───
// 'use client';
// 
// import { useRef, useState } from 'react';
// import { Building2 } from 'lucide-react';
// import { toast } from 'sonner';
// import { Toggle } from '@/components/settings/Toggle';
// 
// // ─── Card Style Helper ─────────────────────────────────────────────────────────
// 
// const cardStyle: React.CSSProperties = {
//   background: 'var(--surface)',
//   border: '1px solid var(--border)',
//   borderRadius: 'var(--radius)',
//   padding: 20,
//   marginBottom: 16,
// };
// 
// const labelStyle: React.CSSProperties = {
//   display: 'block',
//   fontSize: 12,
//   fontWeight: 500,
//   color: 'var(--text-muted)',
//   marginBottom: 6,
// };
// 
// const inputStyle: React.CSSProperties = {
//   width: '100%',
//   height: 36,
//   padding: '0 10px',
//   background: 'var(--surface-2)',
//   border: '1px solid var(--border)',
//   borderRadius: 7,
//   fontSize: 13,
//   color: 'var(--text)',
// };
// 
// interface PreferenceRow {
//   id: string;
//   label: string;
//   description: string;
// }
// 
// const PREFERENCE_ROWS: PreferenceRow[] = [
//   {
//     id: 'auto_conflicts',
//     label: 'Auto-detect scheduling conflicts',
//     description: 'Flag overlapping shifts and double-bookings as they happen.',
//   },
//   {
//     id: 'manager_approval',
//     label: 'Require manager approval for swaps',
//     description: 'Shift swaps between employees need manager sign-off before taking effect.',
//   },
//   {
//     id: 'self_assign',
//     label: 'Allow employees to self-assign open shifts',
//     description: 'Employees can claim open shifts directly from their schedule view.',
//   },
//   {
//     id: 'sms_reminders',
//     label: 'Send SMS reminders before shifts',
//     description: 'Text message reminders are sent to employees ahead of upcoming shifts.',
//   },
// ];
// 
// export default function CompanySettingsPage() {
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const [toggles, setToggles] = useState<Record<string, boolean>>({
//     auto_conflicts: true,
//     manager_approval: true,
//     self_assign: false,
//     sms_reminders: true,
//   });
// 
//   return (
//     <div style={{ maxWidth: 760 }}>
//       {/* ── Header ── */}
//       <div style={{ marginBottom: 24 }}>
//         <h1 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)', margin: 0 }}>
//           Company
//         </h1>
//         <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
//           Manage your workspace identity and scheduling defaults.
//         </p>
//       </div>
// 
//       {/* ── Logo card ── */}
//       <div style={cardStyle}>
//         <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
//           <div
//             style={{
//               width: 64,
//               height: 64,
//               borderRadius: 'var(--radius)',
//               background: 'var(--surface-2)',
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               flexShrink: 0,
//             }}
//           >
//             <Building2 size={26} style={{ color: 'var(--text-dim)' }} />
//           </div>
//           <div>
//             <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
//               Workspace logo
//             </div>
//             <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
//               PNG or SVG, at least 256×256px.
//             </p>
//             <input
//               ref={fileInputRef}
//               type="file"
//               accept="image/png,image/svg+xml"
//               style={{ display: 'none' }}
//               onChange={(e) => {
//                 const file = e.target.files?.[0];
//                 if (file) toast.success(`Logo "${file.name}" uploaded`);
//                 e.target.value = '';
//               }}
//             />
//             <button
//               onClick={() => fileInputRef.current?.click()}
//               style={{
//                 fontSize: 13,
//                 fontWeight: 500,
//                 color: 'var(--text)',
//                 background: 'var(--surface)',
//                 border: '1px solid var(--border)',
//                 borderRadius: 'var(--radius-sm)',
//                 padding: '7px 13px',
//                 cursor: 'pointer',
//               }}
//             >
//               Upload logo
//             </button>
//           </div>
//         </div>
//       </div>
// 
//       {/* ── Company details ── */}
//       <div style={cardStyle}>
//         <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>
//           Company details
//         </div>
//         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
//           <div>
//             <label style={labelStyle}>Company name</label>
//             <input type="text" defaultValue="Northgate Co." style={inputStyle} />
//           </div>
//           <div>
//             <label style={labelStyle}>Industry</label>
//             <select defaultValue="Retail" style={inputStyle}>
//               <option value="Retail">Retail</option>
//               <option value="Hospitality">Hospitality</option>
//               <option value="Healthcare">Healthcare</option>
//               <option value="Other">Other</option>
//             </select>
//           </div>
//           <div>
//             <label style={labelStyle}>Time zone</label>
//             <select defaultValue="America/Los_Angeles" style={inputStyle}>
//               <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
//               <option value="America/Denver">Mountain Time (US & Canada)</option>
//               <option value="America/Chicago">Central Time (US & Canada)</option>
//               <option value="America/New_York">Eastern Time (US & Canada)</option>
//               <option value="UTC">UTC</option>
//             </select>
//           </div>
//           <div>
//             <label style={labelStyle}>Week starts on</label>
//             <select defaultValue="Sunday" style={inputStyle}>
//               <option value="Sunday">Sunday</option>
//               <option value="Monday">Monday</option>
//             </select>
//           </div>
//         </div>
//       </div>
// 
//       {/* ── Scheduling preferences ── */}
//       <div style={cardStyle}>
//         <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
//           Scheduling preferences
//         </div>
//         <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
//           Control how shifts, swaps, and reminders behave across your workspace.
//         </p>
//         <div style={{ display: 'flex', flexDirection: 'column' }}>
//           {PREFERENCE_ROWS.map((row, idx) => (
//             <div
//               key={row.id}
//               style={{
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'space-between',
//                 gap: 16,
//                 padding: '12px 0',
//                 borderTop: idx > 0 ? '1px solid var(--border)' : 'none',
//               }}
//             >
//               <div>
//                 <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>
//                   {row.label}
//                 </div>
//                 <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
//                   {row.description}
//                 </div>
//               </div>
//               <Toggle
//                 checked={toggles[row.id]}
//                 onChange={(v) => setToggles((prev) => ({ ...prev, [row.id]: v }))}
//                 label={row.label}
//               />
//             </div>
//           ))}
//         </div>
//       </div>
// 
//       {/* ── Save ── */}
//       <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
//         <button
//           onClick={() => toast.success('Company settings saved')}
//           style={{
//             fontSize: 13,
//             fontWeight: 500,
//             color: '#FFFFFF',
//             background: 'var(--accent)',
//             border: 'none',
//             borderRadius: 'var(--radius-sm)',
//             padding: '8px 16px',
//             cursor: 'pointer',
//           }}
//         >
//           Save changes
//         </button>
//       </div>
//     </div>
//   );
// }
