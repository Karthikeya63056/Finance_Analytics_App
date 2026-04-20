import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export const TrendLineChart = ({ data }) => {
  const chartData = Object.entries(data || {}).map(
    ([month, { income, expense }]) => ({
      month,
      income: Math.round(income),
      expense: Math.round(expense),
    }),
  );

  if (chartData.length === 0) {
    return (
      <div className="surface-soft rounded-[32px] p-8 text-center text-gray-400">
        No trend data available
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="surface-soft h-full rounded-[32px] p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-100">
          6-month trend
        </h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%" minHeight="288px">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="month"
                stroke="#94a3b8"
                tick={{ fill: "#94a3b8", fontSize: 12 }}
              />
              <YAxis
                stroke="#94a3b8"
                tick={{ fill: "#94a3b8", fontSize: 12 }}
              />
              <Tooltip
                formatter={(value) => `₹${value.toLocaleString("en-IN")}`}
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.95)",
                  border: "1px solid rgba(148, 163, 184, 0.4)",
                  borderRadius: "16px",
                  color: "#e5e7eb",
                  boxShadow: "0 15px 30px rgba(2, 6, 23, 0.45)",
                }}
                labelStyle={{ color: "#e2e8f0" }}
              />
              <Legend wrapperStyle={{ color: "#cbd5e1", fontSize: 13 }} />
              <Line
                type="monotone"
                dataKey="income"
                stroke="#16a34a"
                strokeWidth={3}
                dot={{ fill: "#16a34a", r: 5 }}
                activeDot={{ r: 7 }}
              />
              <Line
                type="monotone"
                dataKey="expense"
                stroke="#ef4444"
                strokeWidth={3}
                dot={{ fill: "#ef4444", r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
