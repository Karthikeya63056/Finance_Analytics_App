import React from "react";
import { formatCurrency } from "../../utils/currencyFormatter";

export const BudgetCard = ({ label, amount, color, icon }) => {
  return (
    <div className={`glass rounded-2xl border border-white/20 p-6 transition hover:-translate-y-1 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-300 text-sm font-semibold mb-2">{label}</p>
          <p className="text-3xl font-bold text-white">
            {formatCurrency(amount)}
          </p>
        </div>
        <div className="text-5xl opacity-80">{icon}</div>
      </div>
    </div>
  );
};
