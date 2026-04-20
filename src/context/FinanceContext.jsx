import React, { createContext, useState, useEffect, useCallback } from "react";

export const FinanceContext = createContext();

export const FinanceProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [monthlyBudget, setMonthlyBudget] = useState(50000);
  const [exchangeRates, setExchangeRates] = useState({});
  const [loading, setLoading] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedTransactions = localStorage.getItem("transactions");
    const savedBudget = localStorage.getItem("monthlyBudget");

    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
    if (savedBudget) {
      setMonthlyBudget(parseFloat(savedBudget));
    }
  }, []);

  // Save transactions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

  // Save budget to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("monthlyBudget", monthlyBudget.toString());
  }, [monthlyBudget]);

  // Fetch exchange rates on mount
  useEffect(() => {
    const fetchRates = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "https://api.exchangerate-api.com/v4/latest/INR",
        );
        if (response.ok) {
          const data = await response.json();
          setExchangeRates(data.rates || {});
        }
      } catch (error) {
        console.error("Failed to fetch exchange rates:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
  }, []);

  const addTransaction = useCallback((transaction) => {
    setTransactions((prev) => [{ ...transaction }, ...prev]);
  }, []);

  const deleteTransaction = useCallback((id) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const updateTransaction = useCallback((id, updatedData) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updatedData } : t)),
    );
  }, []);

  const updateBudget = useCallback((amount) => {
    setMonthlyBudget(amount);
  }, []);

  const value = {
    transactions,
    addTransaction,
    deleteTransaction,
    updateTransaction,
    monthlyBudget,
    updateBudget,
    exchangeRates,
    loading,
  };

  return (
    <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
  );
};
