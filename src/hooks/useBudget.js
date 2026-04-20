import { useContext, useMemo } from 'react';
import { FinanceContext } from '../context/FinanceContext';

export const useBudget = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useBudget must be used within FinanceProvider');
  }

  const { transactions, monthlyBudget, updateBudget } = context;

  const { spent, remaining, percentage } = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyExpenses = transactions
      .filter((t) => {
        const date = new Date(t.date);
        return (
          t.type === 'expense' &&
          date.getMonth() === currentMonth &&
          date.getFullYear() === currentYear
        );
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const remaining = Math.max(0, monthlyBudget - monthlyExpenses);
    const percentage = monthlyBudget > 0 ? (monthlyExpenses / monthlyBudget) * 100 : 0;

    return {
      spent: monthlyExpenses,
      remaining,
      percentage: Math.min(percentage, 100),
    };
  }, [transactions, monthlyBudget]);

  return {
    budget: monthlyBudget,
    spent,
    remaining,
    percentage,
    updateBudget,
  };
};
