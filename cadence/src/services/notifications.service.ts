import type { Notification } from '@/types';
import { apiFetch } from '@/lib/api-url';

export async function getNotifications(
  username?: string,
  locationId?: string
): Promise<Notification[]> {
  const params = new URLSearchParams();
  if (username) params.set('username', username);
  if (locationId) params.set('locationId', locationId);
  const qs = params.toString();
  try {
    return await apiFetch<Notification[]>(`/api/notifications${qs ? `?${qs}` : ''}`);
  } catch {
    return [];
  }
}

export async function markNotificationRead(id: string): Promise<void> {
  await apiFetch(`/api/notifications/${encodeURIComponent(id)}`, { method: 'PATCH' });
}

export async function markAllRead(): Promise<void> {
  await apiFetch('/api/notifications', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ markAll: true }),
  });
}

export async function markNotificationsRead(ids: string[]): Promise<void> {
  await apiFetch('/api/notifications', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });
}
