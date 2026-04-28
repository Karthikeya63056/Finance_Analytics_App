import React, { useContext, useMemo } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { FinanceContext } from '../../../context/FinanceContext';

/**
 * SpendingRadar — Radar chart showing spending distribution across categories.
 * Normalized to 0-100 scale based on max category spend.
 */
export function SpendingRadar({ className = '' }) {
  const { transactions } = useContext(FinanceContext);

  const data = useMemo(() => {
    const cats = {};
    transactions.filter((t) => t.type === 'expense').forEach((t) => {
      cats[t.category] = (cats[t.category] || 0) + t.amount;
    });

    const maxAmount = Math.max(...Object.values(cats), 1);

    return Object.entries(cats).map(([category, amount]) => ({
      category: category.length > 12 ? category.substring(0, 12) + '…' : category,
      amount,
      normalized: Math.round((amount / maxAmount) * 100),
    }));
  }, [transactions]);

  if (data.length < 3) {
    return (
      <div className={`flex items-center justify-center rounded-2xl border border-dashed border-white/10 p-8 ${className}`}>
        <p className="text-sm text-gray-500">Need 3+ categories for radar chart</p>
      </div>
    );
  }

  return (
    <div className={className} style={{ width: '100%', height: 280 }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="75%">
          <PolarGrid stroke="rgba(255,255,255,0.08)" />
          <PolarAngleAxis dataKey="category" tick={{ fill: '#94a3b8', fontSize: 11 }} />
          <PolarRadiusAxis tick={false} axisLine={false} />
          <Radar
            name="Spending"
            dataKey="normalized"
            stroke="#10b981"
            fill="#10b981"
            fillOpacity={0.15}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
