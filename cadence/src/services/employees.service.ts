import type { Employee, Department, Role, Location } from '@/types';
import { mockDelay } from '@/lib/utils';

// ─── Static Reference Data ────────────────────────────────────────────────────

export const DEPARTMENTS: Department[] = [
  { id: 'dept_ops', name: 'Operations', color: '#7C6AC4' },
  { id: 'dept_sales', name: 'Sales', color: '#5A9B6E' },
  { id: 'dept_front', name: 'Front Desk', color: '#C76054' },
  { id: 'dept_mgmt', name: 'Management', color: '#3D4D8A' },
];

export const ROLES: Role[] = [
  {
    id: 'role_shift_lead',
    name: 'Shift Lead',
    departmentId: 'dept_ops',
    defaultBreak: 30,
    requiredSkills: ['leadership', 'inventory'],
  },
  {
    id: 'role_ops_associate',
    name: 'Operations Associate',
    departmentId: 'dept_ops',
    defaultBreak: 30,
    requiredSkills: ['forklift', 'safety_certified'],
  },
  {
    id: 'role_sales_rep',
    name: 'Sales Representative',
    departmentId: 'dept_sales',
    defaultBreak: 30,
    requiredSkills: ['crm', 'customer_service'],
  },
  {
    id: 'role_senior_sales',
    name: 'Senior Sales Rep',
    departmentId: 'dept_sales',
    defaultBreak: 30,
    requiredSkills: ['crm', 'customer_service', 'key_account'],
  },
  {
    id: 'role_receptionist',
    name: 'Receptionist',
    departmentId: 'dept_front',
    defaultBreak: 30,
    requiredSkills: ['customer_service', 'phone_etiquette'],
  },
  {
    id: 'role_concierge',
    name: 'Concierge',
    departmentId: 'dept_front',
    defaultBreak: 30,
    requiredSkills: ['customer_service', 'multilingual'],
  },
  {
    id: 'role_manager',
    name: 'Manager',
    departmentId: 'dept_mgmt',
    defaultBreak: 30,
    requiredSkills: ['leadership', 'scheduling'],
  },
];

export const LOCATIONS: Location[] = [
  {
    id: 'loc_main',
    name: 'Main Office',
    address: '123 Business Ave, Suite 400, San Francisco, CA 94102',
    coordinates: { lat: 37.7749, lng: -122.4194 },
    geofenceRadius: 150,
  },
  {
    id: 'loc_north',
    name: 'North Branch',
    address: '456 Commerce St, San Francisco, CA 94108',
    coordinates: { lat: 37.7956, lng: -122.4071 },
    geofenceRadius: 100,
  },
  {
    id: 'loc_remote',
    name: 'Remote',
    address: 'Remote / Work From Home',
  },
];

// ─── Seed Data ────────────────────────────────────────────────────────────────

