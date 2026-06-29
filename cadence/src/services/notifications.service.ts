import type { Notification } from '@/types';
import { mockDelay } from '@/lib/utils';

// ─── Seed Data ────────────────────────────────────────────────────────────────

const SEED_NOTIFICATIONS: Notification[] = [
  // Unread notifications
  {
    id: 'notif_001',
    type: 'conflict',
    title: 'Shift conflict detected',
    subtitle: 'Riley Hayes has overlapping shifts on Wed Jun 24',
    actorId: undefined,
    unread: true,
    createdAt: '2026-06-29T08:15:00Z',
    link: '/schedule?date=2026-06-24&shiftId=shift_014',
  },
  {
    id: 'notif_002',
    type: 'time_off_request',
    title: 'New time off request',
    subtitle: 'Sam Reyes requested Mon Jul 3 (Personal)',
    actorId: 'emp_008',
    unread: true,
    createdAt: '2026-06-29T07:45:00Z',
    link: '/time-off?id=tor_002',
  },
  {
    id: 'notif_003',
    type: 'sick',
    title: 'Employee called in sick',
    subtitle: 'Riley Hayes won\'t make their shift today at 10:00 AM',
    actorId: 'emp_009',
    unread: true,
    createdAt: '2026-06-29T07:31:00Z',
    link: '/attendance?date=2026-06-29',
  },
  {
    id: 'notif_004',
    type: 'late',
    title: 'Late arrival',
    subtitle: 'Sam Reyes clocked in 34 min late (08:34 vs 08:00)',
    actorId: 'emp_005',
    unread: true,
    createdAt: '2026-06-29T08:36:00Z',
    link: '/attendance?employeeId=emp_005',
  },
  {
    id: 'notif_005',
    type: 'time_off_request',
    title: 'New time off request',
    subtitle: 'Naomi West requested Jul 7–11 (Vacation)',
    actorId: 'emp_006',
    unread: true,
    createdAt: '2026-06-28T16:14:00Z',
    link: '/time-off?id=tor_001',
  },

  // Read notifications
  {
    id: 'notif_006',
    type: 'published',
    title: 'Schedule published',
    subtitle: 'Week of Jun 22 schedule was published to 10 employees',
    actorId: 'emp_004',
    unread: false,
    createdAt: '2026-06-15T10:05:00Z',
    link: '/schedule?weekStart=2026-06-22',
  },
  {
    id: 'notif_007',
    type: 'swap_request',
    title: 'Shift swap request',
    subtitle: 'Alex Mercer wants to swap shifts with Devon Lee on Jun 26',
    actorId: 'emp_001',
    unread: false,
    createdAt: '2026-06-27T14:30:00Z',
    link: '/schedule?view=swaps',
  },
  {
    id: 'notif_008',
    type: 'mention',
    title: 'You were mentioned',
    subtitle: 'Priya Shah mentioned you in a note on the Jun 24 schedule',
    actorId: 'emp_004',
    unread: false,
    createdAt: '2026-06-24T11:20:00Z',
    link: '/schedule?date=2026-06-24',
  },
];

// ─── In-Memory Store ──────────────────────────────────────────────────────────

let notificationsStore: Notification[] = [...SEED_NOTIFICATIONS];

// ─── Service Functions ────────────────────────────────────────────────────────

export async function getNotifications(): Promise<Notification[]> {
  await mockDelay();
  return [...notificationsStore].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getUnreadCount(): Promise<number> {
  await mockDelay(50, 150);
  return notificationsStore.filter((n) => n.unread).length;
}

export async function markRead(id: string): Promise<Notification> {
  await mockDelay(50, 200);
  const index = notificationsStore.findIndex((n) => n.id === id);
  if (index === -1) throw new Error(`Notification ${id} not found`);
  notificationsStore[index] = { ...notificationsStore[index], unread: false };
  return notificationsStore[index];
}

export async function markAllRead(): Promise<void> {
  await mockDelay(100, 300);
  notificationsStore = notificationsStore.map((n) => ({ ...n, unread: false }));
}

export async function dismissNotification(id: string): Promise<void> {
  await mockDelay(100, 250);
  const index = notificationsStore.findIndex((n) => n.id === id);
  if (index !== -1) {
    notificationsStore.splice(index, 1);
  }
}

export async function addNotification(
  notification: Omit<Notification, 'id' | 'createdAt'>
): Promise<Notification> {
  await mockDelay(50, 100);
  const newNotification: Notification = {
    id: `notif_${Date.now()}`,
    createdAt: new Date().toISOString(),
    ...notification,
  };
  notificationsStore.unshift(newNotification);
  return newNotification;
}
