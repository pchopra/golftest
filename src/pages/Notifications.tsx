import { useAuth } from '../context/AuthContext';
import { Bell, Users, MessageCircle, UserPlus, CheckCheck, Trash2 } from 'lucide-react';

const iconForType = {
  group_created: Users,
  group_added: UserPlus,
  message: MessageCircle,
};

export default function Notifications() {
  const { notifications, markNotificationRead, markAllNotificationsRead, clearNotifications } = useAuth();

  const unread = notifications.filter(n => !n.read).length;

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 7) return `${diffDay}d ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="pb-28">
      {/* Header */}
      <div className="bg-gradient-to-br from-golf-800 to-golf-600 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-6 rounded-b-3xl">
        <div className="flex items-center justify-between mt-2">
          <div>
            <h1 className="text-2xl font-bold text-white">Notifications</h1>
            <p className="text-golf-200 text-sm mt-1">
              {unread > 0 ? `${unread} unread` : 'All caught up'}
            </p>
          </div>
          <div className="flex gap-2">
            {unread > 0 && (
              <button
                onClick={markAllNotificationsRead}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                title="Mark all read"
              >
                <CheckCheck size={18} className="text-white" />
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={clearNotifications}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                title="Clear all"
              >
                <Trash2 size={18} className="text-white" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notification list */}
      <div className="px-4 mt-4 space-y-2">
        {notifications.length === 0 ? (
          <div className="text-center py-16">
            <Bell size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">No notifications yet</p>
            <p className="text-gray-400 text-sm mt-1">
              You'll be notified when someone adds you to a group or sends a message.
            </p>
          </div>
        ) : (
          notifications.map(n => {
            const Icon = iconForType[n.type] || Bell;
            return (
              <button
                key={n.id}
                onClick={() => markNotificationRead(n.id)}
                className={`w-full text-left flex items-start gap-3 p-3 rounded-xl border transition-colors ${
                  n.read
                    ? 'bg-white border-gray-100'
                    : 'bg-golf-50 border-golf-200'
                }`}
              >
                <div className={`mt-0.5 p-2 rounded-full ${n.read ? 'bg-gray-100' : 'bg-golf-100'}`}>
                  <Icon size={16} className={n.read ? 'text-gray-500' : 'text-golf-700'} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-sm font-semibold truncate ${n.read ? 'text-gray-700' : 'text-gray-900'}`}>
                      {n.title}
                    </span>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap">{formatTime(n.timestamp)}</span>
                  </div>
                  <p className={`text-sm mt-0.5 ${n.read ? 'text-gray-400' : 'text-gray-600'}`}>
                    {n.body}
                  </p>
                </div>
                {!n.read && (
                  <span className="mt-2 w-2 h-2 rounded-full bg-golf-600 flex-shrink-0" />
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
