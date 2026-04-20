import { useContext } from 'react';
import { FinanceContext } from '../context/FinanceContext';

export const useTransactions = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useTransactions must be used within FinanceProvider');
  }

  const {
    transactions,
    addTransaction,
    deleteTransaction,
    updateTransaction,
  } = context;

  return {
    transactions,
    addTransaction,
    deleteTransaction,
    updateTransaction,
  };
};
