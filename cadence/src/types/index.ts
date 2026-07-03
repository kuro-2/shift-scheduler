// ─── Status & Enum Types ─────────────────────────────────────────────────────

export type ShiftStatus = 'filled' | 'open' | 'conflict' | 'draft';
export type EmployeeStatus = 'active' | 'part-time' | 'inactive';
export type EmploymentType = 'Full-time' | 'Part-time' | 'Contract';
export type EmploymentStatus = 'Active' | 'Inactive' | 'Terminated';
export type TimeOffType = 'vacation' | 'sick' | 'personal' | 'unpaid';
export type RequestStatus = 'pending' | 'approved' | 'rejected';
export type AttendanceStatus = 'on_time' | 'late' | 'early' | 'no_show' | 'on_shift' | 'on_break' | 'complete' | 'sick';
export type NotificationType = 'conflict' | 'time_off_request' | 'swap_request' | 'late' | 'sick' | 'published' | 'mention';
export type ShiftWarning = 'overtime' | 'overlap' | 'missing_skill' | 'underage_hours' | null;
export type DateRange = { start: string; end: string };
export type Theme = 'light' | 'dark';
export type Density = 'comfortable' | 'compact';
export type ScheduleViewMode = 'day' | 'week' | 'month' | 'year';

// ─── Core Entities ───────────────────────────────────────────────────────────

export interface Employee {
  // ── App / legacy keys (kept for component compatibility) ──────────────────
  id: string;            // maps to EMPLOYEE_ID
  name: string;          // derived: FIRST_NAME + ' ' + LAST_NAME
  email: string;         // maps to EMAIL
  initials: string;      // derived from name
  avatarColor: string;   // UI-only, not stored in Snowflake
  roleId: string;        // maps to JOB_ROLE (internal ref)
  departmentId: string;  // maps to DEPARTMENT (internal ref)
  locationIds: string[]; // derived from LOCATION_KEY / LOCATION_ID
  scheduledHours: number;
  contractHours: number;
  status: EmployeeStatus;
  skills: string[];
  certifications: { name: string; expiresAt: string }[];
  hourlyRate?: number;   // maps to HOURLY_RATE
  startDate: string;     // maps to HIRE_DATE
  emergencyContact?: { name: string; phone: string };

  // ── Snowflake DIM_EMPLOYEE_CURATED columns ────────────────────────────────
  employeeKey?: number;          // EMPLOYEE_KEY (surrogate PK)
  brandKey?: number;             // BRAND_KEY
  locationKey?: number;          // LOCATION_KEY (primary location FK)
  locationId?: string;           // LOCATION_ID (natural key of primary location)
  firstName?: string;            // FIRST_NAME
  lastName?: string;             // LAST_NAME
  phoneNumber?: string;          // PHONE_NUMBER
  dateOfBirth?: string | null;   // DATE_OF_BIRTH 'YYYY-MM-DD'
  jobTitle?: string;             // JOB_TITLE
  jobRole?: string;              // JOB_ROLE
  department?: string;           // DEPARTMENT raw column value (e.g. "Operations")
  employmentType?: EmploymentType;    // EMPLOYMENT_TYPE
  hireDate?: string;             // HIRE_DATE 'YYYY-MM-DD'
  terminationDate?: string | null;    // TERMINATION_DATE 'YYYY-MM-DD' | null
  salaryAnnual?: number | null;  // SALARY_ANNUAL
  managerEmployeeKey?: number | null; // MANAGER_EMPLOYEE_KEY
  employmentStatus?: EmploymentStatus; // EMPLOYMENT_STATUS
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
  // ── App / legacy keys ─────────────────────────────────────────────────────
  id: string;           // maps to LOCATION_ID
  name: string;         // maps to LOCATION_NAME
  address: string;      // derived: ADDRESS_LINE1 + city + state + postal
  coordinates?: { lat: number; lng: number };
  geofenceRadius?: number; // meters (UI-only)

