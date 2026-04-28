import React, { useContext, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { FinanceContext } from '../../../context/FinanceContext';

/**
 * CashFlowWaterfall — Bar chart showing income vs expense per month
 * with net flow indicator.
 */
export function CashFlowWaterfall({ className = '', months = 6 }) {
  const { transactions } = useContext(FinanceContext);

  const data = useMemo(() => {
    const now = new Date();
    const result = [];
    for (let i = months - 1; i >= 0; i--) {
      const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = m.getMonth(), year = m.getFullYear();
      let income = 0, expense = 0;
      transactions.forEach((t) => {
        const d = new Date(t.date);
        if (d.getMonth() === month && d.getFullYear() === year) {
          if (t.type === 'income') income += t.amount;
          else expense += t.amount;
        }
      });
      result.push({
        month: m.toLocaleString('default', { month: 'short' }),
        income,
        expense: -expense,
        net: income - expense,
      });
    }
    return result;
  }, [transactions, months]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-xl border border-white/10 bg-slate-900/95 px-4 py-3 backdrop-blur-xl">
        <p className="mb-2 text-xs font-semibold text-gray-200">{label}</p>
        {payload.map((p) => (
          <p key={p.dataKey} className="text-xs" style={{ color: p.color }}>
            {p.dataKey === 'expense' ? 'Expense' : p.dataKey}: ₹{Math.abs(p.value).toLocaleString('en-IN')}
          </p>
        ))}
      </div>
    );
  };

  if (data.every((d) => d.income === 0 && d.expense === 0)) {
    return (
      <div className={`flex items-center justify-center rounded-2xl border border-dashed border-white/10 p-8 ${className}`}>
        <p className="text-sm text-gray-500">Add transactions to see cash flow</p>
      </div>
    );
  }

  return (
    <div className={className} style={{ width: '100%', height: 280 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false}
            tickFormatter={(v) => `₹${Math.abs(v / 1000).toFixed(0)}k`} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar dataKey="income" radius={[6, 6, 0, 0]} maxBarSize={32}>
            {data.map((_, i) => <Cell key={i} fill="#10b981" fillOpacity={0.7} />)}
          </Bar>
          <Bar dataKey="expense" radius={[0, 0, 6, 6]} maxBarSize={32}>
            {data.map((_, i) => <Cell key={i} fill="#f43f5e" fillOpacity={0.6} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
