import React from "react";
import { NavLink } from "react-router-dom";
import {
  FiHome,
  FiCreditCard,
  FiBarChart2,
  FiPieChart,
  FiSettings,
} from "react-icons/fi";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: FiHome },
  { path: "/transactions", label: "Transactions", icon: FiCreditCard },
  { path: "/analytics", label: "Analytics", icon: FiPieChart },
  { path: "/budget", label: "Budget", icon: FiBarChart2 },
  { path: "/settings", label: "Settings", icon: FiSettings },
];

export const Sidebar = () => {
  return (
    <aside className="glass hidden h-screen flex-col p-6 md:sticky md:top-0 md:mr-6 md:flex md:w-72">
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

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-300 ${
                  isActive
                    ? "glow border border-emerald-300/30 bg-gradient-to-r from-emerald-500/22 to-cyan-400/14 text-emerald-100"
                    : "border border-transparent text-gray-400 hover:border-white/10 hover:bg-slate-700/30 hover:text-white"
                }`
              }
            >
              <Icon className="text-lg" />
              <span className="font-medium text-sm">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="surface-card mt-8 rounded-[28px] p-5">
        <p className="mb-4 text-xs uppercase tracking-[0.28em] text-gray-400">
          Cash position
        </p>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-gray-400">Monthly savings rate</p>
            <p className="mt-2 value-mono text-3xl font-semibold text-emerald-300">32%</p>
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-emerald-300/30 bg-emerald-500/12 text-xl font-bold text-emerald-200">
            $
          </div>
        </div>
      </div>
    </aside>
  );
};