const SEED_EMPLOYEES: Employee[] = [
  {
    id: 'emp_001',
    name: 'Alex Mercer',
    email: 'alex.mercer@cadence.co',
    initials: 'AM',
    avatarColor: '#7C6AC4',
    roleId: 'role_shift_lead',
    departmentId: 'dept_ops',
    locationIds: ['loc_main'],
    scheduledHours: 40,
    contractHours: 40,
    status: 'active',
    skills: ['leadership', 'inventory', 'safety_certified', 'forklift'],
    certifications: [
      { name: 'OSHA Safety', expiresAt: '2027-03-15' },
      { name: 'Forklift Operator', expiresAt: '2026-09-30' },
    ],
    hourlyRate: 28.5,
    startDate: '2021-04-12',
    emergencyContact: { name: 'Jordan Mercer', phone: '+1 (555) 201-4832' },
  },
  {
    id: 'emp_002',
    name: 'Jordan Park',
    email: 'jordan.park@cadence.co',
    initials: 'JP',
    avatarColor: '#5A9B6E',
    roleId: 'role_senior_sales',
    departmentId: 'dept_sales',
    locationIds: ['loc_main', 'loc_north'],
    scheduledHours: 38,
    contractHours: 40,
    status: 'active',
    skills: ['crm', 'customer_service', 'key_account', 'negotiation'],
    certifications: [{ name: 'Salesforce Admin', expiresAt: '2026-12-01' }],
    hourlyRate: 32.0,
    startDate: '2020-07-01',
    emergencyContact: { name: 'Sam Park', phone: '+1 (555) 304-9271' },
  },
  {
    id: 'emp_003',
    name: 'Sarah Kim',
    email: 'sarah.kim@cadence.co',
    initials: 'SK',
    avatarColor: '#C76054',
    roleId: 'role_receptionist',
    departmentId: 'dept_front',
    locationIds: ['loc_main'],
    scheduledHours: 32,
    contractHours: 32,
    status: 'part-time',
    skills: ['customer_service', 'phone_etiquette', 'scheduling'],
    certifications: [],
    hourlyRate: 21.0,
    startDate: '2023-01-10',
    emergencyContact: { name: 'David Kim', phone: '+1 (555) 402-6617' },
  },
  {
    id: 'emp_004',
    name: 'Priya Shah',
    email: 'priya.shah@cadence.co',
    initials: 'PS',
    avatarColor: '#3D4D8A',
    roleId: 'role_manager',
    departmentId: 'dept_mgmt',
    locationIds: ['loc_main', 'loc_north', 'loc_remote'],
    scheduledHours: 40,
    contractHours: 40,
    status: 'active',
    skills: ['leadership', 'scheduling', 'crm', 'customer_service'],
    certifications: [
      { name: 'PMP Certified', expiresAt: '2027-06-30' },
      { name: 'HR Management', expiresAt: '2026-11-15' },
    ],
    hourlyRate: 45.0,
    startDate: '2019-02-18',
    emergencyContact: { name: 'Ravi Shah', phone: '+1 (555) 503-8842' },
  },
  {
    id: 'emp_005',
    name: 'Sam Reyes',
    email: 'sam.reyes@cadence.co',
    initials: 'SR',
    avatarColor: '#D4A04A',
    roleId: 'role_ops_associate',
    departmentId: 'dept_ops',
    locationIds: ['loc_main', 'loc_north'],
    scheduledHours: 40,
    contractHours: 40,
    status: 'active',
    skills: ['forklift', 'safety_certified', 'inventory'],
    certifications: [
      { name: 'Forklift Operator', expiresAt: '2026-08-20' },
      { name: 'OSHA Safety', expiresAt: '2027-01-05' },
    ],
    hourlyRate: 23.5,
    startDate: '2022-06-15',
    emergencyContact: { name: 'Maria Reyes', phone: '+1 (555) 601-3391' },
  },
  {
    id: 'emp_006',
    name: 'Naomi West',
    email: 'naomi.west@cadence.co',
    initials: 'NW',
    avatarColor: '#C9936B',
    roleId: 'role_sales_rep',
    departmentId: 'dept_sales',
    locationIds: ['loc_north'],
    scheduledHours: 36,
    contractHours: 40,
    status: 'active',
    skills: ['crm', 'customer_service', 'product_demo'],
    certifications: [],
    hourlyRate: 26.0,
    startDate: '2022-11-07',
    emergencyContact: { name: 'Chris West', phone: '+1 (555) 702-5514' },
  },
  {
    id: 'emp_007',
    name: 'Devon Lee',
    email: 'devon.lee@cadence.co',
    initials: 'DL',
    avatarColor: '#6373B5',
    roleId: 'role_concierge',
    departmentId: 'dept_front',
    locationIds: ['loc_main'],
    scheduledHours: 40,
    contractHours: 40,
    status: 'active',
    skills: ['customer_service', 'multilingual', 'phone_etiquette'],
    certifications: [{ name: 'Hospitality Excellence', expiresAt: '2026-10-30' }],
    hourlyRate: 24.0,
    startDate: '2021-09-20',
    emergencyContact: { name: 'Lynn Lee', phone: '+1 (555) 803-7723' },
  },
  {
    id: 'emp_008',
    name: 'Marcus Chen',
    email: 'marcus.chen@cadence.co',
    initials: 'MC',
    avatarColor: '#4A9B8E',
    roleId: 'role_ops_associate',
    departmentId: 'dept_ops',
    locationIds: ['loc_north'],
    scheduledHours: 32,
    contractHours: 32,
    status: 'part-time',
    skills: ['inventory', 'safety_certified'],
    certifications: [{ name: 'OSHA Safety', expiresAt: '2026-12-15' }],
    hourlyRate: 22.0,
    startDate: '2023-03-28',
    emergencyContact: { name: 'Lily Chen', phone: '+1 (555) 901-2295' },
  },
  {
    id: 'emp_009',
    name: 'Riley Hayes',
    email: 'riley.hayes@cadence.co',
    initials: 'RH',
    avatarColor: '#B5736E',
    roleId: 'role_sales_rep',
    departmentId: 'dept_sales',
    locationIds: ['loc_main', 'loc_remote'],
    scheduledHours: 40,
    contractHours: 40,
    status: 'active',
    skills: ['crm', 'customer_service', 'negotiation'],
    certifications: [],
    hourlyRate: 27.5,
    startDate: '2022-02-14',
    emergencyContact: { name: 'Morgan Hayes', phone: '+1 (555) 112-4408' },
  },
  {
    id: 'emp_010',
    name: 'Tyler Brooks',
    email: 'tyler.brooks@cadence.co',
    initials: 'TB',
    avatarColor: '#8A7A5E',
    roleId: 'role_receptionist',
    departmentId: 'dept_front',
    locationIds: ['loc_main', 'loc_north'],
    scheduledHours: 0,
    contractHours: 40,
    status: 'inactive',
    skills: ['customer_service', 'phone_etiquette'],
    certifications: [],
    hourlyRate: 20.5,
    startDate: '2020-11-03',
    emergencyContact: { name: 'Casey Brooks', phone: '+1 (555) 213-6671' },
  },
];