  // ── Snowflake DIM_LOCATION columns ────────────────────────────────────────
  locationKey?: number;       // LOCATION_KEY (surrogate PK)
  locationId?: string;        // LOCATION_ID (natural key)
  locationCode?: string;      // LOCATION_CODE
  locationType?: string;      // LOCATION_TYPE e.g. 'Retail', 'Warehouse', 'HQ'
  addressLine1?: string;      // ADDRESS_LINE1
  addressLine2?: string;      // ADDRESS_LINE2
  city?: string;              // CITY
  state?: string;             // STATE
  postalCode?: string;        // POSTAL_CODE
  country?: string;           // COUNTRY
  region?: string;            // REGION
  latitude?: number;          // LATITUDE
  longitude?: number;         // LONGITUDE
  timezone?: string;          // TIMEZONE
  isFranchise?: boolean;      // IS_FRANCHISE_FLAG
  hasDriveThru?: boolean;     // DRIVE_THRU_FLAG
  deliveryEnabled?: boolean;  // DELIVERY_ENABLED_FLAG
  openingDate?: string;       // OPENING_DATE 'YYYY-MM-DD'
  closingDate?: string | null; // CLOSING_DATE
  locationStatus?: string;    // LOCATION_STATUS e.g. 'Active', 'Closed'
  managerName?: string;       // MANAGER_NAME
  locationPhone?: string;     // PHONE_NUMBER (location-level)
  locationEmail?: string;     // EMAIL (location-level)
  customerNumber?: string;    // CUSTOMER_NUMBER
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

  // ── Snowflake STORE_MANUAL_LABOR_HOURS aligned fields ─────────────────────
  /** SHIFT_NO — shift sequence number within the day for this location (1, 2, 3…) */
  shiftNo?: number;
  /** LOCATION_ID natural key (e.g. 'LOC001') — distinct from app locationId surrogate */
  snowflakeLocationId?: string;
  /** EMPLOYEE_ID natural business key (e.g. 'EMP001') — matches DIM_EMPLOYEE_CURATED.EMPLOYEE_ID */
  snowflakeEmployeeId?: string;
  /** WORK_DATE — same date as `date`; alias aligned to Snowflake column name */
  workDate?: string;
  /** HOURS_WORKED — net hours: (endTime − startTime) − breakMinutes/60 */
  hoursWorked?: number;
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

  // ── Snowflake FACT_LABOR_HOURS aligned fields ──────────────────────────────
  /** LABOR_KEY — surrogate PK (auto-increment in Snowflake) */
  laborKey?: number;
  /** EMPLOYEE_KEY — surrogate FK matching DIM_EMPLOYEE_CURATED.EMPLOYEE_KEY */
  employeeKey?: number;
  /** LOCATION_KEY — surrogate FK matching DIM_LOCATION.LOCATION_KEY */
  locationKey?: number;
  /** WORK_DATE — calendar date of the shift 'YYYY-MM-DD' */
  workDate?: string;
  /** SCHEDULED_START_TIME — planned start HH:mm from the shift */
  scheduledStartTime?: string;
  /** SCHEDULED_END_TIME — planned end HH:mm from the shift */
  scheduledEndTime?: string;
  /** REGULAR_HOURS — standard hours worked (≤ 8h/day or ≤ 40h/week) */
  regularHours?: number;
  /** OVERTIME_HOURS — hours worked beyond regular threshold */
  overtimeHours?: number;
  /** BREAK_HOURS — total break time taken */
  breakHours?: number;
  /** TOTAL_HOURS — net hours on clock (regularHours + overtimeHours) */
  totalHours?: number;
  /** REGULAR_HOURLY_RATE — from DIM_EMPLOYEE_CURATED.HOURLY_RATE */
  regularHourlyRate?: number;
  /** REGULAR_COST — regularHours × regularHourlyRate */
  regularCost?: number;
  /** OVERTIME_COST — overtimeHours × (regularHourlyRate × 1.5) */
  overtimeCost?: number;
  /** TOTAL_LABOR_COST — regularCost + overtimeCost */
  totalLaborCost?: number;
  /** LATE_MINUTES — minutes late relative to scheduled start */
  lateMinutes?: number;
  /** TIPS_RECEIVED — default 0 for non-service roles */
  tipsReceived?: number;
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
  /** Resolved Department object (looked up via departmentId) */
  departmentObj?: Department;
  /** Resolved Role object (looked up via roleId) */
  roleObj?: Role;
  shifts?: Shift[];
  weeklyHours?: number;
}

// ─── Report Types ─────────────────────────────────────────────────────────────

export interface KPICard {
  label: string;
  value: string;
  change: number; // percentage change vs previous period
  trend: 'up' | 'down' | 'neutral';
  goodDirection?: 'up' | 'down'; // whether an increase (up) or decrease (down) is the desirable direction
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
  locationId?: string;
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

// ─── Auth Types ───────────────────────────────────────────────────────────────

export interface UserAccount {
  username: string;
  locationId: string;
  userRole: 'ADMIN' | 'MANAGER' | 'VIEWER';
  isActive: boolean;
  lastLoginAt: string | null;
  failedLoginCount: number;
  createdAt: string;
}
