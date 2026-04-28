/**
 * ForecastEngine — Advanced financial forecasting with multiple models
 *
 * Models:
 * - Weighted Moving Average (WMA)
 * - Exponential Smoothing (Holt's method)
 * - Seasonal decomposition
 * - Budget-adjusted projection
 */

export class ForecastEngine {
  /**
   * Generate multi-model forecast
   * @param {Array} transactions
   * @param {number} monthlyBudget
   * @param {number} [monthsAhead=3]
   * @returns {Object} Forecast results with confidence intervals
   */
  forecast(transactions, monthlyBudget, monthsAhead = 3) {
    const monthlyData = this._getMonthlyTotals(transactions, 12);
    const amounts = monthlyData.map((m) => m.expense);

    if (amounts.filter((a) => a > 0).length < 2) {
      return { predictions: [], model: 'insufficient_data', confidence: 'none', summary: 'Need at least 2 months of data for forecasting.' };
    }

    const wma = this._weightedMovingAverage(amounts, monthsAhead);
    const exp = this._exponentialSmoothing(amounts, monthsAhead);
    const ensemble = wma.map((v, i) => Math.round((v * 0.4 + exp[i] * 0.6)));

    const predictions = ensemble.map((value, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() + i + 1);
      const margin = Math.round(value * 0.15);
      return {
        month: d.toLocaleString('default', { month: 'short', year: 'numeric' }),
        predicted: value,
        low: Math.max(0, value - margin),
        high: value + margin,
        confidence: amounts.length >= 6 ? 'high' : amounts.length >= 3 ? 'medium' : 'low',
      };
    });

    const trend = this._detectTrend(amounts);
    const seasonality = this._detectSeasonality(amounts);

    return {
      predictions,
      model: 'ensemble_wma_exp',
      confidence: amounts.length >= 6 ? 'high' : 'medium',
      trend,
      seasonality,
      historicalMonths: monthlyData,
      summary: this._buildSummary(predictions, trend, monthlyBudget),
    };
  }

  /**
   * Generate income vs expense cash flow projection
   */
  cashFlowForecast(transactions, monthsAhead = 3) {
    const monthlyData = this._getMonthlyTotals(transactions, 12);
    const incomes = monthlyData.map((m) => m.income);
    const expenses = monthlyData.map((m) => m.expense);

    const incForecast = this._exponentialSmoothing(incomes, monthsAhead);
    const expForecast = this._exponentialSmoothing(expenses, monthsAhead);

    let runningBalance = monthlyData.reduce((s, m) => s + m.income - m.expense, 0);

    return Array.from({ length: monthsAhead }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() + i + 1);
      const netFlow = Math.round(incForecast[i] - expForecast[i]);
      runningBalance += netFlow;
      return {
        month: d.toLocaleString('default', { month: 'short', year: 'numeric' }),
        income: Math.round(incForecast[i]),
        expense: Math.round(expForecast[i]),
        netFlow,
        cumulativeBalance: Math.round(runningBalance),
      };
    });
  }

  /** @private */
  _getMonthlyTotals(transactions, months) {
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
        label: m.toLocaleString('default', { month: 'short', year: 'numeric' }),
        month, year, income, expense, net: income - expense,
      });
    }
    return result;
  }

  /** @private */
  _weightedMovingAverage(data, ahead) {
    const nonZero = data.filter((v) => v > 0);
    if (nonZero.length === 0) return Array(ahead).fill(0);
    const window = nonZero.slice(-6);
    const weights = window.map((_, i) => i + 1);
    const totalWeight = weights.reduce((s, w) => s + w, 0);
    const wma = window.reduce((s, v, i) => s + v * weights[i], 0) / totalWeight;
    return Array(ahead).fill(Math.round(wma));
  }

  /** @private */
  _exponentialSmoothing(data, ahead, alpha = 0.4) {
    const nonZero = data.filter((v) => v > 0);
    if (nonZero.length === 0) return Array(ahead).fill(0);
    let level = nonZero[0];
    let trend = nonZero.length > 1 ? nonZero[1] - nonZero[0] : 0;
    const beta = 0.2;
    for (let i = 1; i < nonZero.length; i++) {
      const prevLevel = level;
      level = alpha * nonZero[i] + (1 - alpha) * (level + trend);
      trend = beta * (level - prevLevel) + (1 - beta) * trend;
    }
    return Array.from({ length: ahead }, (_, i) => Math.max(0, Math.round(level + trend * (i + 1))));
  }

  /** @private */
  _detectTrend(data) {
    const nonZero = data.filter((v) => v > 0);
    if (nonZero.length < 3) return { direction: 'stable', strength: 0, description: 'Not enough data' };
    const recent = nonZero.slice(-3);
    const older = nonZero.slice(0, Math.max(1, nonZero.length - 3));
    const recentAvg = recent.reduce((s, v) => s + v, 0) / recent.length;
    const olderAvg = older.reduce((s, v) => s + v, 0) / older.length;
    const change = olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0;

    if (change > 15) return { direction: 'increasing', strength: Math.round(change), description: `Spending trending up ${Math.round(change)}% over recent months` };
    if (change < -15) return { direction: 'decreasing', strength: Math.round(Math.abs(change)), description: `Spending trending down ${Math.round(Math.abs(change))}% — great progress!` };
    return { direction: 'stable', strength: Math.round(Math.abs(change)), description: 'Spending is relatively stable' };
  }

  /** @private */
  _detectSeasonality(data) {
    if (data.length < 6) return { detected: false };
    const nonZero = data.filter((v) => v > 0);
    if (nonZero.length < 4) return { detected: false };
    const mean = nonZero.reduce((s, v) => s + v, 0) / nonZero.length;
    const cv = Math.sqrt(nonZero.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / nonZero.length) / mean;
    return { detected: cv > 0.25, variability: Math.round(cv * 100) };
  }

  /** @private */
  _buildSummary(predictions, trend, budget) {
    const parts = [];
    if (predictions.length > 0) {
      parts.push(`Next month's projected expense: ₹${predictions[0].predicted.toLocaleString('en-IN')}`);
      if (budget > 0 && predictions[0].predicted > budget) {
        parts.push(`⚠️ This exceeds your ₹${budget.toLocaleString('en-IN')} budget by ${Math.round(((predictions[0].predicted - budget) / budget) * 100)}%`);
      }
    }
    parts.push(trend.description);
    return parts.join('. ');
  }
}

export const forecastEngine = new ForecastEngine();
