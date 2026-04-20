import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiPlus, FiBell } from "react-icons/fi";

export const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const getTitle = () => {
    const paths = {
      "/dashboard": "Dashboard",
      "/transactions": "Transactions",
      "/transactions/new": "Add transaction",
      "/budget": "Budget",
      "/analytics": "Analytics",
    };
    return paths[location.pathname] || "Finance Tracker";
  };

  return (
    <header className="glass sticky top-0 z-30 border-b border-white/10">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-emerald-300">
            Finance cockpit
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-100 md:text-3xl">
            {getTitle()}
          </h1>
          <p className="mt-2 text-sm text-gray-400 md:max-w-xl">
            Clean insights and fast actions for every transaction, budget, and
            cashflow decision.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            onClick={() => navigate("/transactions/new")}
            className="btn-primary inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-300 active:scale-95"
          >
            <FiPlus size={18} /> Add transaction
          </button>
          <button className="surface-soft inline-flex h-12 w-12 items-center justify-center rounded-2xl text-emerald-300 transition-all duration-300 hover:-translate-y-0.5 hover:text-cyan-200">
            <FiBell size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};
