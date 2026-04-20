import React from "react";
import { NavLink } from "react-router-dom";
import { FiHome, FiCreditCard, FiBarChart2, FiPieChart } from "react-icons/fi";

export const BottomNav = () => {
  const navItems = [
    { path: "/dashboard", icon: FiHome, label: "Dashboard" },
    { path: "/transactions", icon: FiCreditCard, label: "Transactions" },
    { path: "/analytics", icon: FiPieChart, label: "Analytics" },
    { path: "/budget", icon: FiBarChart2, label: "Budget" },
  ];

  return (
    <nav className="glass fixed inset-x-0 bottom-0 z-40 border-t border-white/10 md:hidden">
      <div className="mx-auto flex max-w-lg justify-between px-6 py-3">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `inline-flex flex-col items-center gap-1 rounded-2xl px-3 py-2 text-xs font-semibold transition-all duration-300 ${
                isActive
                  ? "glow border border-emerald-300/30 bg-emerald-500/20 text-emerald-200"
                  : "text-gray-400 hover:bg-slate-700/30 hover:text-white"
              }`
            }
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
