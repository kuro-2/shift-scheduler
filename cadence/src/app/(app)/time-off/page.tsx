import { CalendarOff } from 'lucide-react';
import { ComingSoon } from '@/components/common/ComingSoon';

export default function TimeOffPage() {
  return <ComingSoon title="Time off" description="Time-off requests and swaps are coming soon." Icon={CalendarOff} />;
}

// ─── Original implementation (commented out — tab re-enabled with a
// "Coming soon" placeholder while this section is rebuilt; nothing deleted) ───
// 'use client';
// 
// import { useQuery } from '@tanstack/react-query';
// import { Calendar } from 'lucide-react';
// import { toast } from 'sonner';
// import { getTimeOffRequests, getShiftSwaps } from '@/services/time-off.service';
// import { TimeOffTabs } from '@/components/time-off/TimeOffTabs';
// 
// export default function TimeOffPage() {
//   const { data: requests = [] } = useQuery({
//     queryKey: ['time-off-requests'],
//     queryFn: () => getTimeOffRequests(),
//   });
// 
//   const { data: swaps = [] } = useQuery({
//     queryKey: ['shift-swaps'],
//     queryFn: () => getShiftSwaps(),
//   });
// 
//   const pendingTimeOff = requests.filter((r) => r.status === 'pending').length;
//   const pendingSwaps = swaps.filter((s) => s.status === 'pending').length;
//   const totalPending = pendingTimeOff + pendingSwaps;
// 
//   return (
//     <div
//       style={{
//         maxWidth: 1440,
//         margin: '0 auto',
//         padding: '28px 32px 60px',
//       }}
//     >
//       {/* Header */}
//       <div
//         style={{
//           display: 'flex',
//           alignItems: 'flex-start',
//           justifyContent: 'space-between',
//           marginBottom: 24,
//           gap: 16,
//         }}
//       >
//         <div>
//           <h1
//             style={{
//               fontSize: 22,
//               fontWeight: 600,
//               color: 'var(--text)',
//               margin: 0,
//               lineHeight: 1.25,
//             }}
//           >
//             Time off &amp; swaps
//           </h1>
//           <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
//             {totalPending} awaiting your decision · {pendingTimeOff} time off · {pendingSwaps} shift swaps
//           </p>
//         </div>
// 
//         <button
//           onClick={() => toast.info('Calendar view coming soon — time-off periods will appear overlaid on the schedule')}
//           style={{
//             display: 'flex',
//             alignItems: 'center',
//             gap: 6,
//             fontSize: 13,
//             fontWeight: 500,
//             color: 'var(--text)',
//             background: 'var(--surface)',
//             border: '1px solid var(--border)',
//             borderRadius: 'var(--radius-sm)',
//             padding: '7px 13px',
//             cursor: 'pointer',
//             flexShrink: 0,
//           }}
//         >
//           <Calendar size={14} />
//           View calendar
//         </button>
//       </div>
// 
//       <TimeOffTabs />
//     </div>
//   );
// }
