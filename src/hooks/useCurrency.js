import { useCallback } from 'react';

export const useCurrency = () => {
  const formatCurrency = useCallback((amount, currency = 'INR') => {
    const formatter = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
    return formatter.format(amount);
  }, []);

  return { formatCurrency };
};