// ─── In-Memory Store ──────────────────────────────────────────────────────────

let employeesStore: Employee[] = [...SEED_EMPLOYEES];

// ─── Service Functions ────────────────────────────────────────────────────────

export async function getEmployees(filter?: {
  status?: Employee['status'];
  departmentId?: string;
  locationId?: string;
}): Promise<Employee[]> {
  await mockDelay();
  let result = [...employeesStore];
  if (filter?.status) {
    result = result.filter((e) => e.status === filter.status);
  }
  if (filter?.departmentId) {
    result = result.filter((e) => e.departmentId === filter.departmentId);
  }
  if (filter?.locationId) {
    result = result.filter((e) => e.locationIds.includes(filter.locationId!));
  }
  return result;
}

export async function getEmployee(id: string): Promise<Employee | null> {
  await mockDelay(100, 300);
  return employeesStore.find((e) => e.id === id) ?? null;
}

export async function getDepartments(): Promise<Department[]> {
  await mockDelay(100, 200);
  return [...DEPARTMENTS];
}

export async function getRoles(departmentId?: string): Promise<Role[]> {
  await mockDelay(100, 200);
  if (departmentId) return ROLES.filter((r) => r.departmentId === departmentId);
  return [...ROLES];
}

export async function getLocations(): Promise<Location[]> {
  await mockDelay(100, 200);
  return [...LOCATIONS];
}

export async function updateEmployee(
  id: string,
  patch: Partial<Employee>
): Promise<Employee> {
  await mockDelay();
  const index = employeesStore.findIndex((e) => e.id === id);
  if (index === -1) throw new Error(`Employee ${id} not found`);
  employeesStore[index] = { ...employeesStore[index], ...patch };
  return employeesStore[index];
}

// ─── Lookup Helpers ───────────────────────────────────────────────────────────

export function getDepartmentById(id: string): Department | undefined {
  return DEPARTMENTS.find((d) => d.id === id);
}

export function getRoleById(id: string): Role | undefined {
  return ROLES.find((r) => r.id === id);
}

export function getLocationById(id: string): Location | undefined {
  return LOCATIONS.find((l) => l.id === id);
}

export function getEmployeeById(id: string): Employee | undefined {
  return employeesStore.find((e) => e.id === id);
}
