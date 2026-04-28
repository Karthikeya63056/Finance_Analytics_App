import { useEffect, useRef, useContext } from 'react';
import { FinanceContext } from '../context/FinanceContext';
import { useGamification } from '../context/GamificationContext';
import { useAutomation } from '../context/AutomationContext';
import { badgeEngine } from '../services/v2/BadgeEngine';
import { automationEngine } from '../services/v2/AutomationEngine';
import { NotificationManager } from '../services/v2/NotificationManager';

/**
 * useV2Orchestrator — Background hook that ties all V2 systems together.
 *
 * Runs on mount and whenever transactions change:
 * 1. Evaluates badge unlock conditions
 * 2. Runs automation rules
 * 3. Updates streaks
 *
 * Mount this once in AppV2.
 */
export function useV2Orchestrator() {
  const { transactions, monthlyBudget } = useContext(FinanceContext);
  const gamification = useGamification();
  const automation = useAutomation();
  const lastCountRef = useRef(0);
  const initRef = useRef(false);

  // Initialize notification manager once
  useEffect(() => {
    if (!initRef.current) {
      NotificationManager.init();
      initRef.current = true;
    }
  }, []);

  // Run evaluations when transactions change
  useEffect(() => {
    if (transactions.length === lastCountRef.current) return;
    lastCountRef.current = transactions.length;

    const state = { transactions, monthlyBudget };

    // Evaluate badges
    badgeEngine.evaluate(state, gamification);

    // Evaluate automation rules
    if (automation.rules.length > 0) {
      automationEngine.evaluate(
        automation.rules,
        state,
        automation.addAlert,
        automation.logExecution
      );
    }

    // Update streak based on current month budget status
    if (monthlyBudget > 0) {
      const now = new Date();
      const monthExp = transactions
        .filter((t) => {
          const d = new Date(t.date);
          return t.type === 'expense' && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        })
        .reduce((s, t) => s + t.amount, 0);

      const daysElapsed = now.getDate();
      const dailyBudget = monthlyBudget / new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const isUnderBudget = monthExp <= dailyBudget * daysElapsed;

      gamification.updateStreak(isUnderBudget);
    }

    // Award XP for adding transactions
    if (transactions.length > 0) {
      gamification.earnXP(10, 'Transaction logged');
    }
  }, [transactions.length]); // eslint-disable-line react-hooks/exhaustive-deps
}
