import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NotificationManager } from '../../services/v2/NotificationManager';

const TYPE_STYLES = {
  achievement: { bg: 'from-amber-500/20 to-orange-500/10', border: 'border-amber-500/30', accent: 'text-amber-300' },
  level_up: { bg: 'from-violet-500/20 to-purple-500/10', border: 'border-violet-500/30', accent: 'text-violet-300' },
  xp: { bg: 'from-emerald-500/20 to-cyan-500/10', border: 'border-emerald-500/30', accent: 'text-emerald-300' },
  anomaly: { bg: 'from-rose-500/20 to-red-500/10', border: 'border-rose-500/30', accent: 'text-rose-300' },
  automation: { bg: 'from-blue-500/20 to-indigo-500/10', border: 'border-blue-500/30', accent: 'text-blue-300' },
  budget: { bg: 'from-amber-500/20 to-yellow-500/10', border: 'border-amber-500/30', accent: 'text-amber-300' },
  info: { bg: 'from-cyan-500/20 to-blue-500/10', border: 'border-cyan-500/30', accent: 'text-cyan-300' },
};

/**
 * NotificationToast — Floating notification display
 * Subscribes to NotificationManager and renders animated toasts.
 */
export function NotificationToast() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const unsub = NotificationManager.subscribe((notification) => {
      setToasts((prev) => [...prev, notification].slice(-4));

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== notification.id));
      }, notification.duration || 4000);
    });

    return unsub;
  }, []);

  return (
    <div className="fixed left-1/2 top-4 z-[80] flex -translate-x-1/2 flex-col gap-2" style={{ pointerEvents: 'none' }}>
      <AnimatePresence>
        {toasts.map((toast) => {
          const style = TYPE_STYLES[toast.type] || TYPE_STYLES.info;
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className={`pointer-events-auto w-[380px] rounded-2xl border bg-gradient-to-r backdrop-blur-xl ${style.bg} ${style.border}`}
              style={{ pointerEvents: 'auto' }}
            >
              <div className="flex items-start gap-3 px-5 py-4">
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold ${style.accent}`}>{toast.title}</p>
                  <p className="mt-1 text-xs text-gray-300 leading-relaxed">{toast.message}</p>
                </div>
                <button
                  onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                  className="mt-0.5 text-gray-500 hover:text-gray-300 text-xs"
                >
                  ✕
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
