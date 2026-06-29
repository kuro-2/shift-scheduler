import type {
  ReportsSummary,
  LaborCostDataPoint,
  DepartmentBreakdown,
  TopPerformer,
  DateRange,
} from '@/types';
import { mockDelay } from '@/lib/utils';

// ─── Helper ───────────────────────────────────────────────────────────────────

function randomBetween(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

// ─── Mock Data Generators ─────────────────────────────────────────────────────

const CURRENT_WEEK_LABOR_COST: LaborCostDataPoint[] = [
  { date: '2026-06-22', actual: 4820, budget: 5000, projected: 4920 },
  { date: '2026-06-23', actual: 5140, budget: 5000, projected: 5100 },
  { date: '2026-06-24', actual: 4980, budget: 5000, projected: 4980 },
  { date: '2026-06-25', actual: 5380, budget: 5000, projected: 5300 },
  { date: '2026-06-26', actual: 5210, budget: 5000, projected: 5150 },
  { date: '2026-06-27', actual: 2640, budget: 2800, projected: 2700 },
  { date: '2026-06-28', actual: 1820, budget: 2000, projected: 1900 },
];

const DEPARTMENT_BREAKDOWN: DepartmentBreakdown[] = [
  {
    departmentId: 'dept_ops',
    name: 'Operations',
    color: '#7C6AC4',
    hours: 156,
    cost: 13644,
    headcount: 3,
    percentage: 38.5,
  },
  {
    departmentId: 'dept_sales',
    name: 'Sales',
    color: '#5A9B6E',
    hours: 122,
    cost: 11284,
    headcount: 3,
    percentage: 30.1,
  },
  {
    departmentId: 'dept_front',
    name: 'Front Desk',
    color: '#C76054',
    hours: 96,
    cost: 7728,
    headcount: 3,
    percentage: 23.7,
  },
  {
    departmentId: 'dept_mgmt',
    name: 'Management',
    color: '#3D4D8A',
    hours: 40,
    cost: 7200,
    headcount: 1,
    percentage: 7.7,
  },
];

const TOP_PERFORMERS: TopPerformer[] = [
  {
    employeeId: 'emp_001',
    name: 'Alex Mercer',
    initials: 'AM',
    avatarColor: '#7C6AC4',
    punctualityScore: 98.2,
    hoursWorked: 40,
    shiftsCompleted: 5,
    overtimeHours: 0,
  },
  {
    employeeId: 'emp_004',
    name: 'Priya Shah',
    initials: 'PS',
    avatarColor: '#3D4D8A',
    punctualityScore: 100,
    hoursWorked: 40,
    shiftsCompleted: 5,
    overtimeHours: 0,
  },
  {
    employeeId: 'emp_007',
    name: 'Devon Lee',
    initials: 'DL',
    avatarColor: '#6373B5',
    punctualityScore: 97.5,
    hoursWorked: 40,
    shiftsCompleted: 5,
    overtimeHours: 0,
  },
  {
    employeeId: 'emp_002',
    name: 'Jordan Park',
    initials: 'JP',
    avatarColor: '#5A9B6E',
    punctualityScore: 95.8,
    hoursWorked: 42.5,
    shiftsCompleted: 5,
    overtimeHours: 2.5,
  },
  {
    employeeId: 'emp_005',
    name: 'Sam Reyes',
    initials: 'SR',
    avatarColor: '#D4A04A',
    punctualityScore: 88.4,
    hoursWorked: 39.5,
    shiftsCompleted: 5,
    overtimeHours: 0,
  },
];

// ─── Service Functions ────────────────────────────────────────────────────────

export async function getReportsSummary(_range?: DateRange): Promise<ReportsSummary> {
  await mockDelay(300, 600);

  return {
    kpis: [
      {
        label: 'Total Labor Cost',
        value: '$39,856',
        change: -3.2,
        trend: 'down',
      },
      {
        label: 'Scheduled Hours',
        value: '414h',
        change: 2.1,
        trend: 'up',
      },
      {
        label: 'Avg Punctuality',
        value: '94.8%',
        change: 1.4,
        trend: 'up',
      },
      {
        label: 'Open Shifts',
        value: '3',
        change: -40,
        trend: 'down',
      },
      {
        label: 'Overtime Hours',
        value: '12.5h',
        change: -18.3,
        trend: 'down',
      },
      {
        label: 'Schedule Fill Rate',
        value: '91%',
        change: 4.5,
        trend: 'up',
      },
    ],
    period: {
      start: '2026-06-22',
      end: '2026-06-28',
    },
  };
}

export async function getLaborCostChart(_range?: DateRange): Promise<LaborCostDataPoint[]> {
  await mockDelay(250, 500);
  return [...CURRENT_WEEK_LABOR_COST];
}

export async function getDepartmentBreakdown(): Promise<DepartmentBreakdown[]> {
  await mockDelay(200, 450);
  return [...DEPARTMENT_BREAKDOWN];
}

export async function getTopPerformers(limit = 5): Promise<TopPerformer[]> {
  await mockDelay(200, 400);
  return TOP_PERFORMERS.slice(0, limit);
}

export async function getWeeklyHoursByEmployee(): Promise<
  { employeeId: string; name: string; hours: number; budget: number }[]
> {
  await mockDelay();
  return [
    { employeeId: 'emp_001', name: 'Alex Mercer', hours: 40, budget: 40 },
    { employeeId: 'emp_002', name: 'Jordan Park', hours: 42.5, budget: 40 },
    { employeeId: 'emp_003', name: 'Sarah Kim', hours: 20, budget: 32 },
    { employeeId: 'emp_004', name: 'Priya Shah', hours: 40, budget: 40 },
    { employeeId: 'emp_005', name: 'Sam Reyes', hours: 39.5, budget: 40 },
    { employeeId: 'emp_006', name: 'Naomi West', hours: 36, budget: 40 },
    { employeeId: 'emp_007', name: 'Devon Lee', hours: 40, budget: 40 },
    { employeeId: 'emp_008', name: 'Marcus Chen', hours: 28, budget: 32 },
    { employeeId: 'emp_009', name: 'Riley Hayes', hours: 32, budget: 40 },
  ];
}

export async function getLaborCostByDayOfWeek(): Promise<
  { day: string; cost: number; budget: number }[]
> {
  await mockDelay();
  return [
    { day: 'Mon', cost: 4820, budget: 5000 },
    { day: 'Tue', cost: 5140, budget: 5000 },
    { day: 'Wed', cost: 4980, budget: 5000 },
    { day: 'Thu', cost: 5380, budget: 5000 },
    { day: 'Fri', cost: 5210, budget: 5000 },
    { day: 'Sat', cost: 2640, budget: 2800 },
    { day: 'Sun', cost: 1820, budget: 2000 },
  ];
}
