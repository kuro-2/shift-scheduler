import { Clock } from 'lucide-react';
import { ComingSoon } from '@/components/common/ComingSoon';

export default function AttendancePage() {
  return <ComingSoon title="Attendance" description="Attendance tracking is coming soon." Icon={Clock} />;
}

// ─── Original implementation (commented out — tab re-enabled with a
// "Coming soon" placeholder while this section is rebuilt; nothing deleted) ───
// import { AttendanceStatsRow } from '@/components/attendance/AttendanceStatsRow';
// import { AttendanceTable } from '@/components/attendance/AttendanceTable';
// 
// export default function AttendancePage() {
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
//           Attendance
//         </h1>
//         <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
//           Live + historical timesheet for Northgate Co.
//         </p>
//       </div>
// 
//       {/* ── Stat Tiles ── */}
//       <AttendanceStatsRow />
// 
//       {/* ── Attendance Table ── */}
//       <AttendanceTable />
//     </div>
//   );
// }
