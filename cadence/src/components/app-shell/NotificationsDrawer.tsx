'use client';

import { useEffect, useState, useCallback } from 'react';
import { X, Bell, AlertTriangle, CalendarOff, ArrowLeftRight, Clock, Megaphone, AtSign } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useUIStore } from '@/store/ui.store';
import type { Notification, NotificationType } from '@/types';
import { getNotifications, markAllRead } from '@/services/notifications.service';

// ─── Notification icon config ─────────────────────────────────────────────────

const TYPE_CONFIG: Record<
  NotificationType,
  { icon: React.ReactNode; bg: string; color: string }
> = {
  conflict: {
    icon: <AlertTriangle size={15} />,
    bg: 'var(--conflict-bg)',
    color: 'var(--conflict-text)',
  },
  time_off_request: {
    icon: <CalendarOff size={15} />,
    bg: 'var(--pending-bg)',
    color: 'var(--pending-text)',
  },
  swap_request: {
    icon: <ArrowLeftRight size={15} />,
    bg: 'var(--open-bg)',
    color: 'var(--open-text)',
  },
  late: {
    icon: <Clock size={15} />,
    bg: 'var(--conflict-bg)',
    color: 'var(--conflict-text)',
  },
  sick: {
    icon: <Bell size={15} />,
    bg: 'var(--draft-bg)',
    color: 'var(--draft-text)',
  },
  published: {
    icon: <Megaphone size={15} />,
    bg: 'var(--filled-bg)',
    color: 'var(--filled-text)',
  },
  mention: {
    icon: <AtSign size={15} />,
    bg: 'var(--accent-soft)',
    color: 'var(--accent-text)',
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  const diffH = Math.floor(diffMs / 3_600_000);
  const diffD = Math.floor(diffMs / 86_400_000);

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffH < 24) return `${diffH}h ago`;
  if (diffD < 7) return `${diffD}d ago`;
  return date.toLocaleDateString();
}

// ─── Notification item ────────────────────────────────────────────────────────

function NotifItem({ notif }: { notif: Notification }) {
  const config = TYPE_CONFIG[notif.type];

  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        padding: '11px 16px',
        borderBottom: '1px solid var(--border)',
        background: notif.unread ? 'var(--accent-soft)' : 'transparent',
        borderLeft: notif.unread ? '3px solid var(--accent)' : '3px solid transparent',
        cursor: 'pointer',
        transition: 'background 0.12s ease',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = notif.unread
          ? 'var(--accent-soft)'
          : 'var(--surface-2)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = notif.unread
          ? 'var(--accent-soft)'
          : 'transparent';
      }}
    >
      {/* Icon tile */}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: config.bg,
          color: config.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          marginTop: 2,
        }}
      >
        {config.icon}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: notif.unread ? 600 : 500,
            color: 'var(--text)',
            marginBottom: 2,
          }}
        >
          {notif.title}
        </div>
        <div
          style={{
            fontSize: 12,
            color: 'var(--text-muted)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {notif.subtitle}
        </div>
        <div
          style={{
            fontSize: 11,
            color: 'var(--text-dim)',
            fontFamily: 'var(--font-mono, monospace)',
            marginTop: 3,
          }}
        >
          {formatTimestamp(notif.createdAt)}
        </div>
      </div>
    </div>
  );
}

// ─── NotificationsDrawer ──────────────────────────────────────────────────────

type Tab = 'all' | 'mentions' | 'approvals';

export function NotificationsDrawer() {
  const notificationsOpen = useUIStore((s) => s.notificationsOpen);
  const setNotificationsOpen = useUIStore((s) => s.setNotificationsOpen);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [loading, setLoading] = useState(false);

  const close = useCallback(() => setNotificationsOpen(false), [setNotificationsOpen]);

  // Fetch notifications when drawer opens
  useEffect(() => {
    if (!notificationsOpen) return;
    setLoading(true);
    getNotifications().then((data) => {
      setNotifications(data);
      setLoading(false);
    });
  }, [notificationsOpen]);

  // Close on Escape
  useEffect(() => {
    if (!notificationsOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [notificationsOpen, close]);

  const handleMarkAllRead = async () => {
    await markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const unreadCount = notifications.filter((n) => n.unread).length;
  const approvalCount = notifications.filter(
    (n) => n.type === 'time_off_request' || n.type === 'swap_request'
  ).length;

  const filtered = (() => {
    if (activeTab === 'mentions') return notifications.filter((n) => n.type === 'mention');
    if (activeTab === 'approvals')
      return notifications.filter(
        (n) => n.type === 'time_off_request' || n.type === 'swap_request'
      );
    return notifications;
  })();

  return (
    <AnimatePresence>
      {notificationsOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="notif-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={close}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.18)',
              zIndex: 40,
            }}
          />

          {/* Drawer */}
          <motion.aside
            key="notif-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: 400,
              background: 'var(--surface)',
              borderLeft: '1px solid var(--border)',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 41,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div
              style={{
                height: 60,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 16px',
                borderBottom: '1px solid var(--border)',
                flexShrink: 0,
              }}
            >
              <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>Inbox</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: 'var(--accent)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px 8px',
                      borderRadius: 6,
                    }}
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={close}
                  aria-label="Close notifications"
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div
              style={{
                display: 'flex',
                borderBottom: '1px solid var(--border)',
                padding: '0 16px',
                gap: 0,
                flexShrink: 0,
              }}
            >
              {(
                [
                  { id: 'all' as Tab, label: 'All', count: unreadCount },
                  { id: 'mentions' as Tab, label: 'Mentions', count: 0 },
                  { id: 'approvals' as Tab, label: 'Approvals', count: approvalCount },
                ] as { id: Tab; label: string; count: number }[]
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '10px 10px',
                    fontSize: 13,
                    fontWeight: activeTab === tab.id ? 600 : 500,
                    color: activeTab === tab.id ? 'var(--text)' : 'var(--text-muted)',
                    background: 'none',
                    border: 'none',
                    borderBottom: activeTab === tab.id ? '2px solid var(--accent)' : '2px solid transparent',
                    cursor: 'pointer',
                    marginBottom: -1,
                  }}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span
                      style={{
                        minWidth: 16,
                        height: 16,
                        borderRadius: 99,
                        background: 'var(--accent-soft)',
                        color: 'var(--accent-text)',
                        fontSize: 10,
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingInline: 4,
                      }}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* List */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {loading ? (
                <div
                  style={{
                    padding: 24,
                    textAlign: 'center',
                    color: 'var(--text-dim)',
                    fontSize: 13,
                  }}
                >
                  Loading…
                </div>
              ) : filtered.length === 0 ? (
                <div
                  style={{
                    padding: 24,
                    textAlign: 'center',
                    color: 'var(--text-dim)',
                    fontSize: 13,
                  }}
                >
                  No notifications here.
                </div>
              ) : (
                filtered.map((n) => <NotifItem key={n.id} notif={n} />)
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
