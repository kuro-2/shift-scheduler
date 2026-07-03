import { Users } from 'lucide-react';
import { ComingSoon } from '@/components/common/ComingSoon';

export default function PeoplePage() {
  return <ComingSoon title="People" description="Team directory and profiles are coming soon." Icon={Users} />;
}

// ─── Original implementation (commented out — tab re-enabled with a
// "Coming soon" placeholder while this section is rebuilt; nothing deleted) ───
// 'use client';
// 
// import { useRef, useState } from 'react';
// import { Plus, Upload } from 'lucide-react';
// import { toast } from 'sonner';
// import { PeopleTable } from '@/components/people/PeopleTable';
// import { InvitePersonModal } from '@/components/people/InvitePersonModal';
// import { useQuery, useQueryClient } from '@tanstack/react-query';
// import { getEmployees, createEmployee, ROLES } from '@/services/employees.service';
// 
// function parseCSV(text: string): Record<string, string>[] {
//   const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
//   if (lines.length < 2) return [];
//   const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
//   return lines.slice(1).map((line) => {
//     const cells = line.split(',').map((c) => c.trim());
//     const row: Record<string, string> = {};
//     headers.forEach((h, i) => { row[h] = cells[i] ?? ''; });
//     return row;
//   });
// }
// 
// export default function PeoplePage() {
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const [inviteOpen, setInviteOpen] = useState(false);
//   const [importing, setImporting] = useState(false);
//   const queryClient = useQueryClient();
// 
//   const { data: employees = [] } = useQuery({
//     queryKey: ['employees'],
//     queryFn: () => getEmployees(),
//   });
// 
//   const activeCount = employees.filter((e) => e.status === 'active').length;
//   const partTimeCount = employees.filter((e) => e.status === 'part-time').length;
// 
//   async function handleImportCSV(e: React.ChangeEvent<HTMLInputElement>) {
//     const file = e.target.files?.[0];
//     e.target.value = '';
//     if (!file) return;
//     setImporting(true);
//     try {
//       const text = await file.text();
//       const rows = parseCSV(text);
//       const validRows = rows.filter((r) => r.name && r.email);
//       let created = 0;
//       for (const row of validRows) {
//         const [firstName, ...rest] = row.name.split(/\s+/);
//         const role = ROLES.find((r) => r.name.toLowerCase() === (row.role ?? '').toLowerCase()) ?? ROLES[0];
//         try {
//           await createEmployee({
//             name: row.name,
//             email: row.email,
//             firstName,
//             lastName: rest.join(' '),
//             jobTitle: role.name,
//             jobRole: role.name,
//             department: row.department,
//             employmentType: 'Full-time',
//             hourlyRate: row.hourlyrate ? Number(row.hourlyrate) : 0,
//             hireDate: new Date().toISOString().slice(0, 10),
//           });
//           created++;
//         } catch {
//           // skip row on failure, continue importing the rest
//         }
//       }
//       await queryClient.invalidateQueries({ queryKey: ['employees'] });
//       toast.success(
//         created > 0
//           ? `Imported ${created} of ${validRows.length} employee${validRows.length === 1 ? '' : 's'} from "${file.name}"`
//           : `No valid rows found in "${file.name}" — expected a "name,email" header`
//       );
//     } catch (err) {
//       toast.error(err instanceof Error ? err.message : 'Failed to import CSV');
//     } finally {
//       setImporting(false);
//     }
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
//               letterSpacing: '-0.02em',
//               color: 'var(--text)',
//               margin: 0,
//               lineHeight: 1.25,
//             }}
//           >
//             People
//           </h1>
//           <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
//             {activeCount} active · {partTimeCount} part-time · all Northgate Co.
//           </p>
//         </div>
// 
//         {/* Action buttons */}
//         <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
//           <input
//             ref={fileInputRef}
//             type="file"
//             accept=".csv"
//             style={{ display: 'none' }}
//             onChange={handleImportCSV}
//           />
//           <button
//             onClick={() => fileInputRef.current?.click()}
//             disabled={importing}
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
//               cursor: importing ? 'default' : 'pointer',
//               opacity: importing ? 0.6 : 1,
//             }}
//           >
//             <Upload size={14} />
//             {importing ? 'Importing…' : 'Import CSV'}
//           </button>
//           <button
//             onClick={() => setInviteOpen(true)}
//             style={{
//               display: 'flex',
//               alignItems: 'center',
//               gap: 6,
//               fontSize: 13,
//               fontWeight: 500,
//               color: '#FFFFFF',
//               background: 'var(--accent)',
//               border: 'none',
//               borderRadius: 'var(--radius-sm)',
//               padding: '7px 13px',
//               cursor: 'pointer',
//             }}
//           >
//             <Plus size={14} />
//             Invite person
//           </button>
//         </div>
//       </div>
// 
//       <PeopleTable />
// 
//       <InvitePersonModal open={inviteOpen} onClose={() => setInviteOpen(false)} />
//     </div>
//   );
// }
