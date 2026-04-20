import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export const CategoryBarChart = ({ data }) => {
  const chartData = Object.entries(data || {}).map(([category, amount]) => ({
    category: category.split(" ")[0],
    amount: Math.round(amount),
  }));

  if (chartData.length === 0) {
    return (
      <div className="surface-soft rounded-[32px] p-8 text-center text-gray-400">
        No data available
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="surface-soft h-full rounded-[32px] p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-100">
          Category breakdown
        </h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%" minHeight="288px">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                type="number"
                stroke="#94a3b8"
                tick={{ fill: "#94a3b8", fontSize: 12 }}
              />
              <YAxis
                dataKey="category"
                type="category"
                stroke="#94a3b8"
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                width={120}
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
              <Bar dataKey="amount" fill="#16a34a" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
