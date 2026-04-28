import React, { createContext, useState, useCallback, useEffect, useContext } from 'react';

const STORAGE_KEY = 'v2_automation_rules';
const AutomationContext = createContext(null);

function loadRules() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch (_) {}
  return [];
}

export function AutomationProvider({ children }) {
  const [rules, setRules] = useState(loadRules);
  const [alerts, setAlerts] = useState([]);
  const [executionLog, setExecutionLog] = useState([]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(rules)); } catch (_) {}
  }, [rules]);

  const addRule = useCallback((rule) => {
    setRules((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        enabled: true,
        ...rule,
      },
    ]);
  }, []);

  const updateRule = useCallback((id, updates) => {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  }, []);

  const deleteRule = useCallback((id) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const toggleRule = useCallback((id) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  }, []);

  const addAlert = useCallback((alert) => {
    const newAlert = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      read: false,
      ...alert,
    };
    setAlerts((prev) => [newAlert, ...prev].slice(0, 100));
    return newAlert;
  }, []);

  const markAlertRead = useCallback((id) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, read: true } : a)));
  }, []);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  const logExecution = useCallback((entry) => {
    setExecutionLog((prev) => [
      { id: crypto.randomUUID(), timestamp: Date.now(), ...entry },
      ...prev,
    ].slice(0, 200));
  }, []);

  const unreadCount = alerts.filter((a) => !a.read).length;

  const value = {
    rules,
    alerts,
    unreadCount,
    executionLog,
    addRule,
    updateRule,
    deleteRule,
    toggleRule,
    addAlert,
    markAlertRead,
    clearAlerts,
    logExecution,
  };

  return (
    <AutomationContext.Provider value={value}>
      {children}
    </AutomationContext.Provider>
  );
}

export function useAutomation() {
  const ctx = useContext(AutomationContext);
  if (!ctx) throw new Error('useAutomation must be used within AutomationProvider');
  return ctx;
}

export { AutomationContext };
