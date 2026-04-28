import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FiHome, FiCreditCard, FiBarChart2, FiPieChart, FiSettings,
  FiActivity, FiHeart, FiZap, FiAward, FiCommand, FiFileText, FiDatabase,
} from 'react-icons/fi';
import { ThemeSwitcher } from '../ui/ThemeSwitcher';
import { EventBus, Events } from '../../../core/EventBus';
import { useGamification } from '../../../context/GamificationContext';

const V1_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: FiHome },
  { path: '/transactions', label: 'Transactions', icon: FiCreditCard },
  { path: '/analytics', label: 'Analytics', icon: FiPieChart },
  { path: '/budget', label: 'Budget', icon: FiBarChart2 },
  { path: '/settings', label: 'Settings', icon: FiSettings },
];

const V2_ITEMS = [
  { path: '/dashboard-pro', label: 'Dashboard Pro', icon: FiActivity },
  { path: '/health-score', label: 'Health Score', icon: FiHeart },
  { path: '/weekly-report', label: 'Weekly Report', icon: FiFileText },
  { path: '/automation', label: 'Automation', icon: FiZap },
  { path: '/achievements', label: 'Achievements', icon: FiAward },
  { path: '/data-manager', label: 'Data Manager', icon: FiDatabase },
];

function NavItem({ item }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        `group relative flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-300 ${
          isActive
            ? 'glow border border-emerald-300/30 bg-gradient-to-r from-emerald-500/22 to-cyan-400/14 text-emerald-100'
            : 'border border-transparent text-gray-400 hover:border-white/10 hover:bg-slate-700/30 hover:text-white'
        }`
      }
    >
      <Icon className="text-lg" />
      <span className="text-sm font-medium">{item.label}</span>
    </NavLink>
  );
}

export function SidebarV2() {
  const { level, xp } = useGamification();

  return (
    <aside className="glass hidden h-screen flex-col p-6 md:sticky md:top-0 md:mr-6 md:flex md:w-72">
      {/* Brand */}
      <div className="mb-8">
        <span className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-300">
          Finance
        </span>
        <h2 className="mt-3 bg-gradient-to-r from-emerald-200 to-cyan-300 bg-clip-text text-3xl font-bold text-transparent">
          Neon Ledger
        </h2>
        <p className="mt-3 text-sm leading-6 text-gray-400">
          Modern money management with focus, clarity, and pace.
        </p>
      </div>

      {/* V1 Nav */}
      <nav className="flex-1 space-y-1.5">
        {V1_ITEMS.map((item) => (
          <NavItem key={item.path} item={item} />
        ))}

        {/* V2 Section Divider */}
        <div className="flex items-center gap-2 px-2 pb-1 pt-5">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-400/70">
            V2 Pro
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-emerald-500/30 to-transparent" />
        </div>

        {V2_ITEMS.map((item) => (
          <NavItem key={item.path} item={item} />
        ))}
      </nav>

      {/* Command Palette trigger */}
      <button
        onClick={() => EventBus.publish(Events.COMMAND_PALETTE_OPEN)}
        className="surface-soft mb-4 flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-sm text-gray-400 transition-all hover:border-white/10 hover:text-gray-200"
      >
        <FiCommand size={14} />
        <span className="flex-1 text-left text-xs">Search...</span>
        <kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px]">
          ⌘K
        </kbd>
      </button>

      {/* Level card */}
      <div className="surface-card rounded-[28px] p-5">
        <p className="mb-4 text-xs uppercase tracking-[0.28em] text-gray-400">
          Your level
        </p>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-gray-400">Level {level.level}</p>
            <p className="mt-1 text-lg font-bold text-emerald-300">{level.name}</p>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-300/30 bg-emerald-500/12 text-lg font-bold text-emerald-200">
            {level.level}
          </div>
        </div>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-800/70">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-700"
            style={{ width: `${level.progressToNext}%` }}
          />
        </div>
        <p className="mt-2 text-[11px] text-gray-500">
          {xp} XP · Next: {level.nextLevel?.name}
        </p>
      </div>

      {/* Theme */}
      <div className="mt-4">
        <ThemeSwitcher showAccents />
      </div>
    </aside>
  );
}
