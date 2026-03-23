import { useEffect, useState } from 'react';
import { Users, UserPlus, MessageCircle, X } from 'lucide-react';
import type { AppNotification } from '../data/mockUsers';

const iconForType = {
  group_created: Users,
  group_added: UserPlus,
  message: MessageCircle,
};

interface ToastItem {
  notification: AppNotification;
  visible: boolean;
}

let pushToast: (n: AppNotification) => void = () => {};

export function showToast(n: AppNotification) {
  pushToast(n);
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    pushToast = (n: AppNotification) => {
      setToasts(prev => [...prev, { notification: n, visible: true }]);
    };
    return () => { pushToast = () => {}; };
  }, []);

  useEffect(() => {
    if (toasts.length === 0) return;
    const last = toasts[toasts.length - 1];
    if (!last.visible) return;

    const timer = setTimeout(() => {
      setToasts(prev =>
        prev.map(t => t.notification.id === last.notification.id ? { ...t, visible: false } : t)
      );
      // Remove from DOM after animation
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.notification.id !== last.notification.id));
      }, 300);
    }, 3500);
    return () => clearTimeout(timer);
  }, [toasts]);

  const dismiss = (id: string) => {
    setToasts(prev => prev.map(t => t.notification.id === id ? { ...t, visible: false } : t));
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.notification.id !== id));
    }, 300);
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] pointer-events-none flex flex-col items-center pt-[max(0.75rem,env(safe-area-inset-top))] gap-2 px-4">
      {toasts.map(({ notification: n, visible }) => {
        const Icon = iconForType[n.type] || MessageCircle;
        return (
          <div
            key={n.id}
            className={`pointer-events-auto w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-200 p-3 flex items-start gap-3 transition-all duration-300 ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
            }`}
          >
            <div className="p-1.5 rounded-full bg-golf-100">
              <Icon size={16} className="text-golf-700" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">{n.title}</p>
              <p className="text-xs text-gray-500 mt-0.5 truncate">{n.body}</p>
            </div>
            <button onClick={() => dismiss(n.id)} className="p-1 hover:bg-gray-100 rounded-lg">
              <X size={14} className="text-gray-400" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
