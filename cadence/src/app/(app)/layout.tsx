import { Sidebar } from '@/components/app-shell/Sidebar';
import { Topbar } from '@/components/app-shell/Topbar';
import { CommandPalette } from '@/components/app-shell/CommandPalette';
import { NotificationsDrawer } from '@/components/app-shell/NotificationsDrawer';
import { CreateShiftDrawer } from '@/components/app-shell/CreateShiftDrawer';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: 'var(--bg)' }}
    >
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Topbar />
        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            background: 'var(--bg)',
          }}
        >
          {children}
        </main>
      </div>

      {/* Overlays */}
      <CommandPalette />
      <NotificationsDrawer />
      <CreateShiftDrawer />
    </div>
  );
}
