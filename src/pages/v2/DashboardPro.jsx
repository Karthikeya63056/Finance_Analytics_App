import React, { useContext, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiActivity, FiTrendingUp, FiTrendingDown, FiTarget, FiShield, FiZap, FiAward, FiCalendar, FiAlertTriangle, FiUser } from 'react-icons/fi';
import { FinanceContext } from '../../context/FinanceContext';
import { useGamification } from '../../context/GamificationContext';
import { formatCurrency } from '../../utils/currencyFormatter';
import { GlassCard } from '../../components/v2/ui/GlassCard';
import { AnimatedCounter } from '../../components/v2/ui/AnimatedCounter';
import { ProgressRing } from '../../components/v2/ui/ProgressRing';
import { Sparkline } from '../../components/v2/ui/Sparkline';
import { AIInsightList } from '../../components/v2/AIInsightCard';
import { AIEngine } from '../../ai/AIEngine';

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

function computeHealthScore(transactions, monthlyBudget) {
  if (transactions.length === 0) return { score: 50, factors: {} };
  const now = new Date();
  const cm = now.getMonth(), cy = now.getFullYear();

  const monthlyExp = transactions.filter(t => {
    const d = new Date(t.date);
    return t.type === 'expense' && d.getMonth() === cm && d.getFullYear() === cy;
  }).reduce((s, t) => s + t.amount, 0);

  const totalInc = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExp = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const budgetAdherence = monthlyBudget > 0 ? Math.max(0, 100 - (monthlyExp / monthlyBudget) * 100) : 50;
  const savingsRate = totalInc > 0 ? ((totalInc - totalExp) / totalInc) * 100 : 0;
  const categories = new Set(transactions.filter(t => t.type === 'expense').map(t => t.category));
  const diversity = Math.min((categories.size / 6) * 100, 100);
  const trend = totalExp > 0 && totalInc > totalExp ? 70 : 40;

  const score = Math.round(
    budgetAdherence * 0.3 + Math.max(0, Math.min(savingsRate, 100)) * 0.3 +
    diversity * 0.15 + trend * 0.15 + Math.min(transactions.length, 50) * 0.2
  );

  return {
    score: Math.max(0, Math.min(100, score)),
    factors: {
      budgetAdherence: Math.round(budgetAdherence),
      savingsRate: Math.round(Math.max(0, savingsRate)),
      diversity: Math.round(diversity),
      trend: Math.round(trend),
    },
  };
}

function getMoneyMood(score) {
  if (score >= 80) return { emoji: '🤩', label: 'Thriving', color: '#10b981' };
  if (score >= 60) return { emoji: '😊', label: 'Healthy', color: '#22d3ee' };
  if (score >= 40) return { emoji: '🤔', label: 'Watchful', color: '#f59e0b' };
  return { emoji: '😰', label: 'Stressed', color: '#ef4444' };
}

