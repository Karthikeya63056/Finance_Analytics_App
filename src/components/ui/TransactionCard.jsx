import React from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { formatCurrency } from "../../utils/currencyFormatter";
import { formatDate } from "../../utils/dateHelpers";

const CATEGORY_ICONS = {
  "Food & Dining": "🍽️",
  Transportation: "🚗",
  Entertainment: "🎬",
  Utilities: "💡",
  Healthcare: "🏥",
  Shopping: "🛍️",
  Travel: "✈️",
  Salary: "💼",
};

export const TransactionCard = ({ transaction, onEdit, onDelete }) => {
  const isIncome = transaction.type === "income";
  const icon = CATEGORY_ICONS[transaction.category] || "💰";

  return (
    <div className="surface-card rounded-[32px] p-5 transition hover:-translate-y-[2px]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="surface-soft grid h-14 w-14 place-items-center rounded-3xl text-2xl">
            {icon}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-100">
              {transaction.title}
            </h3>
            <p className="mt-1 text-sm text-gray-400">
              {transaction.category} · {formatDate(transaction.date, "MMM dd")}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-3">
          <span
            className={`value-mono text-lg font-semibold ${isIncome ? "text-emerald-300" : "text-rose-300"}`}
          >
            {isIncome ? "+" : "-"} {formatCurrency(transaction.amount)}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(transaction.id)}
              className="surface-soft inline-flex h-10 w-10 items-center justify-center rounded-2xl text-gray-300 transition hover:border-cyan-300/30 hover:text-cyan-200"
              aria-label="Edit transaction"
            >
              <FiEdit2 size={16} />
            </button>
            <button
              onClick={() => onDelete(transaction.id)}
              className="surface-soft inline-flex h-10 w-10 items-center justify-center rounded-2xl text-gray-300 transition hover:border-rose-300/35 hover:text-rose-300"
              aria-label="Delete transaction"
            >
              <FiTrash2 size={16} />
            </button>
          </div>
        </div>
      </div>

      {transaction.notes && (
        <p className="mt-4 text-sm leading-6 text-gray-400">
          {transaction.notes}
        </p>
      )}

      {transaction.recurring && (
        <span className="mt-4 inline-flex rounded-full border border-cyan-300/30 bg-cyan-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100">
          Recurring
        </span>
      )}
    </div>
  );
};
