import React, { useContext, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiHeart, FiTrendingUp, FiTarget, FiPieChart, FiActivity, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { FinanceContext } from '../../context/FinanceContext';
import { GlassCard } from '../../components/v2/ui/GlassCard';
import { ProgressRing } from '../../components/v2/ui/ProgressRing';
import { AnimatedCounter } from '../../components/v2/ui/AnimatedCounter';

function computeDetailed(transactions, monthlyBudget) {
  const now = new Date();
  const cm = now.getMonth(), cy = now.getFullYear();

  const monthlyExp = transactions.filter(t => {
    const d = new Date(t.date);
    return t.type === 'expense' && d.getMonth() === cm && d.getFullYear() === cy;
  }).reduce((s, t) => s + t.amount, 0);

  const totalInc = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExp = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const cats = new Set(transactions.filter(t => t.type === 'expense').map(t => t.category));

  const budgetAdherence = monthlyBudget > 0 ? Math.max(0, Math.min(100, 100 - (monthlyExp / monthlyBudget) * 100)) : 50;
  const savingsRate = totalInc > 0 ? Math.max(0, Math.min(100, ((totalInc - totalExp) / totalInc) * 100)) : 0;
  const diversity = Math.min((cats.size / 6) * 100, 100);
  const trend = totalInc > totalExp ? 75 : totalExp > 0 ? 35 : 50;
  const consistency = Math.min(transactions.length * 2, 100);

  const overall = Math.round(budgetAdherence * 0.25 + savingsRate * 0.25 + diversity * 0.15 + trend * 0.15 + consistency * 0.2);

  return {
    overall: Math.max(0, Math.min(100, overall)),
    factors: [
      { key: 'budgetAdherence', label: 'Budget Adherence', value: Math.round(budgetAdherence), icon: FiTarget, desc: 'How well you stick to your monthly budget', color: '#10b981' },
      { key: 'savingsRate', label: 'Savings Rate', value: Math.round(savingsRate), icon: FiTrendingUp, desc: 'Percentage of income saved', color: '#22d3ee' },
      { key: 'diversity', label: 'Spending Diversity', value: Math.round(diversity), icon: FiPieChart, desc: 'How diversified your spending is', color: '#8b5cf6' },
      { key: 'trend', label: 'Trend Direction', value: Math.round(trend), icon: FiActivity, desc: 'Whether your finances are improving', color: '#f59e0b' },
      { key: 'consistency', label: 'Tracking Consistency', value: Math.round(consistency), icon: FiHeart, desc: 'How consistently you log transactions', color: '#f43f5e' },
    ],
  };
}

function getGrade(score) {
  if (score >= 90) return { grade: 'A+', desc: 'Exceptional', color: '#10b981' };
  if (score >= 80) return { grade: 'A', desc: 'Excellent', color: '#10b981' };
  if (score >= 70) return { grade: 'B+', desc: 'Very Good', color: '#22d3ee' };
  if (score >= 60) return { grade: 'B', desc: 'Good', color: '#3b82f6' };
  if (score >= 50) return { grade: 'C', desc: 'Average', color: '#f59e0b' };
  if (score >= 40) return { grade: 'D', desc: 'Below Average', color: '#fb923c' };
  return { grade: 'F', desc: 'Needs Improvement', color: '#ef4444' };
}

function getTips(factors) {
  const tips = [];
  const f = {};
  factors.forEach(fa => { f[fa.key] = fa.value; });
  if (f.budgetAdherence < 60) tips.push({ icon: FiArrowDown, text: 'Reduce discretionary spending to improve budget adherence', priority: 'high' });
  if (f.savingsRate < 30) tips.push({ icon: FiTrendingUp, text: 'Aim for at least 20-30% savings rate for financial stability', priority: 'high' });
  if (f.diversity < 40) tips.push({ icon: FiPieChart, text: 'Track spending across all categories for better visibility', priority: 'medium' });
  if (f.consistency < 50) tips.push({ icon: FiHeart, text: 'Log transactions daily for more accurate insights', priority: 'medium' });
  if (tips.length === 0) tips.push({ icon: FiArrowUp, text: 'You\'re doing great! Keep maintaining these healthy habits', priority: 'low' });
  return tips;
}

export default function FinancialHealthScore() {
  const { transactions, monthlyBudget } = useContext(FinanceContext);
  const { overall, factors } = useMemo(() => computeDetailed(transactions, monthlyBudget), [transactions, monthlyBudget]);
  const grade = getGrade(overall);
  const tips = useMemo(() => getTips(factors), [factors]);

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-10 xl:py-10">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <p className="v2-label">Intelligence</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-100">Financial Health Score</h1>
        <p className="mt-2 max-w-xl text-sm text-gray-400">A composite score measuring your overall financial wellness.</p>
      </motion.div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_1.2fr]">
        {/* Score Display */}
        <GlassCard className="flex flex-col items-center py-10" glow>
          <ProgressRing value={overall} size={200} strokeWidth={12}>
            <span className="text-5xl font-bold text-gray-100">{overall}</span>
            <span className="mt-1 text-xs uppercase tracking-widest text-gray-400">/ 100</span>
          </ProgressRing>
          <div className="mt-6 flex items-center gap-3">
            <span className="text-4xl font-black" style={{ color: grade.color }}>{grade.grade}</span>
            <div>
              <p className="text-lg font-semibold text-gray-100">{grade.desc}</p>
              <p className="text-xs text-gray-500">Financial health grade</p>
            </div>
          </div>
        </GlassCard>

        {/* Factor Breakdown */}
        <div className="space-y-4">
          {factors.map((factor, i) => {
            const Icon = factor.icon;
            return (
              <GlassCard key={factor.key} delay={i * 0.08} hover={false} className="!p-4">
                <div className="flex items-center gap-4">
                  <ProgressRing value={factor.value} size={52} strokeWidth={4} color={factor.color}>
                    <Icon size={16} style={{ color: factor.color }} />
                  </ProgressRing>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-200">{factor.label}</p>
                      <span className="value-mono text-sm font-bold" style={{ color: factor.color }}>
                        {factor.value}%
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-gray-500">{factor.desc}</p>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${factor.value}%` }}
                        transition={{ duration: 1, delay: 0.3 + i * 0.1 }}
                        className="h-full rounded-full"
                        style={{ background: factor.color }}
                      />
                    </div>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>

      {/* Tips */}
      <div className="mt-8">
        <GlassCard>
          <p className="v2-label">Recommendations</p>
          <h2 className="mt-2 text-lg font-semibold text-gray-100">How to improve</h2>
          <div className="mt-4 space-y-3">
            {tips.map((tip, i) => {
              const Icon = tip.icon;
              const colors = { high: 'border-rose-500/20 bg-rose-500/8 text-rose-300', medium: 'border-amber-500/20 bg-amber-500/8 text-amber-300', low: 'border-emerald-500/20 bg-emerald-500/8 text-emerald-300' };
              return (
                <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.1 }}
                  className={`flex items-start gap-3 rounded-2xl border p-4 ${colors[tip.priority]}`}>
                  <Icon size={16} className="mt-0.5 shrink-0" />
                  <p className="text-sm">{tip.text}</p>
                </motion.div>
              );
            })}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
