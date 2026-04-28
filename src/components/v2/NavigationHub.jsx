import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiActivity, FiHeart, FiFileText, FiZap, FiAward, FiDatabase,
  FiArrowRight, FiCpu, FiTrendingUp, FiShield, FiStar, FiBox,
} from 'react-icons/fi';

const V2_ROUTES = [
  {
    path: '/dashboard-pro',
    label: 'Dashboard Pro',
    description: 'AI-powered insights, financial personality, anomaly detection & spending forecast',
    icon: FiActivity,
    gradient: 'from-emerald-500/20 to-cyan-500/10',
    border: 'border-emerald-500/25',
    iconColor: 'text-emerald-400',
    tag: 'AI',
  },
  {
    path: '/health-score',
    label: 'Health Score',
    description: 'Composite financial wellness score with 5-factor breakdown and improvement tips',
    icon: FiHeart,
    gradient: 'from-rose-500/20 to-pink-500/10',
    border: 'border-rose-500/25',
    iconColor: 'text-rose-400',
    tag: 'Score',
  },
  {
    path: '/weekly-report',
    label: 'Weekly Report',
    description: 'AI-generated weekly summary with predictive charts, cash flow & spending radar',
    icon: FiFileText,
    gradient: 'from-violet-500/20 to-purple-500/10',
    border: 'border-violet-500/25',
    iconColor: 'text-violet-400',
    tag: 'Reports',
  },
  {
    path: '/automation',
    label: 'Smart Automation',
    description: 'Set budget alerts, large transaction warnings & savings goal tracking rules',
    icon: FiZap,
    gradient: 'from-amber-500/20 to-orange-500/10',
    border: 'border-amber-500/25',
    iconColor: 'text-amber-400',
    tag: 'Rules',
  },
  {
    path: '/achievements',
    label: 'Achievements',
    description: 'Track XP, unlock badges, level up & maintain your under-budget streak',
    icon: FiAward,
    gradient: 'from-cyan-500/20 to-blue-500/10',
    border: 'border-cyan-500/25',
    iconColor: 'text-cyan-400',
    tag: 'Gamify',
  },
  {
    path: '/data-manager',
    label: 'Data Manager',
    description: 'Generate demo data for AI testing, export/import your financial database',
    icon: FiDatabase,
    gradient: 'from-slate-500/20 to-gray-500/10',
    border: 'border-slate-500/25',
    iconColor: 'text-slate-400',
    tag: 'Data',
  },
];

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export function NavigationHub() {
  const navigate = useNavigate();

  return (
    <section className="mt-10 mb-4 px-1">
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/25 to-cyan-500/15">
              <FiCpu size={14} className="text-emerald-300" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-gray-100">V2 Intelligence Suite</h2>
          </div>
          <p className="mt-2 max-w-md text-sm text-gray-500">
            AI-powered modules built on top of your financial data. Click any card to explore.
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/8 px-3 py-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">6 modules active</span>
        </div>
      </motion.div>

      {/* Navigation cards grid */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      >
        {V2_ROUTES.map((route) => {
          const Icon = route.icon;
          return (
            <motion.button
              key={route.path}
              variants={cardVariant}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(route.path)}
              className={`group relative flex flex-col items-start overflow-hidden rounded-2xl border bg-gradient-to-br p-5 text-left transition-all duration-300 hover:shadow-lg hover:shadow-black/20 ${route.gradient} ${route.border}`}
            >
              {/* Tag */}
              <span className="absolute right-4 top-4 rounded-md bg-white/5 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.15em] text-gray-500 group-hover:bg-white/10 group-hover:text-gray-300 transition-colors">
                {route.tag}
              </span>

              {/* Icon */}
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 ${route.iconColor} transition-transform duration-300 group-hover:scale-110`}>
                <Icon size={20} />
              </div>

              {/* Label */}
              <h3 className="mt-4 text-base font-bold text-gray-100 group-hover:text-white transition-colors">
                {route.label}
              </h3>

              {/* Description */}
              <p className="mt-1.5 text-xs leading-relaxed text-gray-500 group-hover:text-gray-400 transition-colors">
                {route.description}
              </p>

              {/* Arrow indicator */}
              <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-gray-600 transition-all duration-300 group-hover:gap-2.5 group-hover:text-emerald-400">
                Open
                <FiArrowRight size={12} className="transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </motion.button>
          );
        })}
      </motion.div>
    </section>
  );
}
