// ─── Status & Enum Types ─────────────────────────────────────────────────────

export type ShiftStatus = 'filled' | 'open' | 'conflict' | 'draft';
export type EmployeeStatus = 'active' | 'part-time' | 'inactive';
export type TimeOffType = 'vacation' | 'sick' | 'personal' | 'unpaid';
export type RequestStatus = 'pending' | 'approved' | 'rejected';
export type AttendanceStatus = 'on_time' | 'late' | 'early' | 'no_show' | 'on_shift' | 'on_break' | 'complete' | 'sick';
export type NotificationType = 'conflict' | 'time_off_request' | 'swap_request' | 'late' | 'sick' | 'published' | 'mention';
export type ShiftWarning = 'overtime' | 'overlap' | 'missing_skill' | 'underage_hours' | null;
export type DateRange = { start: string; end: string };
export type Theme = 'light' | 'dark';
export type Density = 'comfortable' | 'compact';

// ─── Core Entities ───────────────────────────────────────────────────────────

export interface Employee {
  id: string;
  name: string;
  email: string;
  initials: string;
  avatarColor: string;
  roleId: string;
  departmentId: string;
  locationIds: string[];
  scheduledHours: number;
  contractHours: number;
  status: EmployeeStatus;
  skills: string[];
  certifications: { name: string; expiresAt: string }[];
  hourlyRate?: number;
  startDate: string;
  emergencyContact?: { name: string; phone: string };
}

export interface Department {
  id: string;
  name: string;
  color: string;
}

export interface Role {
  id: string;
  name: string;
  departmentId: string;
  defaultBreak: number; // minutes
  requiredSkills: string[];
}

export interface Location {
  id: string;
  name: string;
  address: string;
  coordinates?: { lat: number; lng: number };
  geofenceRadius?: number; // meters
}

export interface Shift {
  id: string;
  employeeId: string | null;
  date: string; // ISO date string YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  breakMinutes: number;
  roleId: string;
  departmentId: string;
  locationId: string;
  status: ShiftStatus;
  warning?: ShiftWarning;
  notes?: string;
  requiredSkills?: string[];
  publishedAt?: string;
}

export interface TimeOffRequest {
  id: string;
  employeeId: string;
  type: TimeOffType;
  startDate: string;
  endDate: string;
  reason?: string;
  status: RequestStatus;
  submittedAt: string;
  decidedAt?: string;
  decidedBy?: string;
  managerComment?: string;
}

export interface ShiftSwap {
  id: string;
  fromEmployeeId: string;
  toEmployeeId: string;
  fromShiftId: string;
  toShiftId: string;
  status: RequestStatus;
  submittedAt: string;
  conflictCheck: {
    hasConflict: boolean;
    reasons: string[];
  };
}

export interface AttendanceEvent {
  id: string;
  employeeId: string;
  shiftId: string;
  clockIn?: string; // ISO datetime
  clockOut?: string; // ISO datetime
  breaks: { start: string; end: string }[];
  gpsVerified: boolean;
  locationId?: string;
  status: AttendanceStatus;
  notes?: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  subtitle: string;
  actorId?: string;
  unread: boolean;
  createdAt: string;
  link?: string;
}

// ─── Computed / View Models ──────────────────────────────────────────────────

export interface ShiftWithEmployee extends Shift {
  employee?: Employee;
  role?: Role;
  department?: Department;
  location?: Location;
}

export interface EmployeeWithSchedule extends Employee {
  department?: Department;
  role?: Role;
  shifts?: Shift[];
  weeklyHours?: number;
}

// ─── Report Types ─────────────────────────────────────────────────────────────

export interface KPICard {
  label: string;
  value: string;
  change: number; // percentage change vs previous period
  trend: 'up' | 'down' | 'neutral';
}

export interface LaborCostDataPoint {
  date: string;
  actual: number;
  budget: number;
  projected: number;
}

export interface DepartmentBreakdown {
  departmentId: string;
  name: string;
  color: string;
  hours: number;
  cost: number;
  headcount: number;
  percentage: number;
}

export interface TopPerformer {
  employeeId: string;
  name: string;
  initials: string;
  avatarColor: string;
  punctualityScore: number;
  hoursWorked: number;
  shiftsCompleted: number;
  overtimeHours: number;
}

export interface ReportsSummary {
  kpis: KPICard[];
  period: DateRange;
}

// ─── Service Input Types ──────────────────────────────────────────────────────

export interface CreateShiftInput {
  employeeId: string | null;
  date: string;
  startTime: string;
  endTime: string;
  breakMinutes?: number;
  roleId: string;
  departmentId: string;
  locationId: string;
  notes?: string;
  requiredSkills?: string[];
}

export interface UpdateShiftInput extends Partial<CreateShiftInput> {
  status?: ShiftStatus;
  warning?: ShiftWarning;
  publishedAt?: string;
}

export interface ShiftFilter {
  dateRange?: DateRange;
  departmentId?: string;
  employeeId?: string;
  locationId?: string;
  status?: ShiftStatus;
  weekStart?: string;
}

export interface TimeOffFilter {
  status?: RequestStatus;
  employeeId?: string;
  type?: TimeOffType;
}

// ─── UI Types ────────────────────────────────────────────────────────────────

export interface StatusConfig {
  bg: string;
  text: string;
  dot: string;
  border: string;
  label: string;
}

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  href: string;
  badge?: number;
}
