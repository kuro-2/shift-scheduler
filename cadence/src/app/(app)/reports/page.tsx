import { TrendingUp } from 'lucide-react';
import { ComingSoon } from '@/components/common/ComingSoon';

export default function ReportsPage() {
  return <ComingSoon title="Reports" description="Reporting and analytics are coming soon." Icon={TrendingUp} />;
}

// ─── Original implementation (commented out — tab re-enabled with a
// "Coming soon" placeholder while this section is rebuilt; nothing deleted) ───
// 'use client';
// 
// import { useQuery } from '@tanstack/react-query';
// import { Calendar, Download } from 'lucide-react';
// import { toast } from 'sonner';
// import { getReportsSummary } from '@/services/reports.service';
// import { KpiTile } from '@/components/reports/KpiTile';
// import { LaborCostChart } from '@/components/reports/LaborCostChart';
// import { DepartmentBreakdown } from '@/components/reports/DepartmentBreakdown';
// import { TopPerformers } from '@/components/reports/TopPerformers';
// 
// export default function ReportsPage() {
//   const { data: summary, isLoading } = useQuery({
//     queryKey: ['reports', 'summary'],
//     queryFn: () => getReportsSummary(),
//   });
// 
//   const kpis = summary?.kpis ?? [];
// 
//   function handleExportCSV() {
//     const rows = [
//       ['Metric', 'Value', 'Change'],
//       ...kpis.map((k) => [k.label, k.value, k.change ?? '']),
//     ];
//     const csv = rows.map((r) => r.join(',')).join('\n');
//     const blob = new Blob([csv], { type: 'text/csv' });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = 'nexora-report-jun-2026.csv';
//     a.click();
//     URL.revokeObjectURL(url);
//     toast.success('Report exported as CSV');
//   }
// 
//   return (
//     <div
//       style={{
//         maxWidth: 1440,
//         margin: '0 auto',
//         padding: '28px 32px 60px',
//       }}
//     >
//       {/* ── Header ── */}
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
//             Reports
//           </h1>
//           <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
//             Jun 1 – Jun 28, 2026 · vs previous 4 weeks
//           </p>
//         </div>
// 
//         {/* Action buttons */}
//         <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
//           <button
//             onClick={() => toast.info('Date range picker coming soon — currently showing Jun 1–28, 2026')}
//             style={{
//               display: 'flex',
//               alignItems: 'center',
//               gap: 6,
//               fontSize: 13,
//               fontWeight: 500,
//               color: 'var(--text)',
//               background: 'var(--surface)',
//               border: '1px solid var(--border)',
//               borderRadius: 'var(--radius-sm)',
//               padding: '7px 13px',
//               cursor: 'pointer',
//             }}
//           >
//             <Calendar size={14} />
//             Jun 1 – Jun 28, 2026
//           </button>
//           <button
//             onClick={handleExportCSV}
//             style={{
//               display: 'flex',
//               alignItems: 'center',
//               gap: 6,
//               fontSize: 13,
//               fontWeight: 500,
//               color: 'var(--text)',
//               background: 'var(--surface)',
//               border: '1px solid var(--border)',
//               borderRadius: 'var(--radius-sm)',
//               padding: '7px 13px',
//               cursor: 'pointer',
//             }}
//           >
//             Export CSV
//           </button>
//           <button
//             onClick={() => toast.info('PDF export coming soon — use Export CSV for now')}
//             style={{
//               display: 'flex',
//               alignItems: 'center',
//               gap: 6,
//               fontSize: 13,
//               fontWeight: 500,
//               color: 'var(--text)',
//               background: 'var(--surface)',
//               border: '1px solid var(--border)',
//               borderRadius: 'var(--radius-sm)',
//               padding: '7px 13px',
//               cursor: 'pointer',
//             }}
//           >
//             <Download size={14} />
//             Export PDF
//           </button>
//         </div>
//       </div>
// 
//       {/* ── KPI Tiles ── */}
//       <div
//         style={{
//           display: 'grid',
//           gridTemplateColumns: 'repeat(4, 1fr)',
//           gap: 14,
//           marginBottom: 14,
//         }}
//       >
//         {isLoading || kpis.length === 0
//           ? Array.from({ length: 4 }).map((_, i) => (
//               <div
//                 key={i}
//                 style={{
//                   background: 'var(--surface)',
//                   border: '1px solid var(--border)',
//                   borderRadius: 'var(--radius)',
//                   padding: 18,
//                   height: 104,
//                 }}
//               />
//             ))
//           : kpis.map((kpi) => (
//               <KpiTile
//                 key={kpi.label}
//                 label={kpi.label}
//                 value={kpi.value}
//                 delta={kpi.change}
//                 deltaLabel="vs prev. 4wks"
//                 goodDirection={kpi.goodDirection ?? (kpi.trend === 'down' ? 'down' : 'up')}
//               />
//             ))}
//       </div>
// 
//       {/* ── Labor Cost Chart ── */}
//       <div style={{ marginBottom: 14 }}>
//         <LaborCostChart />
//       </div>
// 
//       {/* ── Bottom Row ── */}
//       <div
//         style={{
//           display: 'grid',
//           gridTemplateColumns: '1fr 1fr',
//           gap: 14,
//         }}
//       >
//         <DepartmentBreakdown />
//         <TopPerformers />
//       </div>
//     </div>
//   );
// }