export default function DashboardPro() {
  const { transactions, monthlyBudget } = useContext(FinanceContext);
  const { level, xp, streak, unlockedBadges, badges } = useGamification();

  const analytics = useMemo(() => {
    const totalInc = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExp = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    const catBreakdown = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      catBreakdown[t.category] = (catBreakdown[t.category] || 0) + t.amount;
    });

    // Monthly data for sparklines
    const now = new Date();
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const exp = transactions.filter(t => {
        const d = new Date(t.date);
        return t.type === 'expense' && d.getMonth() === m.getMonth() && d.getFullYear() === m.getFullYear();
      }).reduce((s, t) => s + t.amount, 0);
      monthlyData.push(exp);
    }

    // Day-of-week heatmap data
    const dayData = [0, 0, 0, 0, 0, 0, 0];
    transactions.filter(t => t.type === 'expense').forEach(t => {
      dayData[new Date(t.date).getDay()] += t.amount;
    });

    return { totalInc, totalExp, catBreakdown, monthlyData, dayData, net: totalInc - totalExp };
  }, [transactions]);

  const { score, factors } = useMemo(
    () => computeHealthScore(transactions, monthlyBudget),
    [transactions, monthlyBudget]
  );

  const mood = getMoneyMood(score);
  const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const topCategories = Object.entries(analytics.catBreakdown).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxCatAmount = topCategories.length > 0 ? topCategories[0][1] : 1;

  // Real AI analysis
  const aiAnalysis = useMemo(
    () => AIEngine.runAnalysis(transactions, monthlyBudget),
    [transactions, monthlyBudget]
  );

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-10 xl:py-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="v2-label">Intelligence dashboard</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-100">Dashboard Pro</h1>
            <p className="mt-2 text-sm text-gray-400">AI-powered insights, predictions, and financial intelligence.</p>
          </div>
          <div className="v2-badge-accent flex items-center gap-2">
            <FiActivity size={12} /> Real-time analysis
          </div>
        </div>
      </motion.div>

      <motion.div variants={stagger} initial="hidden" animate="visible" className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Health Score + Money Mood Row */}
          <motion.div variants={fadeUp} className="grid gap-6 md:grid-cols-2">
            {/* Health Score */}
            <GlassCard className="flex flex-col items-center py-8">
              <p className="v2-label mb-6">Financial health</p>
              <ProgressRing value={score} size={160} strokeWidth={10}>
                <span className="text-4xl font-bold text-gray-100">{score}</span>
                <span className="text-[10px] uppercase tracking-widest text-gray-400">Score</span>
              </ProgressRing>
              <div className="mt-6 grid w-full grid-cols-2 gap-3 px-2">
                {Object.entries(factors).map(([k, v]) => (
                  <div key={k} className="rounded-xl bg-white/5 px-3 py-2 text-center">
                    <p className="text-[10px] capitalize text-gray-500">{k.replace(/([A-Z])/g, ' $1')}</p>
                    <p className="mt-0.5 text-sm font-semibold text-gray-200">{v}%</p>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Money Mood + Streak */}
            <div className="space-y-6">
              <GlassCard delay={0.1}>
                <p className="v2-label">Money mood</p>
                <div className="mt-4 flex items-center gap-4">
                  <span className="text-5xl">{mood.emoji}</span>
                  <div>
                    <p className="text-xl font-bold" style={{ color: mood.color }}>{mood.label}</p>
                    <p className="mt-1 text-xs text-gray-400">Based on your health score</p>
                  </div>
                </div>
              </GlassCard>
              <GlassCard delay={0.15}>
                <p className="v2-label">Current streak</p>
                <div className="mt-4 flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/10">
                    <span className="text-2xl">🔥</span>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-100">{streak}</p>
                    <p className="text-xs text-gray-400">Days under budget</p>
                  </div>
                </div>
              </GlassCard>
            </div>
          </motion.div>

          {/* Stats Row */}
          <motion.div variants={fadeUp} className="grid gap-4 sm:grid-cols-3">
            {[
              { label: 'Total income', value: analytics.totalInc, color: 'text-emerald-300', icon: FiTrendingUp, spark: analytics.monthlyData },
              { label: 'Total expenses', value: analytics.totalExp, color: 'text-rose-300', icon: FiTrendingDown, spark: analytics.monthlyData },
              { label: 'Net balance', value: analytics.net, color: analytics.net >= 0 ? 'text-gray-100' : 'text-rose-300', icon: FiActivity, spark: analytics.monthlyData },
            ].map((stat, i) => (
              <GlassCard key={stat.label} delay={i * 0.06} className="relative overflow-hidden">
                <div className="absolute right-3 top-3 opacity-30">
                  <Sparkline data={stat.spark.length > 1 ? stat.spark : [0, 0]} width={64} height={24} color={stat.color === 'text-emerald-300' ? '#10b981' : stat.color === 'text-rose-300' ? '#f43f5e' : '#94a3b8'} />
                </div>
                <p className="v2-label">{stat.label}</p>
                <p className={`mt-3 text-2xl font-bold ${stat.color}`}>
                  <AnimatedCounter value={stat.value} prefix="₹" formatOptions={{ style: 'decimal', minimumFractionDigits: 0 }} />
                </p>
              </GlassCard>
            ))}
          </motion.div>

          {/* Category Heatmap */}
          <motion.div variants={fadeUp}>
            <GlassCard>
              <p className="v2-label">Spending by day</p>
              <h2 className="mt-2 text-lg font-semibold text-gray-100">Weekly pattern</h2>
              <div className="mt-6 grid grid-cols-7 gap-2">
                {analytics.dayData.map((amount, idx) => {
                  const maxDay = Math.max(...analytics.dayData) || 1;
                  const intensity = amount / maxDay;
                  return (
                    <div key={idx} className="flex flex-col items-center gap-2">
                      <div
                        className="h-16 w-full rounded-xl transition-all duration-500"
                        style={{
                          background: `rgba(16, 185, 129, ${0.08 + intensity * 0.6})`,
                          border: `1px solid rgba(16, 185, 129, ${0.1 + intensity * 0.3})`,
                        }}
                      />
                      <span className="text-[10px] text-gray-500">{DAY_LABELS[idx]}</span>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          </motion.div>

          {/* Top Categories Bar Chart */}
          <motion.div variants={fadeUp}>
            <GlassCard>
              <p className="v2-label">Category breakdown</p>
              <h2 className="mt-2 text-lg font-semibold text-gray-100">Top spending areas</h2>
              <div className="mt-6 space-y-4">
                {topCategories.length === 0 ? (
                  <p className="py-4 text-center text-sm text-gray-500">Add expense transactions to see category analysis</p>
                ) : (
                  topCategories.map(([cat, amount], i) => (
                    <div key={cat}>
                      <div className="mb-1.5 flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-300">{cat}</span>
                        <span className="value-mono text-sm text-gray-400">{formatCurrency(amount)}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(amount / maxCatAmount) * 100}%` }}
                          transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400"
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* AI Insights — powered by real AIEngine */}
          <motion.div variants={fadeUp}>
            <GlassCard glow>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FiZap size={16} className="text-emerald-400" />
                  <p className="v2-label" style={{ margin: 0 }}>AI insights</p>
                </div>
                {aiAnalysis.anomalyCount > 0 && (
                  <span className="v2-badge-warning flex items-center gap-1">
                    <FiAlertTriangle size={10} />
                    {aiAnalysis.anomalyCount} anomalies
                  </span>
                )}
              </div>
              <div className="mt-4">
                <AIInsightList insights={aiAnalysis.insights} maxItems={4} />
              </div>
            </GlassCard>
          </motion.div>

          {/* Financial Personality */}
          <motion.div variants={fadeUp}>
            <GlassCard delay={0.08}>
              <div className="flex items-center gap-2">
                <FiUser size={16} className="text-violet-400" />
                <p className="v2-label" style={{ margin: 0 }}>Financial personality</p>
              </div>
              <div className="mt-4 flex items-center gap-4">
                <span className="text-4xl">{aiAnalysis.personality?.emoji || '🌱'}</span>
                <div>
                  <p className="text-lg font-bold text-gray-100">{aiAnalysis.personality?.type || 'New Explorer'}</p>
                  <p className="mt-1 text-xs text-gray-400">{aiAnalysis.personality?.description || 'Add more data to discover your type'}</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Level & Achievements */}
          <motion.div variants={fadeUp}>
            <GlassCard delay={0.1}>
              <div className="flex items-center gap-2">
                <FiAward size={16} className="text-amber-400" />
                <p className="v2-label" style={{ margin: 0 }}>Progress</p>
              </div>
              <div className="mt-4 flex items-center gap-4">
                <ProgressRing value={level.progressToNext} size={72} strokeWidth={6}>
                  <span className="text-lg font-bold text-gray-100">{level.level}</span>
                </ProgressRing>
                <div>
                  <p className="text-lg font-semibold text-gray-100">{level.name}</p>
                  <p className="text-xs text-gray-400">{xp} XP total</p>
                  <p className="mt-1 text-[11px] text-gray-500">Next: {level.nextLevel?.name}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {badges.slice(0, 6).map((badge) => {
                  const unlocked = unlockedBadges.includes(badge.id);
                  return (
                    <div
                      key={badge.id}
                      className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg transition-all ${
                        unlocked
                          ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/10 shadow-sm'
                          : 'bg-white/5 opacity-30 grayscale'
                      }`}
                      title={`${badge.name}: ${badge.desc}`}
                    >
                      {badge.icon}
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          </motion.div>

          {/* Spending Forecast Preview — AI powered */}
          <motion.div variants={fadeUp}>
            <GlassCard delay={0.15}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="v2-label">AI Forecast</p>
                  <h3 className="mt-2 text-lg font-semibold text-gray-100">Spending trend</h3>
                </div>
                <span className="v2-badge-accent">{aiAnalysis.forecast?.direction || 'stable'}</span>
              </div>
              <div className="mt-6 flex items-end justify-center">
                <Sparkline
                  data={analytics.monthlyData.length > 1 ? analytics.monthlyData : [0, 10, 20, 15, 25, 18]}
                  width={280}
                  height={80}
                />
              </div>
              {aiAnalysis.forecast?.predicted > 0 && (
                <div className="mt-4 rounded-xl bg-white/5 p-3 text-center">
                  <p className="text-xs text-gray-500">Projected next month</p>
                  <p className="mt-1 text-lg font-bold text-emerald-300">₹{aiAnalysis.forecast.predicted.toLocaleString('en-IN')}</p>
                  <p className="mt-0.5 text-[10px] text-gray-600">Confidence: {aiAnalysis.forecast.confidence}</p>
                </div>
              )}
              <p className="mt-3 text-center text-xs text-gray-500">
                {analytics.monthlyData.length > 2
                  ? 'Weighted moving average based on 6-month history'
                  : 'Add transactions across months to see your trend'}
              </p>
            </GlassCard>
          </motion.div>

          {/* Money Mood (AI-computed) */}
          <motion.div variants={fadeUp}>
            <GlassCard delay={0.18}>
              <div className="flex items-center gap-2">
                <span className="text-lg">{aiAnalysis.moneyMood?.emoji || '😌'}</span>
                <p className="v2-label" style={{ margin: 0 }}>Money mood</p>
              </div>
              <p className="mt-2 text-sm font-semibold text-gray-200">{aiAnalysis.moneyMood?.mood || 'Balanced'}</p>
              <p className="mt-1 text-xs text-gray-500">{aiAnalysis.moneyMood?.reason || 'Based on spending patterns'}</p>
            </GlassCard>
          </motion.div>

          {/* Quick Calendar View */}
          <motion.div variants={fadeUp}>
            <GlassCard delay={0.2}>
              <div className="flex items-center gap-2">
                <FiCalendar size={16} className="text-cyan-400" />
                <p className="v2-label" style={{ margin: 0 }}>This month</p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white/5 p-3 text-center">
                  <p className="text-2xl font-bold text-gray-100">
                    {transactions.filter(t => {
                      const d = new Date(t.date), now = new Date();
                      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                    }).length}
                  </p>
                  <p className="mt-1 text-[10px] text-gray-500">Transactions</p>
                </div>
                <div className="rounded-xl bg-white/5 p-3 text-center">
                  <p className="text-2xl font-bold text-emerald-300">
                    {Object.keys(analytics.catBreakdown).length}
                  </p>
                  <p className="mt-1 text-[10px] text-gray-500">Categories</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
