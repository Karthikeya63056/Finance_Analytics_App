/**
 * BadgeEngine — Automatic badge evaluation and unlocking
 *
 * Runs evaluation against current financial state and unlocks
 * badges that meet their criteria.
 */

import { EventBus, Events } from '../../core/EventBus';

export class BadgeEngine {
  /**
   * Evaluate all badge conditions and unlock earned badges
   * @param {Object} state - { transactions, monthlyBudget }
   * @param {Object} gamification - From useGamification()
   */
  evaluate(state, gamification) {
    const { transactions = [], monthlyBudget = 0 } = state;
    const { isBadgeUnlocked, unlockBadge, streak } = gamification;

    const expenses = transactions.filter((t) => t.type === 'expense');
    const income = transactions.filter((t) => t.type === 'income');
    const totalExp = expenses.reduce((s, t) => s + t.amount, 0);
    const totalInc = income.reduce((s, t) => s + t.amount, 0);
    const categories = new Set(expenses.map((t) => t.category));
    const now = new Date();

    const checks = [
      {
        id: 'first_transaction',
        condition: transactions.length >= 1,
      },
      {
        id: 'budget_setter',
        condition: monthlyBudget > 0,
      },
      {
        id: 'tracker_10',
        condition: transactions.length >= 10,
      },
      {
        id: 'tracker_50',
        condition: transactions.length >= 50,
      },
      {
        id: 'tracker_100',
        condition: transactions.length >= 100,
      },
      {
        id: 'saver_streak_3',
        condition: streak >= 3,
      },
      {
        id: 'saver_streak_7',
        condition: streak >= 7,
      },
      {
        id: 'saver_streak_30',
        condition: streak >= 30,
      },
      {
        id: 'diversified',
        condition: categories.size >= 5,
      },
      {
        id: 'early_bird',
        condition: transactions.some((t) => {
          const d = new Date(t.date + 'T08:00:00');
          return d.getHours() < 9;
        }),
      },
      {
        id: 'health_80',
        condition: (() => {
          if (transactions.length < 5) return false;
          const cm = now.getMonth(), cy = now.getFullYear();
          const monthExp = expenses.filter((t) => {
            const d = new Date(t.date);
            return d.getMonth() === cm && d.getFullYear() === cy;
          }).reduce((s, t) => s + t.amount, 0);

          const ba = monthlyBudget > 0 ? Math.max(0, 100 - (monthExp / monthlyBudget) * 100) : 50;
          const sr = totalInc > 0 ? Math.max(0, ((totalInc - totalExp) / totalInc) * 100) : 0;
          const div = Math.min((categories.size / 6) * 100, 100);
          const score = Math.round(ba * 0.3 + Math.min(sr, 100) * 0.3 + div * 0.2 + Math.min(transactions.length, 50) * 0.2);
          return score >= 80;
        })(),
      },
    ];

    let newUnlocks = 0;
    for (const check of checks) {
      if (check.condition && !isBadgeUnlocked(check.id)) {
        unlockBadge(check.id);
        newUnlocks++;
      }
    }

    return newUnlocks;
  }
}

export const badgeEngine = new BadgeEngine();
