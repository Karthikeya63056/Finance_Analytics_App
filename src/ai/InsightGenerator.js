/**
 * InsightGenerator — Produces structured financial insights from transaction data
 *
 * Insight types:
 * - spending_summary: Period spending breakdown
 * - category_trend: Category-level trend analysis
 * - budget_status: Budget health assessment
 * - savings_opportunity: Identified savings potential
 * - recurring_pattern: Detected recurring transactions
 * - weekly_report: Comprehensive weekly summary
 * - smart_nudge: Contextual micro-recommendations
 */

export class InsightGenerator {
  /**
   * Generate all applicable insights for current data
   * @param {Array} transactions
   * @param {number} monthlyBudget
   * @returns {Array} insights sorted by priority
   */
  generateAll(transactions, monthlyBudget) {
    if (!transactions || transactions.length === 0) {
      return [this._emptyStateInsight()];
    }

    const insights = [
      ...this._spendingSummary(transactions, monthlyBudget),
      ...this._categoryTrends(transactions),
      ...this._budgetStatus(transactions, monthlyBudget),
      ...this._savingsOpportunities(transactions),
      ...this._recurringPatterns(transactions),
      ...this._smartNudges(transactions, monthlyBudget),
    ];

    return insights.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Generate a weekly financial report
   */
  generateWeeklyReport(transactions, monthlyBudget) {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 86400000);

    const thisWeek = transactions.filter((t) => new Date(t.date) >= weekAgo);
    const prevWeek = transactions.filter((t) => {
      const d = new Date(t.date);
      return d >= new Date(weekAgo.getTime() - 7 * 86400000) && d < weekAgo;
    });

    const weekExpenses = thisWeek.filter((t) => t.type === 'expense');
    const prevExpenses = prevWeek.filter((t) => t.type === 'expense');

    const weekTotal = weekExpenses.reduce((s, t) => s + t.amount, 0);
    const prevTotal = prevExpenses.reduce((s, t) => s + t.amount, 0);
    const weekIncome = thisWeek.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);

    const change = prevTotal > 0 ? ((weekTotal - prevTotal) / prevTotal) * 100 : 0;

    // Category breakdown for the week
    const categories = {};
    weekExpenses.forEach((t) => {
      categories[t.category] = (categories[t.category] || 0) + t.amount;
    });

