import type { Employee, Department, Role, Location } from '@/types';
import { apiFetch } from '@/lib/api-url';

// ─── Static reference data (no Snowflake table) ────────────────────────────

export const DEPARTMENTS: Department[] = [
  { id: 'dept_ops', name: 'Operations', color: '#7C6AC4' },
  { id: 'dept_sales', name: 'Sales', color: '#5A9B6E' },
  { id: 'dept_front', name: 'Front Desk', color: '#C76054' },
  { id: 'dept_mgmt', name: 'Management', color: '#3D4D8A' },
];

export const ROLES: Role[] = [
  { id: 'role_shift_lead', name: 'Shift Lead', departmentId: 'dept_ops', defaultBreak: 30, requiredSkills: ['leadership', 'inventory'] },
  { id: 'role_ops_associate', name: 'Operations Associate', departmentId: 'dept_ops', defaultBreak: 30, requiredSkills: ['forklift', 'safety_certified'] },
  { id: 'role_sales_rep', name: 'Sales Representative', departmentId: 'dept_sales', defaultBreak: 30, requiredSkills: ['crm', 'customer_service'] },
  { id: 'role_senior_sales', name: 'Senior Sales Rep', departmentId: 'dept_sales', defaultBreak: 30, requiredSkills: ['crm', 'customer_service', 'key_account'] },
  { id: 'role_receptionist', name: 'Receptionist', departmentId: 'dept_front', defaultBreak: 30, requiredSkills: ['customer_service', 'phone_etiquette'] },
  { id: 'role_concierge', name: 'Concierge', departmentId: 'dept_front', defaultBreak: 30, requiredSkills: ['customer_service', 'multilingual'] },
  { id: 'role_manager', name: 'Manager', departmentId: 'dept_mgmt', defaultBreak: 30, requiredSkills: ['leadership', 'scheduling'] },
];

// ─── In-memory caches (populated by async calls, read by sync helpers) ─────

let employeesCache: Employee[] = [];
let locationsCache: Location[] = [];

// ─── Service Functions — Employees ──────────────────────────────────────────

export async function getEmployees(filter?: {
  status?: Employee['status'];
  departmentId?: string;
  locationId?: string;
}): Promise<Employee[]> {
  const params = new URLSearchParams();
  if (filter?.status) params.set('status', filter.status);
  if (filter?.departmentId) params.set('departmentId', filter.departmentId);
  if (filter?.locationId) params.set('locationId', filter.locationId);
  const qs = params.toString();
  const employees = await apiFetch<Employee[]>(`/api/employees${qs ? `?${qs}` : ''}`);
  employeesCache = employees;
  return employees;
}

export async function getEmployee(id: string): Promise<Employee | null> {
  const employees = await apiFetch<Employee[]>(`/api/employees`);
  employeesCache = employees;
  return employees.find((e) => e.id === id) ?? null;
}

export async function createEmployee(input: Partial<Employee>): Promise<Employee> {
  const employee = await apiFetch<Employee>('/api/employees', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  employeesCache = [...employeesCache, employee];
  return employee;
}

export async function updateEmployee(id: string, patch: Partial<Employee>): Promise<Employee> {
  await apiFetch(`/api/employees`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...patch, id, _action: 'update' }),
  });
  employeesCache = employeesCache.map((e) => (e.id === id ? { ...e, ...patch } : e));
  return employeesCache.find((e) => e.id === id) ?? ({ id, ...patch } as Employee);
}

export async function deleteEmployee(id: string): Promise<void> {
  await updateEmployee(id, { status: 'inactive', employmentStatus: 'Terminated' });
}

export async function getEmployeesByLocation(locationId: string): Promise<Employee[]> {
  return apiFetch<Employee[]>(`/api/employees?locationId=${encodeURIComponent(locationId)}`);
}

// ─── Service Functions — Departments & Roles ────────────────────────────────

