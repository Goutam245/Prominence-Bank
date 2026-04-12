import React, { useCallback } from 'react';
import { X, DollarSign, Lock, ArrowRight, Key, FileText, CreditCard, AlertCircle, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDataStore } from '@/hooks/useDataStore';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const iconMap: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  deposit: { icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  hold: { icon: Lock, color: 'text-amber-600', bg: 'bg-amber-100' },
  transfer: { icon: ArrowRight, color: 'text-blue-600', bg: 'bg-blue-100' },
  otp: { icon: Key, color: 'text-purple-600', bg: 'bg-purple-100' },
  instrument: { icon: FileText, color: 'text-blue-600', bg: 'bg-blue-100' },
  loan: { icon: CreditCard, color: 'text-orange-600', bg: 'bg-orange-100' },
  general: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100' },
};

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

interface NotificationsPanelProps {
  open: boolean;
  onClose: () => void;
}

const NotificationsPanel = React.memo(function NotificationsPanel({ open, onClose }: NotificationsPanelProps) {
  const store = useDataStore();
  const { user } = useAuth();
  const notifications = store.getNotifications().filter(n => n.userId === user?.id || user?.role === 'admin').slice(0, 30);
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = useCallback(() => {
    store.markAllNotificationsRead();
  }, [store]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-background/30 backdrop-blur-sm z-50" onClick={onClose} />
      {/* Panel */}
      <div className="fixed right-0 top-0 h-screen w-[380px] max-w-full bg-card shadow-2xl z-50 flex flex-col animate-slide-in-right border-l border-border">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-card-foreground">Notifications</h2>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-destructive text-destructive-foreground text-xs font-semibold">{unreadCount}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllRead} className="text-xs">
                <CheckCheck className="w-3.5 h-3.5 mr-1" />Mark all read
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onClose}><X className="w-5 h-5" /></Button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-premium">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <CheckCheck className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm font-medium">You're all caught up! ✓</p>
            </div>
          ) : (
            notifications.map(n => {
              const config = iconMap[n.type] || iconMap.general;
              const Icon = config.icon;
              return (
                <div
                  key={n.id}
                  className={cn(
                    'flex gap-3 p-4 border-b border-border/50 transition-colors hover:bg-muted/30 cursor-pointer',
                    !n.read && 'bg-primary/5 border-l-2 border-l-primary'
                  )}
                  onClick={() => store.markNotificationRead(n.id)}
                >
                  <div className={cn('w-9 h-9 rounded-full flex items-center justify-center shrink-0', config.bg)}>
                    <Icon className={cn('w-4 h-4', config.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-card-foreground">{n.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{n.message}</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">{timeAgo(n.timestamp)}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
});

export default NotificationsPanel;
