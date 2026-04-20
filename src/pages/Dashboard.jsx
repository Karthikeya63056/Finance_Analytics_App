import React from "react";
import { Link } from "react-router-dom";
import { FiZap, FiShield } from "react-icons/fi";
import { formatCurrency } from "../utils/currencyFormatter";
import { useAnalytics } from "../hooks/useAnalytics";
import { useBudget } from "../hooks/useBudget";
import { useTransactions } from "../hooks/useTransactions";
import { CategoryPieChart } from "../components/ui/Charts/PieChart";
import { TrendLineChart } from "../components/ui/Charts/LineChart";
import { TransactionCard } from "../components/ui/TransactionCard";
import { StatsCard } from "../components/ui/StatsCard";

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

export const Dashboard = () => {
  const analytics = useAnalytics();
  const { budget, spent, remaining, percentage } = useBudget();
  const { transactions } = useTransactions();
  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-10 xl:py-10">
      <div className="grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
        <div className="space-y-6">
          <section className="glass rounded-[32px] p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-gray-400">
                  Net cash position
                </p>
                <h1 className="value-mono mt-3 text-4xl font-semibold tracking-tight text-gray-100">
                  {formatCurrency(analytics.netBalance)}
                </h1>
              </div>
              <div className="surface-soft flex flex-col gap-2 rounded-3xl p-4 text-gray-300">
                <span className="text-xs uppercase tracking-[0.28em] text-gray-400">
                  Status
                </span>
                <span className="text-lg font-semibold">
                  {analytics.netBalance >= 0 ? "Healthy" : "Review"}
                </span>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <StatsCard
                title="Total income"
                value={formatCurrency(analytics.totalIncome)}
                detail="+ 12%"
                accent="emerald"
              />
              <StatsCard
                title="Total expenses"
                value={formatCurrency(analytics.totalExpenses)}
                detail="- 8%"
                accent="rose"
              />
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <div className="surface-card rounded-[32px] p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-gray-400">
                    Budget health
                  </p>
                  <h2 className="value-mono mt-3 text-2xl font-semibold text-gray-100">
                    {Math.round(percentage)}%
                  </h2>
                </div>
                <div className="inline-flex items-center gap-2 rounded-3xl border border-emerald-300/25 bg-emerald-500/15 px-3 py-2 text-emerald-200">
                  <FiShield /> Safe
                </div>
              </div>
              <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-800/70">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
              <p className="mt-4 text-sm text-gray-400">
                {formatCurrency(spent)} spent of {formatCurrency(budget)}{" "}
                budget.
              </p>
            </div>

            <div className="surface-card rounded-[32px] p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-gray-400">
                    Savings rate
                  </p>
                  <h2 className="value-mono mt-3 text-2xl font-semibold text-gray-100">
                    {budget > 0
                      ? `${Math.round((remaining / budget) * 100)}%`
                      : "—"}
                  </h2>
                </div>
                <div className="inline-flex items-center gap-2 rounded-3xl border border-white/15 bg-white/5 px-3 py-2 text-cyan-200">
                  <FiZap /> Momentum
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-400">
                Keep this above 20% to stay on track.
              </p>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <div className="surface-card rounded-[32px] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-gray-400">
                    Spending mix
                  </p>
                  <h2 className="mt-3 text-xl font-semibold text-gray-100">
                    Expense breakdown
                  </h2>
                </div>
                <span className="rounded-3xl border border-white/15 bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.28em] text-gray-400">
                  30d
                </span>
              </div>
              <div className="mt-6 h-[320px]">
                <CategoryPieChart data={analytics.categoryBreakdown} />
              </div>
            </div>

            <div className="surface-card rounded-[32px] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-gray-400">
                    Cashflow trend
                  </p>
                  <h2 className="mt-3 text-xl font-semibold text-gray-100">
                    Income vs expense
                  </h2>
                </div>
                <span className="rounded-3xl border border-white/15 bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.28em] text-gray-400">
                  6 months
                </span>
              </div>
              <div className="mt-6 h-[320px]">
                <TrendLineChart data={analytics.monthlyTotals} />
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="surface-card rounded-[32px] p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-gray-400">
                  Top category
                </p>
                <h2 className="mt-3 text-2xl font-semibold text-gray-100">
                  {analytics.topCategory?.name || "No data yet"}
                </h2>
              </div>
              <div className="text-4xl">
                {CATEGORY_ICONS[analytics.topCategory?.name] || "💼"}
              </div>
            </div>
            <p className="mt-6 text-gray-400">
              {analytics.topCategory
                ? `Spent ${formatCurrency(analytics.topCategory.amount)} here in the last period.`
                : "Add expenses to surface category insights."}
            </p>
          </section>

          <section className="surface-card rounded-[32px] p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-gray-400">
                  Recent activity
                </p>
                <h2 className="mt-3 text-2xl font-semibold text-gray-100">
                  Latest transactions
                </h2>
              </div>
              <span className="rounded-3xl border border-emerald-300/25 bg-emerald-500/15 px-3 py-2 text-xs uppercase tracking-[0.28em] text-emerald-200">
                Live
              </span>
            </div>
            <div className="mt-6 space-y-4">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="surface-soft rounded-3xl p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-100">
                          {transaction.title}
                        </p>
                        <p className="text-sm text-gray-400">
                          {transaction.category}
                        </p>
                      </div>
                      <p
                        className={`text-sm font-semibold ${transaction.type === "income" ? "text-emerald-600" : "text-rose-600"}`}
                      >
                        {transaction.type === "income" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400">
                  No transactions yet. Add one to populate this summary.
                </p>
              )}
            </div>
            <Link
              to="/transactions"
              className="btn-primary mt-6 inline-flex w-full items-center justify-center rounded-3xl px-4 py-3 text-sm font-semibold transition active:scale-95"
            >
              View all transactions
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
};
