import React from 'react';
import { motion } from 'framer-motion';
import { FiAlertTriangle, FiCheckCircle, FiInfo, FiArrowRight } from 'react-icons/fi';

const SEVERITY_CONFIG = {
  danger: { icon: FiAlertTriangle, border: 'border-rose-500/20', bg: 'bg-rose-500/8', text: 'text-rose-300', badge: 'bg-rose-500/15 text-rose-400' },
  warning: { icon: FiAlertTriangle, border: 'border-amber-500/20', bg: 'bg-amber-500/8', text: 'text-amber-300', badge: 'bg-amber-500/15 text-amber-400' },
  success: { icon: FiCheckCircle, border: 'border-emerald-500/20', bg: 'bg-emerald-500/8', text: 'text-emerald-300', badge: 'bg-emerald-500/15 text-emerald-400' },
  info: { icon: FiInfo, border: 'border-cyan-500/20', bg: 'bg-cyan-500/8', text: 'text-cyan-300', badge: 'bg-cyan-500/15 text-cyan-400' },
};

/**
 * AIInsightCard — Displays a single AI-generated insight with severity,
 * reasoning, and optional action button.
 */
export function AIInsightCard({ insight, index = 0, onAction }) {
  const config = SEVERITY_CONFIG[insight.severity] || SEVERITY_CONFIG.info;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08, duration: 0.35 }}
      className={`rounded-2xl border p-4 ${config.border} ${config.bg}`}
    >
      <div className="flex items-start gap-3">
        <Icon size={16} className={`mt-0.5 shrink-0 ${config.text}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className={`text-sm font-semibold ${config.text}`}>{insight.title}</p>
            <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${config.badge}`}>
              {insight.type?.replace(/_/g, ' ') || insight.severity}
            </span>
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-gray-300">{insight.message}</p>
          {insight.action && (
            <button
              onClick={() => onAction?.(insight)}
              className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 transition hover:text-emerald-300"
            >
              <FiArrowRight size={12} />
              {insight.action}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/**
 * AIInsightList — Renders a list of AI insights
 */
export function AIInsightList({ insights, maxItems = 5, onAction }) {
  const displayed = insights.slice(0, maxItems);

  if (displayed.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center">
        <p className="text-sm text-gray-500">No insights available yet</p>
        <p className="mt-1 text-xs text-gray-600">Add more transactions to unlock AI analysis</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {displayed.map((insight, i) => (
        <AIInsightCard
          key={insight.title + i}
          insight={insight}
          index={i}
          onAction={onAction}
        />
      ))}
      {insights.length > maxItems && (
        <p className="text-center text-xs text-gray-500">
          +{insights.length - maxItems} more insights
        </p>
      )}
    </div>
  );
}