export async function getDepartments(): Promise<Department[]> {
  return [...DEPARTMENTS];
}

export async function getRoles(departmentId?: string): Promise<Role[]> {
  if (departmentId) return ROLES.filter((r) => r.departmentId === departmentId);
  return [...ROLES];
}

// ─── Service Functions — Locations ──────────────────────────────────────────

export async function getLocations(): Promise<Location[]> {
  try {
    const locations = await apiFetch<Location[]>('/api/locations');
    locationsCache = locations;
    return locations;
  } catch {
    // Fall back to static data if DIM_LOCATION query fails
    return locationsCache.length > 0 ? locationsCache : STATIC_LOCATIONS;
  }
}

export async function createLocation(input: Omit<Location, 'id'>): Promise<Location> {
  const loc = await apiFetch<Location>('/api/locations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  locationsCache = [...locationsCache, loc];
  return loc;
}

export async function updateLocation(id: string, patch: Partial<Location>): Promise<Location> {
  await apiFetch(`/api/locations`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...patch }),
  });
  locationsCache = locationsCache.map((l) => (l.id === id || l.locationId === id ? { ...l, ...patch } : l));
  return locationsCache.find((l) => l.id === id || l.locationId === id) ?? ({ id, ...patch } as Location);
}

// ─── Synchronous Lookup Helpers (use caches populated by async calls) ───────

export function getDepartmentById(id: string): Department | undefined {
  return DEPARTMENTS.find((d) => d.id === id);
}

export function getRoleById(id: string): Role | undefined {
  return ROLES.find((r) => r.id === id);
}

export function getLocationById(id: string): Location | undefined {
  return (
    locationsCache.find((l) => l.id === id || l.locationId === id) ??
    STATIC_LOCATIONS.find((l) => l.id === id || l.locationId === id)
  );
}

export function getEmployeeById(id: string): Employee | undefined {
  return employeesCache.find((e) => e.id === id);
}

// ─── Static location fallback (used if Snowflake DIM_LOCATION is unreachable) ─

const STATIC_LOCATIONS: Location[] = [
  {
    id: 'loc_main', name: 'Main Office',
    address: '123 Business Ave, Suite 400, San Francisco, CA 94102',
    coordinates: { lat: 37.7749, lng: -122.4194 }, geofenceRadius: 150,
    locationKey: 1, locationId: 'LOC001', locationCode: 'SF-MAIN', locationType: 'HQ',
    addressLine1: '123 Business Ave, Suite 400', city: 'San Francisco', state: 'CA',
    postalCode: '94102', country: 'US', region: 'West',
    latitude: 37.7749, longitude: -122.4194, timezone: 'America/Los_Angeles',
    isFranchise: false, hasDriveThru: false, deliveryEnabled: false,
    openingDate: '2019-01-15', closingDate: null, locationStatus: 'Active',
    managerName: 'Priya Shah', locationPhone: '+1 (415) 555-0100',
    locationEmail: 'main@nexora.co', customerNumber: 'CUST-0001',
  },
  {
    id: 'loc_north', name: 'North Branch',
    address: '456 Commerce St, San Francisco, CA 94108',
    coordinates: { lat: 37.7956, lng: -122.4071 }, geofenceRadius: 100,
    locationKey: 2, locationId: 'LOC002', locationCode: 'SF-NORTH', locationType: 'Retail',
    addressLine1: '456 Commerce St', city: 'San Francisco', state: 'CA',
    postalCode: '94108', country: 'US', region: 'West',
    latitude: 37.7956, longitude: -122.4071, timezone: 'America/Los_Angeles',
    isFranchise: false, hasDriveThru: true, deliveryEnabled: true,
    openingDate: '2020-06-01', closingDate: null, locationStatus: 'Active',
    managerName: 'Jordan Park', locationPhone: '+1 (415) 555-0200',
    locationEmail: 'north@nexora.co', customerNumber: 'CUST-0002',
  },
];
