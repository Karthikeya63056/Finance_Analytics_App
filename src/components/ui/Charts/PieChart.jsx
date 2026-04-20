import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = [
  "#22c55e",
  "#0ea5e9",
  "#f97316",
  "#a855f7",
  "#ec4899",
  "#64748b",
  "#facc15",
  "#0284c7",
];

export const CategoryPieChart = ({ data }) => {
  const chartData = Object.entries(data || {}).map(([name, value]) => ({
    name,
    value: Math.round(value),
  }));

  if (chartData.length === 0) {
    return (
      <div className="surface-soft rounded-[32px] p-8 text-center text-gray-400">
        No expense data available
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="surface-soft h-full rounded-[32px] p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-100">
          Spending by category
        </h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%" minHeight="288px">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={100}
                fill="#22c55e"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
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
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