    const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];

    // Day-by-day
    const dailySpend = {};
    weekExpenses.forEach((t) => {
      const day = t.date;
      dailySpend[day] = (dailySpend[day] || 0) + t.amount;
    });

    const peakDay = Object.entries(dailySpend).sort((a, b) => b[1] - a[1])[0];

    return {
      type: 'weekly_report',
      period: { start: weekAgo.toISOString(), end: now.toISOString() },
      summary: {
        totalExpenses: weekTotal,
        totalIncome: weekIncome,
        netCashFlow: weekIncome - weekTotal,
        transactionCount: thisWeek.length,
        changeFromLastWeek: Math.round(change * 10) / 10,
        direction: change > 5 ? 'up' : change < -5 ? 'down' : 'stable',
      },
      categories,
      topCategory: topCategory ? { name: topCategory[0], amount: topCategory[1] } : null,
      peakDay: peakDay ? { date: peakDay[0], amount: peakDay[1] } : null,
      dailyAverage: weekExpenses.length > 0 ? Math.round(weekTotal / 7) : 0,
      narrative: this._buildWeeklyNarrative(weekTotal, prevTotal, change, topCategory, peakDay, monthlyBudget),
      generatedAt: Date.now(),
    };
  }

  /** @private */
  _spendingSummary(transactions, budget) {
    const now = new Date();
    const cm = now.getMonth(), cy = now.getFullYear();

    const monthExp = transactions.filter((t) => {
      const d = new Date(t.date);
      return t.type === 'expense' && d.getMonth() === cm && d.getFullYear() === cy;
    });

    const total = monthExp.reduce((s, t) => s + t.amount, 0);
    const daysInMonth = new Date(cy, cm + 1, 0).getDate();
    const dayOfMonth = now.getDate();
    const projected = dayOfMonth > 0 ? (total / dayOfMonth) * daysInMonth : 0;

    const insights = [];

    if (budget > 0 && projected > budget * 1.1) {
      insights.push({
        type: 'spending_summary',
        severity: 'warning',
        priority: 90,
        title: 'Projected overspend',
        message: `At your current pace, you'll spend ₹${Math.round(projected).toLocaleString('en-IN')} this month — ${Math.round((projected / budget - 1) * 100)}% over your ₹${budget.toLocaleString('en-IN')} budget.`,
        data: { spent: total, projected: Math.round(projected), budget },
        action: 'Review discretionary spending categories',
      });
    }

    if (total > 0) {
      insights.push({
        type: 'spending_summary',
        severity: 'info',
        priority: 40,
        title: 'Monthly spending update',
        message: `You've spent ₹${total.toLocaleString('en-IN')} across ${monthExp.length} transactions this month. Daily average: ₹${Math.round(total / Math.max(dayOfMonth, 1)).toLocaleString('en-IN')}.`,
        data: { total, count: monthExp.length, dailyAvg: Math.round(total / Math.max(dayOfMonth, 1)) },
      });
    }

    return insights;
  }

  /** @private */
  _categoryTrends(transactions) {
    const insights = [];
    const expenses = transactions.filter((t) => t.type === 'expense');
    if (expenses.length < 10) return insights;

    const now = new Date();
    const thisMonth = expenses.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const lastMonth = expenses.filter((t) => {
      const d = new Date(t.date);
      const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear();
    });

    const thisCats = {};
    thisMonth.forEach((t) => { thisCats[t.category] = (thisCats[t.category] || 0) + t.amount; });
    const lastCats = {};
    lastMonth.forEach((t) => { lastCats[t.category] = (lastCats[t.category] || 0) + t.amount; });

    for (const [cat, amount] of Object.entries(thisCats)) {
      const prev = lastCats[cat] || 0;
      if (prev > 0) {
        const change = ((amount - prev) / prev) * 100;
        if (change > 30) {
          insights.push({
            type: 'category_trend',
            severity: 'warning',
            priority: 70,
            title: `${cat} spending spike`,
            message: `${cat} spending is up ${Math.round(change)}% compared to last month (₹${amount.toLocaleString('en-IN')} vs ₹${prev.toLocaleString('en-IN')}).`,
            data: { category: cat, current: amount, previous: prev, change: Math.round(change) },
            action: `Review recent ${cat} transactions`,
          });
        } else if (change < -30) {
          insights.push({
            type: 'category_trend',
            severity: 'success',
            priority: 50,
            title: `${cat} spending reduced`,
            message: `Great work! ${cat} spending is down ${Math.round(Math.abs(change))}% from last month.`,
            data: { category: cat, current: amount, previous: prev, change: Math.round(change) },
          });
        }
      }
    }

    return insights;
  }

  /** @private */
  _budgetStatus(transactions, budget) {
    if (!budget || budget <= 0) return [];
    const now = new Date();
    const monthExp = transactions.filter((t) => {
      const d = new Date(t.date);
      return t.type === 'expense' && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).reduce((s, t) => s + t.amount, 0);

    const pct = (monthExp / budget) * 100;
    const insights = [];

    if (pct >= 100) {
      insights.push({
        type: 'budget_status', severity: 'danger', priority: 95,
        title: 'Budget exceeded',
        message: `You've spent ₹${monthExp.toLocaleString('en-IN')}, exceeding your ₹${budget.toLocaleString('en-IN')} budget by ${Math.round(pct - 100)}%.`,
        data: { spent: monthExp, budget, percentage: Math.round(pct) },
        action: 'Consider adjusting your budget or reducing expenses',
      });
    } else if (pct >= 80) {
      insights.push({
        type: 'budget_status', severity: 'warning', priority: 80,
        title: 'Budget warning',
        message: `You've used ${Math.round(pct)}% of your monthly budget with ₹${Math.round(budget - monthExp).toLocaleString('en-IN')} remaining.`,
        data: { spent: monthExp, budget, remaining: Math.round(budget - monthExp), percentage: Math.round(pct) },
        action: 'Watch your spending for the rest of the month',
      });
    }

    return insights;
  }

  /** @private */
  _savingsOpportunities(transactions) {
    const insights = [];
    const expenses = transactions.filter((t) => t.type === 'expense');
    if (expenses.length < 5) return insights;

    // Find categories with high frequency + moderate amounts
    const cats = {};
    expenses.forEach((t) => {
      if (!cats[t.category]) cats[t.category] = { total: 0, count: 0, amounts: [] };
      cats[t.category].total += t.amount;
      cats[t.category].count++;
      cats[t.category].amounts.push(t.amount);
    });

    const totalExpenses = expenses.reduce((s, t) => s + t.amount, 0);

    for (const [cat, data] of Object.entries(cats)) {
      const pct = (data.total / totalExpenses) * 100;
      if (pct > 30 && data.count > 3) {
        const potential = Math.round(data.total * 0.15);
        insights.push({
          type: 'savings_opportunity', severity: 'info', priority: 60,
          title: `Savings potential in ${cat}`,
          message: `${cat} accounts for ${Math.round(pct)}% of your spending. A 15% reduction could save ₹${potential.toLocaleString('en-IN')}.`,
          data: { category: cat, total: data.total, percentage: Math.round(pct), potential },
          action: `Look for alternatives or set a ${cat} sub-budget`,
        });
      }
    }

    return insights;
  }

  /** @private */
  _recurringPatterns(transactions) {
    const insights = [];
    const expenses = transactions.filter((t) => t.type === 'expense');
    if (expenses.length < 10) return insights;

    // Group by title (case-insensitive)
    const byTitle = {};
    expenses.forEach((t) => {
      const key = t.title.toLowerCase().trim();
      if (!byTitle[key]) byTitle[key] = [];
      byTitle[key].push(t);
    });

    for (const [title, txns] of Object.entries(byTitle)) {
      if (txns.length >= 3) {
        const amounts = txns.map((t) => t.amount);
        const avgAmount = amounts.reduce((s, a) => s + a, 0) / amounts.length;
        const variance = amounts.reduce((s, a) => s + Math.pow(a - avgAmount, 2), 0) / amounts.length;
        const cv = Math.sqrt(variance) / avgAmount; // coefficient of variation

        if (cv < 0.2) { // Low variance = likely recurring
          insights.push({
            type: 'recurring_pattern', severity: 'info', priority: 55,
            title: 'Recurring expense detected',
            message: `"${txns[0].title}" appears ${txns.length} times with an average of ₹${Math.round(avgAmount).toLocaleString('en-IN')}. Monthly impact: ~₹${Math.round(avgAmount).toLocaleString('en-IN')}.`,
            data: { title: txns[0].title, count: txns.length, avgAmount: Math.round(avgAmount), annualized: Math.round(avgAmount * 12) },
          });
        }
      }
    }

    return insights;
  }

  /** @private */
  _smartNudges(transactions, budget) {
    const insights = [];
    const now = new Date();
    const dayOfWeek = now.getDay();

    // Weekend spending nudge (Friday evening)
    if (dayOfWeek === 5 || dayOfWeek === 6) {
      const weekendExp = transactions.filter((t) => {
        const d = new Date(t.date);
        return t.type === 'expense' && (d.getDay() === 0 || d.getDay() === 6);
      });
      if (weekendExp.length > 5) {
        const avgWeekend = weekendExp.reduce((s, t) => s + t.amount, 0) / Math.max(1, new Set(weekendExp.map(t => t.date)).size);
        insights.push({
          type: 'smart_nudge', severity: 'info', priority: 35,
          title: 'Weekend spending reminder',
          message: `Your average weekend spending is ₹${Math.round(avgWeekend).toLocaleString('en-IN')}/day. Stay mindful of discretionary purchases this weekend.`,
          data: { avgWeekendSpend: Math.round(avgWeekend) },
        });
      }
    }

    // End of month nudge
    if (now.getDate() >= 25) {
      insights.push({
        type: 'smart_nudge', severity: 'info', priority: 30,
        title: 'Month-end check',
        message: 'The month is almost over. Review your spending against your budget goals before it resets.',
      });
    }

    return insights;
  }

  /** @private */
  _emptyStateInsight() {
    return {
      type: 'info', severity: 'info', priority: 10,
      title: 'Getting started',
      message: 'Add your first transactions to unlock AI-powered spending analysis, anomaly detection, and personalized insights.',
      action: 'Head to Transactions → Add Transaction',
    };
  }

  /** @private */
  _buildWeeklyNarrative(weekTotal, prevTotal, change, topCat, peakDay, budget) {
    const parts = [];

    if (weekTotal === 0) {
      return 'No expenses recorded this week. Start tracking to unlock weekly insights.';
    }

    parts.push(`This week you spent ₹${Math.round(weekTotal).toLocaleString('en-IN')}.`);

    if (prevTotal > 0) {
      if (change > 10) parts.push(`That's ${Math.round(change)}% more than last week — worth keeping an eye on.`);
      else if (change < -10) parts.push(`That's ${Math.round(Math.abs(change))}% less than last week — great discipline!`);
      else parts.push('Spending is consistent with last week.');
    }

    if (topCat) parts.push(`Top category: ${topCat[0]} at ₹${topCat[1].toLocaleString('en-IN')}.`);
    if (peakDay) parts.push(`Highest spend day: ${peakDay[0]} (₹${Math.round(peakDay[1]).toLocaleString('en-IN')}).`);

    if (budget > 0) {
      const weeklyBudget = budget / 4;
      if (weekTotal > weeklyBudget) parts.push(`⚠️ This week exceeded your weekly budget share of ₹${Math.round(weeklyBudget).toLocaleString('en-IN')}.`);
    }

    return parts.join(' ');
  }
}
