import React, { createContext, useState, useCallback, useEffect, useContext } from 'react';
import { EventBus, Events } from '../core/EventBus';

const STORAGE_KEY = 'v2_gamification';
const GamificationContext = createContext(null);

const BADGE_DEFS = [
  { id: 'first_transaction', name: 'First Step', icon: '🚀', desc: 'Add your first transaction', xp: 50 },
  { id: 'budget_setter', name: 'Budget Boss', icon: '🎯', desc: 'Set a monthly budget', xp: 50 },
  { id: 'tracker_10', name: 'Tracker', icon: '📊', desc: 'Log 10 transactions', xp: 100 },
  { id: 'tracker_50', name: 'Ledger Keeper', icon: '📒', desc: 'Log 50 transactions', xp: 200 },
  { id: 'tracker_100', name: 'Finance Pro', icon: '🏆', desc: 'Log 100 transactions', xp: 500 },
  { id: 'saver_streak_3', name: 'Saver', icon: '💰', desc: '3-day under-budget streak', xp: 150 },
  { id: 'saver_streak_7', name: 'Super Saver', icon: '🌟', desc: '7-day under-budget streak', xp: 300 },
  { id: 'saver_streak_30', name: 'Legendary Saver', icon: '👑', desc: '30-day under-budget streak', xp: 1000 },
  { id: 'analyzer', name: 'Analyst', icon: '🔍', desc: 'Use AI insights 5 times', xp: 150 },
  { id: 'diversified', name: 'Diversified', icon: '🎨', desc: 'Spend in 5+ categories', xp: 100 },
  { id: 'health_80', name: 'Healthy Finances', icon: '💚', desc: 'Reach 80+ health score', xp: 250 },
  { id: 'early_bird', name: 'Early Bird', icon: '🐦', desc: 'Log a transaction before 9 AM', xp: 75 },
];

const LEVELS = [
  { level: 1, name: 'Novice', minXP: 0 },
  { level: 2, name: 'Apprentice', minXP: 100 },
  { level: 3, name: 'Budgeter', minXP: 300 },
  { level: 4, name: 'Analyst', minXP: 600 },
  { level: 5, name: 'Strategist', minXP: 1000 },
  { level: 6, name: 'Expert', minXP: 1500 },
  { level: 7, name: 'Master', minXP: 2500 },
  { level: 8, name: 'Grandmaster', minXP: 4000 },
  { level: 9, name: 'Legend', minXP: 6000 },
  { level: 10, name: 'Finance Titan', minXP: 10000 },
];

function loadState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch (_) {}
  return { xp: 0, unlockedBadges: [], streak: 0, lastStreakDate: null, goals: [] };
}

function getLevel(xp) {
  let current = LEVELS[0];
  for (const l of LEVELS) {
    if (xp >= l.minXP) current = l;
  }
  const nextLevel = LEVELS.find((l) => l.minXP > xp) || current;
  const progressToNext = nextLevel === current
    ? 100
    : ((xp - current.minXP) / (nextLevel.minXP - current.minXP)) * 100;
  return { ...current, nextLevel, progressToNext: Math.min(progressToNext, 100) };
}

export function GamificationProvider({ children }) {
  const [state, setState] = useState(loadState);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) {}
  }, [state]);

  const earnXP = useCallback((amount, reason = '') => {
    setState((s) => {
      const newXP = s.xp + amount;
      const oldLevel = getLevel(s.xp);
      const newLevel = getLevel(newXP);
      if (newLevel.level > oldLevel.level) {
        EventBus.publish(Events.LEVEL_UP, { level: newLevel, previousLevel: oldLevel });
      }
      EventBus.publish(Events.XP_EARNED, { amount, total: newXP, reason });
      return { ...s, xp: newXP };
    });
  }, []);

  const unlockBadge = useCallback((badgeId) => {
    setState((s) => {
      if (s.unlockedBadges.includes(badgeId)) return s;
      const badge = BADGE_DEFS.find((b) => b.id === badgeId);
      if (!badge) return s;
      EventBus.publish(Events.ACHIEVEMENT_UNLOCKED, { badge });
      const newXP = s.xp + badge.xp;
      return { ...s, unlockedBadges: [...s.unlockedBadges, badgeId], xp: newXP };
    });
  }, []);

  const updateStreak = useCallback((isUnderBudget) => {
    setState((s) => {
      const today = new Date().toISOString().split('T')[0];
      if (s.lastStreakDate === today) return s;
      const newStreak = isUnderBudget ? s.streak + 1 : 0;
      EventBus.publish(Events.STREAK_UPDATED, { streak: newStreak });
      return { ...s, streak: newStreak, lastStreakDate: today };
    });
  }, []);

  const addGoal = useCallback((goal) => {
    setState((s) => ({
      ...s,
      goals: [...s.goals, { id: crypto.randomUUID(), createdAt: Date.now(), current: 0, ...goal }],
    }));
  }, []);

  const updateGoalProgress = useCallback((goalId, current) => {
    setState((s) => ({
      ...s,
      goals: s.goals.map((g) => (g.id === goalId ? { ...g, current } : g)),
    }));
  }, []);

  const deleteGoal = useCallback((goalId) => {
    setState((s) => ({ ...s, goals: s.goals.filter((g) => g.id !== goalId) }));
  }, []);

  const level = getLevel(state.xp);

  const value = {
    xp: state.xp,
    level,
    badges: BADGE_DEFS,
    unlockedBadges: state.unlockedBadges,
    streak: state.streak,
    goals: state.goals,
    levels: LEVELS,
    earnXP,
    unlockBadge,
    updateStreak,
    addGoal,
    updateGoalProgress,
    deleteGoal,
    isBadgeUnlocked: (id) => state.unlockedBadges.includes(id),
  };

  return (
    <GamificationContext.Provider value={value}>
      {children}
    </GamificationContext.Provider>
  );
}

export function useGamification() {
  const ctx = useContext(GamificationContext);
  if (!ctx) throw new Error('useGamification must be used within GamificationProvider');
  return ctx;
}

export { GamificationContext };
