import React, { useContext, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiTrendingUp, FiTrendingDown, FiMinus, FiBarChart2 } from 'react-icons/fi';
import { FinanceContext } from '../../context/FinanceContext';
import { GlassCard } from '../../components/v2/ui/GlassCard';
import { AnimatedCounter } from '../../components/v2/ui/AnimatedCounter';
import { Sparkline } from '../../components/v2/ui/Sparkline';
import { PredictiveChart } from '../../components/v2/charts/PredictiveChart';
import { CashFlowWaterfall } from '../../components/v2/charts/CashFlowWaterfall';
import { SpendingRadar } from '../../components/v2/charts/SpendingRadar';
import { AIEngine } from '../../ai/AIEngine';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export default function WeeklyReport() {
  const { transactions, monthlyBudget } = useContext(FinanceContext);

  const report = useMemo(
    () => AIEngine.generateWeeklyReport(transactions, monthlyBudget),
    [transactions, monthlyBudget]
  );

  const DirIcon = report.summary.direction === 'up' ? FiTrendingUp : report.summary.direction === 'down' ? FiTrendingDown : FiMinus;
  const dirColor = report.summary.direction === 'up' ? 'text-rose-300' : report.summary.direction === 'down' ? 'text-emerald-300' : 'text-gray-400';

  const catEntries = Object.entries(report.categories || {}).sort((a, b) => b[1] - a[1]);
  const maxCat = catEntries.length > 0 ? catEntries[0][1] : 1;

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-10 xl:py-10">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <p className="v2-label">Intelligence</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-100">Weekly Report</h1>
        <p className="mt-2 max-w-xl text-sm text-gray-400">AI-generated summary of your financial activity this week.</p>
      </motion.div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        {/* Summary Stats */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="grid gap-4 sm:grid-cols-2">
          {[
            { label: 'Weekly expenses', value: report.summary.totalExpenses, color: 'text-rose-300', prefix: '₹' },
            { label: 'Weekly income', value: report.summary.totalIncome, color: 'text-emerald-300', prefix: '₹' },
            { label: 'Net cash flow', value: report.summary.netCashFlow, color: report.summary.netCashFlow >= 0 ? 'text-emerald-300' : 'text-rose-300', prefix: '₹' },
            { label: 'Transactions', value: report.summary.transactionCount, color: 'text-cyan-300', prefix: '' },
          ].map((stat, i) => (
            <GlassCard key={stat.label} delay={i * 0.06}>
              <p className="v2-label">{stat.label}</p>
              <p className={`mt-3 text-2xl font-bold ${stat.color}`}>
                <AnimatedCounter value={stat.value} prefix={stat.prefix} formatOptions={stat.prefix ? { style: 'decimal', minimumFractionDigits: 0 } : undefined} />
              </p>
            </GlassCard>
          ))}
        </motion.div>

        {/* Week-over-Week Change */}
        <GlassCard glow>
          <div className="flex items-center gap-2">
            <FiCalendar size={16} className="text-cyan-400" />
            <p className="v2-label" style={{ margin: 0 }}>Week overview</p>
          </div>
          <div className="mt-4 flex items-center gap-4">
            <DirIcon size={32} className={dirColor} />
            <div>
              <p className="text-lg font-bold text-gray-100">
                {report.summary.changeFromLastWeek > 0 ? '+' : ''}{report.summary.changeFromLastWeek}%
              </p>
              <p className="text-xs text-gray-400">vs last week</p>
            </div>
          </div>
          <div className="mt-4 rounded-xl bg-white/5 p-4">
            <p className="text-sm leading-relaxed text-gray-300">{report.narrative}</p>
          </div>
          {report.peakDay && (
            <div className="mt-3 flex items-center justify-between rounded-xl bg-white/5 px-4 py-2.5">
              <span className="text-xs text-gray-500">Peak day</span>
              <span className="text-sm font-semibold text-gray-200">{report.peakDay.date} — ₹{Math.round(report.peakDay.amount).toLocaleString('en-IN')}</span>
            </div>
          )}
          <div className="mt-3 flex items-center justify-between rounded-xl bg-white/5 px-4 py-2.5">
            <span className="text-xs text-gray-500">Daily average</span>
            <span className="text-sm font-semibold text-gray-200">₹{report.dailyAverage.toLocaleString('en-IN')}</span>
          </div>
        </GlassCard>
      </div>

      {/* Charts */}
      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <GlassCard>
          <div className="flex items-center gap-2">
            <FiBarChart2 size={16} className="text-emerald-400" />
            <p className="v2-label" style={{ margin: 0 }}>Predictive spending</p>
          </div>
          <p className="mt-1 text-xs text-gray-500">Historical + AI forecast</p>
          <PredictiveChart className="mt-4" />
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-2">
            <FiBarChart2 size={16} className="text-cyan-400" />
            <p className="v2-label" style={{ margin: 0 }}>Cash flow</p>
          </div>
          <p className="mt-1 text-xs text-gray-500">Income vs Expenses by month</p>
          <CashFlowWaterfall className="mt-4" />
        </GlassCard>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        {/* Category Breakdown */}
        <GlassCard>
          <p className="v2-label">Weekly categories</p>
          <div className="mt-4 space-y-3">
            {catEntries.length === 0 ? (
              <p className="py-4 text-center text-sm text-gray-500">No expenses this week</p>
            ) : (
              catEntries.map(([cat, amount], i) => (
                <div key={cat}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm text-gray-300">{cat}</span>
                    <span className="text-sm text-gray-400">₹{amount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(amount / maxCat) * 100}%` }}
                      transition={{ duration: 0.8, delay: i * 0.08 }}
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>

        {/* Spending Radar */}
        <GlassCard>
          <p className="v2-label">Spending distribution</p>
          <p className="mt-1 text-xs text-gray-500">Category radar (all time)</p>
          <SpendingRadar className="mt-2" />
        </GlassCard>
      </div>
    </div>
  );
}
