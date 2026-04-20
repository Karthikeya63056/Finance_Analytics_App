import { useContext, useMemo } from 'react';
import { FinanceContext } from '../context/FinanceContext';

export const useAnalytics = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useAnalytics must be used within FinanceProvider');
  }

  const { transactions } = context;

  const analytics = useMemo(() => {
    // Total income and expenses
    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Category breakdown
    const categoryBreakdown = {};
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        if (!categoryBreakdown[t.category]) {
          categoryBreakdown[t.category] = 0;
        }
        categoryBreakdown[t.category] += t.amount;
      });

    // Top spending category
    const topCategory = Object.entries(categoryBreakdown).sort(
      ([, a], [, b]) => b - a
    )[0];

    // Monthly totals for last 6 months
    const monthlyTotals = {};
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyTotals[monthKey] = { income: 0, expense: 0 };
    }

    transactions.forEach((t) => {
      const date = new Date(t.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyTotals[monthKey]) {
        if (t.type === 'income') {
          monthlyTotals[monthKey].income += t.amount;
        } else {
          monthlyTotals[monthKey].expense += t.amount;
        }
      }
    });

    // Recurring expenses
    const recurringExpenses = transactions
      .filter((t) => t.type === 'expense' && t.recurring)
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
      categoryBreakdown,
      topCategory: topCategory ? { name: topCategory[0], amount: topCategory[1] } : null,
      monthlyTotals,
      recurringExpenses,
      transactionCount: transactions.length,
    };
  }, [transactions]);

  return analytics;
};
