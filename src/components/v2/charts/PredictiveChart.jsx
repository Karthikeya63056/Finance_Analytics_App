import React, { useContext, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { FinanceContext } from '../../../context/FinanceContext';
import { forecastEngine } from '../../../services/v2/ForecastEngine';

/**
 * PredictiveChart — Area chart showing historical spending + AI forecast.
 * Historical data in solid, forecast in dashed with confidence band.
 */
export function PredictiveChart({ className = '', monthsHistory = 6, monthsForecast = 3 }) {
  const { transactions, monthlyBudget } = useContext(FinanceContext);

  const chartData = useMemo(() => {
    const forecast = forecastEngine.forecast(transactions, monthlyBudget, monthsForecast);
    const historical = forecast.historicalMonths?.slice(-monthsHistory) || [];

    const data = historical.map((m) => ({
      month: m.label,
      actual: m.expense,
      type: 'historical',
    }));

    if (forecast.predictions.length > 0) {
      // Bridge point
      if (data.length > 0) {
        data[data.length - 1].predicted = data[data.length - 1].actual;
      }

      forecast.predictions.forEach((p) => {
        data.push({
          month: p.month,
          predicted: p.predicted,
          low: p.low,
          high: p.high,
          type: 'forecast',
        });
      });
    }

    return data;
  }, [transactions, monthlyBudget, monthsHistory, monthsForecast]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-xl border border-white/10 bg-slate-900/95 px-4 py-3 backdrop-blur-xl">
        <p className="mb-1.5 text-xs font-semibold text-gray-200">{label}</p>
        {payload.map((p) => (
          <p key={p.dataKey} className="text-xs" style={{ color: p.stroke || p.color }}>
            {p.dataKey === 'actual' ? 'Actual' : p.dataKey === 'predicted' ? 'Forecast' : p.dataKey}: ₹{Math.round(p.value).toLocaleString('en-IN')}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className={className} style={{ width: '100%', height: 280 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false}
            tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
          <Tooltip content={<CustomTooltip />} />
          {monthlyBudget > 0 && (
            <ReferenceLine y={monthlyBudget} stroke="#f59e0b" strokeDasharray="4 4" strokeOpacity={0.5} />
          )}
          <Area type="monotone" dataKey="actual" stroke="#10b981" fill="url(#actualGrad)" strokeWidth={2} dot={{ r: 3, fill: '#10b981' }} />
          <Area type="monotone" dataKey="predicted" stroke="#22d3ee" fill="url(#forecastGrad)" strokeWidth={2} strokeDasharray="6 3" dot={{ r: 3, fill: '#22d3ee' }} />
          <Area type="monotone" dataKey="high" stroke="none" fill="#22d3ee" fillOpacity={0.05} />
          <Area type="monotone" dataKey="low" stroke="none" fill="#22d3ee" fillOpacity={0.05} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
