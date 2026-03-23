import { useEffect, useState } from 'react';
import { Users, UserPlus, MessageCircle, X } from 'lucide-react';
import type { AppNotification } from '../data/mockUsers';

const iconForType = {
  group_created: Users,
  group_added: UserPlus,
  message: MessageCircle,
};

// Synthesize a short two-tone chime using the Web Audio API.
// No external audio files required.
function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const now = ctx.currentTime;

    // Two-note chime: C6 then E6
    const notes = [
      { freq: 1047, start: 0, dur: 0.12 },
      { freq: 1319, start: 0.13, dur: 0.15 },
    ];

    notes.forEach(({ freq, start, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.18, now + start);
      gain.gain.exponentialRampToValueAtTime(0.001, now + start + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + start);
      osc.stop(now + start + dur + 0.01);
    });

    // Close context after sound finishes
    setTimeout(() => ctx.close(), 500);
  } catch {
    // Audio not available — silent fallback
  }
}

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
      playNotificationSound();
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
