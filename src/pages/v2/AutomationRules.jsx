import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiZap, FiPlus, FiToggleLeft, FiToggleRight, FiTrash2, FiAlertCircle, FiDollarSign, FiRepeat, FiTrendingUp } from 'react-icons/fi';
import { useAutomation } from '../../context/AutomationContext';
import { GlassCard } from '../../components/v2/ui/GlassCard';

const RULE_TEMPLATES = [
  { name: 'Overspending Alert', description: 'Alert when spending exceeds 80% of budget', icon: FiAlertCircle, color: '#f43f5e',
    rule: { type: 'budget_threshold', condition: { threshold: 80 }, action: 'alert', message: 'Budget usage exceeded 80%!' } },
  { name: 'Large Transaction', description: 'Alert on transactions over ₹5,000', icon: FiDollarSign, color: '#f59e0b',
    rule: { type: 'amount_threshold', condition: { amount: 5000 }, action: 'alert', message: 'Large transaction detected!' } },
  { name: 'Recurring Detection', description: 'Detect recurring monthly expenses', icon: FiRepeat, color: '#8b5cf6',
    rule: { type: 'recurring_detection', condition: { minOccurrences: 2 }, action: 'tag', message: 'Recurring expense pattern detected' } },
  { name: 'Savings Goal', description: 'Track progress toward savings target', icon: FiTrendingUp, color: '#10b981',
    rule: { type: 'savings_goal', condition: { target: 10000 }, action: 'track', message: 'Savings goal progress updated' } },
];

export default function AutomationRules() {
  const { rules, alerts, unreadCount, addRule, toggleRule, deleteRule, markAlertRead, clearAlerts } = useAutomation();
  const [showCreate, setShowCreate] = useState(false);

  const handleAddTemplate = (template) => {
    addRule({ name: template.name, ...template.rule });
    setShowCreate(false);
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-10 xl:py-10">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="v2-label">Automation</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-100">Smart Rules</h1>
            <p className="mt-2 max-w-xl text-sm text-gray-400">Automate your financial monitoring with intelligent rules and alerts.</p>
          </div>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="v2-btn v2-btn-primary gap-2"
          >
            <FiPlus size={16} /> New rule
          </button>
        </div>
      </motion.div>

      {/* Template Picker */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 overflow-hidden"
          >
            <GlassCard>
              <p className="v2-label">Choose a template</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {RULE_TEMPLATES.map((template) => {
                  const Icon = template.icon;
                  return (
                    <button
                      key={template.name}
                      onClick={() => handleAddTemplate(template)}
                      className="flex items-start gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-left transition-all hover:border-emerald-300/20 hover:bg-emerald-500/5"
                    >
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                        style={{ background: `${template.color}20` }}
                      >
                        <Icon size={18} style={{ color: template.color }} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-200">{template.name}</p>
                        <p className="mt-0.5 text-xs text-gray-500">{template.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        {/* Active Rules */}
        <div>
          <GlassCard>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FiZap size={16} className="text-emerald-400" />
                <p className="v2-label" style={{ margin: 0 }}>Active rules</p>
              </div>
              <span className="v2-badge-accent">{rules.filter(r => r.enabled).length} active</span>
            </div>

            <div className="mt-6 space-y-3">
              {rules.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center">
                  <FiZap size={32} className="mx-auto text-gray-600" />
                  <p className="mt-3 text-sm text-gray-400">No automation rules yet</p>
                  <p className="mt-1 text-xs text-gray-500">Click "New rule" to get started with a template</p>
                </div>
              ) : (
                rules.map((rule, i) => (
                  <motion.div
                    key={rule.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`flex items-center gap-4 rounded-2xl border p-4 transition-all ${
                      rule.enabled
                        ? 'border-emerald-500/15 bg-emerald-500/5'
                        : 'border-white/5 bg-white/[0.02] opacity-50'
                    }`}
                  >
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-200">{rule.name}</p>
                      <p className="mt-0.5 text-xs text-gray-500">{rule.message}</p>
                    </div>
                    <button
                      onClick={() => toggleRule(rule.id)}
                      className="text-gray-400 transition hover:text-emerald-300"
                      title={rule.enabled ? 'Disable' : 'Enable'}
                    >
                      {rule.enabled ? <FiToggleRight size={22} className="text-emerald-400" /> : <FiToggleLeft size={22} />}
                    </button>
                    <button
                      onClick={() => deleteRule(rule.id)}
                      className="text-gray-500 transition hover:text-rose-400"
                      title="Delete rule"
                    >
                      <FiTrash2 size={15} />
                    </button>
                  </motion.div>
                ))
              )}
            </div>
          </GlassCard>
        </div>

        {/* Alert Feed */}
        <div>
          <GlassCard>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FiAlertCircle size={16} className="text-amber-400" />
                <p className="v2-label" style={{ margin: 0 }}>Alert feed</p>
                {unreadCount > 0 && (
                  <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </div>
              {alerts.length > 0 && (
                <button onClick={clearAlerts} className="text-xs text-gray-500 transition hover:text-gray-300">
                  Clear all
                </button>
              )}
            </div>

            <div className="mt-6 space-y-2">
              {alerts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center">
                  <p className="text-sm text-gray-400">No alerts yet</p>
                  <p className="mt-1 text-xs text-gray-500">Alerts will appear here when rules are triggered</p>
                </div>
              ) : (
                alerts.slice(0, 10).map((alert) => (
                  <button
                    key={alert.id}
                    onClick={() => markAlertRead(alert.id)}
                    className={`w-full rounded-xl p-3 text-left transition-all ${
                      alert.read ? 'bg-white/[0.02]' : 'border border-amber-500/15 bg-amber-500/5'
                    }`}
                  >
                    <p className="text-sm text-gray-200">{alert.message || 'Alert triggered'}</p>
                    <p className="mt-1 text-[10px] text-gray-500">
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </button>
                ))
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
