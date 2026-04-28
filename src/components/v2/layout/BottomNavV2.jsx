import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FiHome, FiCreditCard, FiPieChart, FiBarChart2,
  FiActivity, FiAward,
} from 'react-icons/fi';

const NAV_ITEMS = [
  { path: '/dashboard', icon: FiHome, label: 'Home' },
  { path: '/transactions', icon: FiCreditCard, label: 'Activity' },
  { path: '/dashboard-pro', icon: FiActivity, label: 'Pro' },
  { path: '/analytics', icon: FiPieChart, label: 'Analytics' },
  { path: '/achievements', icon: FiAward, label: 'Awards' },
];

export function BottomNavV2() {
  return (
    <nav className="glass fixed inset-x-0 bottom-0 z-40 border-t border-white/10 md:hidden">
      <div className="mx-auto flex max-w-lg justify-between px-4 py-2.5">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `inline-flex flex-col items-center gap-0.5 rounded-2xl px-3 py-2 text-[10px] font-semibold transition-all duration-300 ${
                isActive
                  ? 'glow border border-emerald-300/30 bg-emerald-500/20 text-emerald-200'
                  : 'text-gray-400 hover:bg-slate-700/30 hover:text-white'
              }`
            }
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
