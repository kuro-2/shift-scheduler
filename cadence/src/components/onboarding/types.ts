// ─── Onboarding Wizard — Local Types ──────────────────────────────────────────
// Throwaway wizard-local state shapes. Loosely modeled on the global
// Department / Role / Location entities in src/types/index.ts.

export interface OnboardingDepartment {
  id: string;
  name: string;
  color: string;
}

export interface OnboardingLocation {
  id: string;
  name: string;
  address: string;
}

export type DayOfWeek = 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat';

export interface BusinessHoursDay {
  day: DayOfWeek;
  open: boolean;
  openTime: string;
  closeTime: string;
}

export interface OnboardingRole {
  id: string;
  name: string;
  departmentId: string;
}

export interface OnboardingShiftTemplate {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  roleId: string;
}

export interface OnboardingInvite {
  id: string;
  name: string;
  email: string;
  roleId: string;
}

export interface CompanyInfo {
  companyName: string;
  industry: 'Retail' | 'Hospitality' | 'Healthcare' | 'Other';
  timeZone: string;
}

export interface OnboardingData {
  company: CompanyInfo;
  departments: OnboardingDepartment[];
  locations: OnboardingLocation[];
  businessHours: BusinessHoursDay[];
  roles: OnboardingRole[];
  shiftTemplates: OnboardingShiftTemplate[];
  invites: OnboardingInvite[];
  sendInviteEmails: boolean;
}

// ─── Shared style helpers ──────────────────────────────────────────────────────

export const inputStyle: React.CSSProperties = {
  width: '100%',
  height: 36,
  padding: '0 10px',
  borderRadius: 7,
  border: '1px solid var(--border)',
  background: 'var(--surface-2)',
  color: 'var(--text)',
  fontSize: 13,
  outline: 'none',
};

export const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: 'var(--text-dim)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  marginBottom: 6,
  display: 'block',
};

export const PRESET_COLORS = [
  '#7C6AC4',
  '#5A9B6E',
  '#5B7FD4',
  '#D4A04A',
  '#C76054',
  '#3D8A8A',
  '#A35FB0',
  '#6373B5',
];

export function genId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}
