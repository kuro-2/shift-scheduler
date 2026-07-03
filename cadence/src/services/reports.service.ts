import type {
  ReportsSummary,
  LaborCostDataPoint,
  DepartmentBreakdown,
  TopPerformer,
  DateRange,
  KPICard,
} from '@/types';
import { apiFetch } from '@/lib/api-url';

interface ReportsApiResponse {
  summary: {
    totalLaborCost: number;
    regularHours: number;
    overtimeHours: number;
    totalHours: number;
    totalExpenses: number;
    headcount: number;
  };
  laborCostData: LaborCostDataPoint[];
  departmentBreakdown: DepartmentBreakdown[];
  topPerformers: TopPerformer[];
  expenses: { expenseType: string; expenseMonth: string; totalExpenseAmt: number }[];
}

async function fetchReports(locationId?: string, range?: DateRange): Promise<ReportsApiResponse> {
  const params = new URLSearchParams();
  if (locationId) params.set('locationId', locationId);
  if (range?.start) params.set('dateFrom', range.start);
  if (range?.end) params.set('dateTo', range.end);
  const qs = params.toString();
  return apiFetch<ReportsApiResponse>(`/api/reports${qs ? `?${qs}` : ''}`);
}

export async function getReportsSummary(
  locationId?: string,
  dateRange?: DateRange
): Promise<ReportsSummary> {
  const data = await fetchReports(locationId, dateRange);
  const s = data.summary;
  const avgRate = s.totalHours > 0 ? Math.round(s.totalLaborCost / s.totalHours) : 0;

  const kpis: KPICard[] = [
    { label: 'Total Labor Cost', value: `$${s.totalLaborCost.toLocaleString()}`, change: 0, trend: 'neutral', goodDirection: 'down' },
    { label: 'Total Hours', value: s.totalHours.toFixed(1), change: 0, trend: 'neutral' },
    { label: 'Overtime Hours', value: s.overtimeHours.toFixed(1), change: 0, trend: 'neutral', goodDirection: 'down' },
    { label: 'Headcount', value: String(s.headcount), change: 0, trend: 'neutral' },
    { label: 'Avg Hourly Rate', value: `$${avgRate}`, change: 0, trend: 'neutral' },
  ];

  return {
    kpis,
    period: dateRange ?? { start: '', end: '' },
  };
}

export async function getLaborCostData(
  locationId?: string,
  dateRange?: DateRange
): Promise<LaborCostDataPoint[]> {
  const data = await fetchReports(locationId, dateRange);
  return data.laborCostData;
}

export const getLaborCostChart = getLaborCostData;

export async function getDepartmentBreakdown(
  locationId?: string,
  dateRange?: DateRange
): Promise<DepartmentBreakdown[]> {
  const data = await fetchReports(locationId, dateRange);
  return data.departmentBreakdown;
}

export async function getTopPerformers(
  locationId?: string,
  dateRange?: DateRange
): Promise<TopPerformer[]> {
  const data = await fetchReports(locationId, dateRange);
  return data.topPerformers;
}

export async function getMonthlyExpenses(locationId: string, _month: string) {
  const data = await fetchReports(locationId);
  return data.expenses;
}

export async function createExpenseEntry(input: {
  locationId: string;
  expenseType: string;
  expenseMonth: string;
  expenseAmt: number;
  expenseDt: string;
  comments?: string;
}): Promise<void> {
  await apiFetch('/api/reports', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
}
