/**
 * AutomationEngine — Rule execution engine
 *
 * Evaluates automation rules against transactions and fires alerts/actions.
 * Integrates with EventBus for cross-module notification.
 */

import { EventBus, Events } from '../../core/EventBus';

export class AutomationEngine {
  /**
   * Evaluate all enabled rules against current financial state
   * @param {Array} rules - Automation rules from AutomationContext
   * @param {Object} state - { transactions, monthlyBudget }
   * @param {Function} onAlert - Callback to add alert to AutomationContext
   * @param {Function} onLog - Callback to log execution
   * @returns {Array} Triggered alerts
   */
  evaluate(rules, state, onAlert, onLog) {
    const { transactions = [], monthlyBudget = 0 } = state;
    const triggered = [];
    const now = new Date();
    const cm = now.getMonth(), cy = now.getFullYear();

    for (const rule of rules) {
      if (!rule.enabled) continue;

      let result = null;

      switch (rule.type) {
        case 'budget_threshold': {
          const monthExp = transactions.filter((t) => {
            const d = new Date(t.date);
            return t.type === 'expense' && d.getMonth() === cm && d.getFullYear() === cy;
          }).reduce((s, t) => s + t.amount, 0);

          const pct = monthlyBudget > 0 ? (monthExp / monthlyBudget) * 100 : 0;
          if (pct >= (rule.condition?.threshold || 80)) {
            result = {
              message: `${rule.message || 'Budget threshold reached'} (${Math.round(pct)}% used — ₹${monthExp.toLocaleString('en-IN')} of ₹${monthlyBudget.toLocaleString('en-IN')})`,
              severity: pct >= 100 ? 'danger' : 'warning',
              data: { spent: monthExp, budget: monthlyBudget, percentage: Math.round(pct) },
            };
          }
          break;
        }

        case 'amount_threshold': {
          const threshold = rule.condition?.amount || 5000;
          const recent = transactions.filter((t) => {
            const d = new Date(t.date);
            return t.type === 'expense' && (now - d) < 86400000;
          });
          const large = recent.filter((t) => t.amount >= threshold);
          if (large.length > 0) {
            result = {
              message: `${rule.message || 'Large transaction detected'}: ₹${large[0].amount.toLocaleString('en-IN')} on "${large[0].title}"`,
              severity: 'warning',
              data: { transaction: large[0] },
            };
          }
          break;
        }

        case 'recurring_detection': {
          const byTitle = {};
          transactions.filter((t) => t.type === 'expense').forEach((t) => {
            const key = t.title.toLowerCase().trim();
            byTitle[key] = (byTitle[key] || 0) + 1;
          });
          const recurring = Object.entries(byTitle).filter(
            ([_, count]) => count >= (rule.condition?.minOccurrences || 2)
          );
          if (recurring.length > 0) {
            result = {
              message: `${rule.message || 'Recurring patterns found'}: ${recurring.length} recurring expenses detected`,
              severity: 'info',
              data: { patterns: recurring.slice(0, 5) },
            };
          }
          break;
        }

        case 'savings_goal': {
          const totalInc = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
          const totalExp = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
          const saved = totalInc - totalExp;
          const target = rule.condition?.target || 10000;
          const pct = target > 0 ? (saved / target) * 100 : 0;
          if (pct >= 100) {
            result = {
              message: `🎉 Savings goal reached! You've saved ₹${saved.toLocaleString('en-IN')} (target: ₹${target.toLocaleString('en-IN')})`,
              severity: 'success',
              data: { saved, target, percentage: Math.round(pct) },
            };
          } else if (pct >= 75) {
            result = {
              message: `${Math.round(pct)}% toward your ₹${target.toLocaleString('en-IN')} savings goal (₹${saved.toLocaleString('en-IN')} saved)`,
              severity: 'info',
              data: { saved, target, percentage: Math.round(pct) },
            };
          }
          break;
        }
      }

      if (result) {
        const alert = onAlert?.({ ...result, ruleId: rule.id, ruleName: rule.name });
        onLog?.({ ruleId: rule.id, ruleName: rule.name, result: 'triggered', ...result });
        EventBus.publish(Events.AUTOMATION_RULE_TRIGGERED, { rule, alert: result });
        triggered.push({ rule, alert: result });
      }
    }

    return triggered;
  }
}

export const automationEngine = new AutomationEngine();
