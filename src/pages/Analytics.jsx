import React from "react";
import { FiDownload } from "react-icons/fi";
import { useAnalytics } from "../hooks/useAnalytics";
import { formatCurrency } from "../utils/currencyFormatter";
import { CategoryPieChart } from "../components/ui/Charts/PieChart";
import { TrendLineChart } from "../components/ui/Charts/LineChart";
import { CategoryBarChart } from "../components/ui/Charts/BarChart";

export const Analytics = () => {
  const analytics = useAnalytics();

  const handleExport = () => {
    const dataStr = JSON.stringify(
      {
        exportDate: new Date().toISOString(),
        analytics,
      },
      null,
      2,
    );

    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `transactions-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-10 xl:py-10">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-gray-400">
            Analytics
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-gray-100">
            Financial insights
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-gray-400">
            A concise snapshot of performance, categories, and recurring
            commitments.
          </p>
        </div>
        <button
          onClick={handleExport}
          className="btn-primary inline-flex items-center justify-center gap-2 rounded-3xl px-5 py-3 text-sm font-semibold transition active:scale-95"
        >
          <FiDownload size={18} /> Export data
        </button>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-3">
        <div className="surface-card rounded-[32px] p-6">
          <p className="text-sm uppercase tracking-[0.28em] text-gray-400">
            Total income
          </p>
          <p className="value-mono mt-4 text-3xl font-semibold text-emerald-300">
            {formatCurrency(analytics.totalIncome)}
          </p>
        </div>
        <div className="surface-card rounded-[32px] p-6">
          <p className="text-sm uppercase tracking-[0.28em] text-gray-400">
            Total expenses
          </p>
          <p className="value-mono mt-4 text-3xl font-semibold text-rose-300">
            {formatCurrency(analytics.totalExpenses)}
          </p>
        </div>
        <div className="surface-card rounded-[32px] p-6">
          <p className="text-sm uppercase tracking-[0.28em] text-gray-400">
            Net balance
          </p>
          <p
            className={`value-mono mt-4 text-3xl font-semibold ${analytics.netBalance >= 0 ? "text-gray-100" : "text-rose-300"}`}
          >
            {formatCurrency(analytics.netBalance)}
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="surface-card rounded-[32px] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-gray-400">
                Trend
              </p>
              <h2 className="mt-2 text-xl font-semibold text-gray-100">
                Income vs expenses
              </h2>
            </div>
            <span className="surface-soft rounded-3xl px-3 py-2 text-xs uppercase tracking-[0.28em] text-gray-400">
              Last 6 months
            </span>
          </div>
          <div className="mt-6 h-[340px]">
            <TrendLineChart data={analytics.monthlyTotals} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="surface-card rounded-[32px] p-6">
            <p className="text-sm uppercase tracking-[0.28em] text-gray-400">
              Top category
            </p>
            <h2 className="mt-2 text-xl font-semibold text-gray-100">
              {analytics.topCategory?.name || "No expense data"}
            </h2>
            <p className="value-mono mt-4 text-3xl font-semibold text-gray-100">
              {analytics.topCategory
                ? formatCurrency(analytics.topCategory.amount)
                : "—"}
            </p>
            {analytics.topCategory && (
              <p className="mt-2 text-sm text-gray-400">
                {(
                  (analytics.topCategory.amount / analytics.totalExpenses) *
                  100
                ).toFixed(1)}
                % of total expenses
              </p>
            )}
          </div>
          <div className="surface-card rounded-[32px] p-6">
            <p className="text-sm uppercase tracking-[0.28em] text-gray-400">
              Recurring expenses
            </p>
            <h2 className="mt-2 text-xl font-semibold text-gray-100">
              {formatCurrency(analytics.recurringExpenses)}
            </h2>
            <p className="mt-4 text-sm text-gray-400">
              Monthly recurring commitments
            </p>
            {analytics.recurringExpenses > 0 && (
              <p className="mt-4 text-sm text-gray-400">
                Annualized: {formatCurrency(analytics.recurringExpenses * 12)}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <div className="surface-card rounded-[32px] p-6">
          <p className="text-sm uppercase tracking-[0.28em] text-gray-400">
            Category spend
          </p>
          <h2 className="mt-2 text-xl font-semibold text-gray-100">
            Expense distribution
          </h2>
          <div className="mt-6 h-[340px]">
            <CategoryPieChart data={analytics.categoryBreakdown} />
          </div>
        </div>

        <div className="surface-card rounded-[32px] p-6">
          <p className="text-sm uppercase tracking-[0.28em] text-gray-400">
            Category comparison
          </p>
          <h2 className="mt-2 text-xl font-semibold text-gray-100">
            Expense bar chart
          </h2>
          <div className="mt-6 h-[340px]">
            <CategoryBarChart data={analytics.categoryBreakdown} />
          </div>
        </div>
      </div>
    </div>
  );
};
