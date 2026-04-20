import React, { useState } from "react";
import { FiSave, FiAlertCircle } from "react-icons/fi";
import { toast } from "react-toastify";
import { useBudget } from "../hooks/useBudget";
import { formatCurrency } from "../utils/currencyFormatter";

export const Budget = () => {
  const { budget, spent, remaining, percentage, updateBudget } = useBudget();
  const [inputValue, setInputValue] = useState(budget.toString());
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    const newBudget = parseFloat(inputValue);
    if (isNaN(newBudget) || newBudget < 0) {
      toast.error("Please enter a valid budget amount");
      return;
    }

    setIsSaving(true);
    try {
      updateBudget(newBudget);
      toast.success("Budget updated successfully!");
    } catch {
      toast.error("Failed to update budget");
    } finally {
      setIsSaving(false);
    }
  };

  const isOver80 = percentage > 80;

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-10 xl:py-10">
      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <div className="surface-card rounded-[32px] p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-gray-400">
                Budget control
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-gray-100">
                Monthly budget
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-gray-400">
                Set a healthy monthly finance target and keep spending in check
                with clear progress feedback.
              </p>
            </div>
            <div className="surface-soft rounded-3xl px-4 py-3 text-sm text-gray-300">
              Updated instantly
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="surface-soft rounded-[28px] p-6">
              <p className="text-sm uppercase tracking-[0.24em] text-gray-400">
                Spent
              </p>
              <p className="value-mono mt-4 text-3xl font-semibold text-rose-300">
                {formatCurrency(spent)}
              </p>
              <p className="mt-2 text-sm text-gray-400">This month</p>
            </div>
            <div className="surface-soft rounded-[28px] p-6">
              <p className="text-sm uppercase tracking-[0.24em] text-gray-400">
                Remaining
              </p>
              <p className="value-mono mt-4 text-3xl font-semibold text-emerald-300">
                {formatCurrency(remaining)}
              </p>
              <p className="mt-2 text-sm text-gray-400">Available</p>
            </div>
            <div className="surface-soft rounded-[28px] p-6">
              <p className="text-sm uppercase tracking-[0.24em] text-gray-400">
                Budget total
              </p>
              <p className="value-mono mt-4 text-3xl font-semibold text-gray-100">
                {formatCurrency(budget)}
              </p>
              <p className="mt-2 text-sm text-gray-400">Allocated</p>
            </div>
          </div>

          <div className="surface-soft mt-8 rounded-[32px] p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-gray-400">
                  Budget usage
                </p>
                <h2 className="value-mono mt-2 text-2xl font-semibold text-gray-100">
                  {percentage.toFixed(1)}%
                </h2>
              </div>
              {isOver80 ? (
                <span className="rounded-3xl bg-rose-100 px-4 py-2 text-sm font-semibold text-rose-700">
                  High spend
                </span>
              ) : (
                <span className="rounded-3xl bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
                  On track
                </span>
              )}
            </div>
            <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-800/70 shadow-inner">
              <div
                className={`h-full rounded-full transition-all ${isOver80 ? "bg-rose-500" : "bg-emerald-500"}`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
            <p className="mt-4 text-sm text-gray-400">
              {isOver80
                ? "Over 80% of budget used."
                : "You’re within a healthy budget range."}
            </p>
          </div>
        </div>

        <div className="surface-card rounded-[32px] p-8">
          <p className="text-sm uppercase tracking-[0.28em] text-gray-400">
            Adjust target
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-gray-100">
            Update monthly goal
          </h2>
          <div className="mt-6 space-y-5">
            <div>
              <label className="text-sm font-semibold text-gray-200">
                Budget amount
              </label>
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="input-dark mt-3 w-full rounded-3xl px-4 py-3 outline-none transition"
                placeholder="0"
              />
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="btn-primary inline-flex w-full items-center justify-center gap-2 rounded-3xl px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FiSave size={18} />
              {isSaving ? "Saving..." : "Save budget"}
            </button>
          </div>

          {isOver80 && (
            <div className="mt-6 flex items-start gap-3 rounded-3xl border border-rose-300/30 bg-rose-500/10 p-4 text-sm text-rose-200">
              <FiAlertCircle className="mt-1" size={18} />
              <div>
                <p className="font-semibold">Budget alert</p>
                <p className="mt-1 text-gray-300">
                  You’ve used most of your monthly budget. Review your upcoming
                  expenses.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
