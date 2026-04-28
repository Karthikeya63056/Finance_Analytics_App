import React, { createContext, useState, useCallback, useContext } from 'react';

const AIContext = createContext(null);

const INITIAL_STATE = {
  messages: [],
  isOpen: false,
  isExpanded: false,
  isAnalyzing: false,
  insights: [],
  activeAnalysis: null,
};

export function AIProvider({ children }) {
  const [state, setState] = useState(INITIAL_STATE);

  const openChat = useCallback(() => {
    setState((s) => ({ ...s, isOpen: true }));
  }, []);

  const closeChat = useCallback(() => {
    setState((s) => ({ ...s, isOpen: false, isExpanded: false }));
  }, []);

  const toggleChat = useCallback(() => {
    setState((s) => ({ ...s, isOpen: !s.isOpen }));
  }, []);

  const toggleExpand = useCallback(() => {
    setState((s) => ({ ...s, isExpanded: !s.isExpanded }));
  }, []);

  const addMessage = useCallback((message) => {
    setState((s) => ({
      ...s,
      messages: [...s.messages, {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        ...message,
      }],
    }));
  }, []);

  const setAnalyzing = useCallback((isAnalyzing) => {
    setState((s) => ({ ...s, isAnalyzing }));
  }, []);

  const addInsight = useCallback((insight) => {
    setState((s) => ({
      ...s,
      insights: [
        { id: crypto.randomUUID(), timestamp: Date.now(), ...insight },
        ...s.insights,
      ].slice(0, 50),
    }));
  }, []);

  const clearMessages = useCallback(() => {
    setState((s) => ({ ...s, messages: [] }));
  }, []);

  const clearInsights = useCallback(() => {
    setState((s) => ({ ...s, insights: [] }));
  }, []);

  const value = {
    ...state,
    openChat,
    closeChat,
    toggleChat,
    toggleExpand,
    addMessage,
    setAnalyzing,
    addInsight,
    clearMessages,
    clearInsights,
  };

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
}

export function useAI() {
  const ctx = useContext(AIContext);
  if (!ctx) throw new Error('useAI must be used within AIProvider');
  return ctx;
}

export { AIContext };
