import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { EventBus, Events } from '../core/EventBus';

const STORAGE_KEY = 'v2_theme';

const ThemeContext = createContext(null);

const ACCENTS = {
  emerald: { primary: '#10b981', rgb: '16, 185, 129' },
  cyan:    { primary: '#22d3ee', rgb: '34, 211, 238' },
  violet:  { primary: '#8b5cf6', rgb: '139, 92, 246' },
  rose:    { primary: '#f43f5e', rgb: '244, 63, 94' },
  amber:   { primary: '#f59e0b', rgb: '245, 158, 11' },
  blue:    { primary: '#3b82f6', rgb: '59, 130, 246' },
};

function getSystemTheme() {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function loadPrefs() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch (_) { /* ignore */ }
  return { mode: 'dark', accent: 'emerald' };
}

export function ThemeProvider({ children }) {
  const [prefs, setPrefs] = useState(loadPrefs);

  const resolvedMode = prefs.mode === 'system' ? getSystemTheme() : prefs.mode;
  const accent = ACCENTS[prefs.accent] || ACCENTS.emerald;

  // Apply theme to DOM
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolvedMode);
    document.documentElement.style.setProperty('--v2-accent-primary', accent.primary);
    document.documentElement.style.setProperty('--v2-accent-primary-rgb', accent.rgb);
  }, [resolvedMode, accent]);

  // Listen for system theme changes
  useEffect(() => {
    if (prefs.mode !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => setPrefs((p) => ({ ...p })); // trigger re-render
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [prefs.mode]);

  // Persist
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs)); } catch (_) {}
  }, [prefs]);

  const setMode = useCallback((mode) => {
    setPrefs((p) => ({ ...p, mode }));
    EventBus.publish(Events.THEME_CHANGED, { mode });
  }, []);

  const setAccent = useCallback((accentKey) => {
    if (ACCENTS[accentKey]) {
      setPrefs((p) => ({ ...p, accent: accentKey }));
    }
  }, []);

  const toggleMode = useCallback(() => {
    setPrefs((p) => {
      const next = p.mode === 'dark' ? 'light' : p.mode === 'light' ? 'system' : 'dark';
      EventBus.publish(Events.THEME_CHANGED, { mode: next });
      return { ...p, mode: next };
    });
  }, []);

  const value = {
    mode: prefs.mode,
    resolvedMode,
    accent: prefs.accent,
    accentColor: accent.primary,
    accents: Object.keys(ACCENTS),
    setMode,
    setAccent,
    toggleMode,
    isDark: resolvedMode === 'dark',
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

export { ThemeContext };
