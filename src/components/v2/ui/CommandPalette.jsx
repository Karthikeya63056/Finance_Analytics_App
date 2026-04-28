import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiArrowRight, FiCommand } from 'react-icons/fi';
import { EventBus, Events } from '../../../core/EventBus';

const ROUTES = [
  { path: '/dashboard', label: 'Dashboard', section: 'Navigation', keywords: 'home overview' },
  { path: '/transactions', label: 'Transactions', section: 'Navigation', keywords: 'list activity' },
  { path: '/transactions/new', label: 'Add Transaction', section: 'Actions', keywords: 'new create add' },
  { path: '/analytics', label: 'Analytics', section: 'Navigation', keywords: 'charts insights data' },
  { path: '/budget', label: 'Budget', section: 'Navigation', keywords: 'spending limit goal' },
  { path: '/settings', label: 'Settings', section: 'Navigation', keywords: 'config preferences' },
  { path: '/dashboard-pro', label: 'Dashboard Pro', section: 'V2', keywords: 'pro advanced ai health' },
  { path: '/health-score', label: 'Health Score', section: 'V2', keywords: 'financial health score rating' },
  { path: '/automation', label: 'Automation Rules', section: 'V2', keywords: 'rules alerts auto smart' },
  { path: '/achievements', label: 'Achievements', section: 'V2', keywords: 'badges xp level gamification' },
  { path: '/weekly-report', label: 'Weekly Report', section: 'V2', keywords: 'report weekly summary ai narrative' },
  { path: '/data-manager', label: 'Data Manager', section: 'V2', keywords: 'data demo import export generate simulate' },
];

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Keyboard shortcut: Cmd/Ctrl + K
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((o) => !o);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen]);

  // Listen for EventBus open/close
  useEffect(() => {
    const unsub1 = EventBus.subscribe(Events.COMMAND_PALETTE_OPEN, () => setIsOpen(true));
    const unsub2 = EventBus.subscribe(Events.COMMAND_PALETTE_CLOSE, () => setIsOpen(false));
    return () => { unsub1(); unsub2(); };
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const filtered = useMemo(() => {
    if (!query.trim()) return ROUTES;
    const q = query.toLowerCase();
    return ROUTES.filter(
      (r) =>
        r.label.toLowerCase().includes(q) ||
        r.keywords.includes(q) ||
        r.section.toLowerCase().includes(q)
    );
  }, [query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [filtered.length]);

  const execute = useCallback((item) => {
    navigate(item.path);
    setIsOpen(false);
  }, [navigate]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      execute(filtered[selectedIndex]);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="v2-overlay"
          onClick={() => setIsOpen(false)}
          style={{ zIndex: 70 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="v2-glass w-full max-w-lg rounded-2xl p-2"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
              <FiSearch size={18} className="text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search commands, pages..."
                className="flex-1 bg-transparent text-sm text-gray-100 outline-none placeholder:text-gray-500"
              />
              <kbd className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-gray-400">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="v2-scrollbar max-h-72 overflow-y-auto py-2">
              {filtered.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-gray-500">
                  No results for "{query}"
                </div>
              ) : (
                filtered.map((item, idx) => (
                  <button
                    key={item.path}
                    onClick={() => execute(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm transition-colors ${
                      idx === selectedIndex
                        ? 'bg-emerald-500/15 text-emerald-200'
                        : 'text-gray-300 hover:bg-white/5'
                    }`}
                  >
                    <FiArrowRight size={14} className="text-gray-500" />
                    <span className="flex-1 font-medium">{item.label}</span>
                    <span className="text-[10px] uppercase tracking-wider text-gray-500">
                      {item.section}
                    </span>
                  </button>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center gap-4 border-t border-white/10 px-4 py-2 text-[10px] text-gray-500">
              <span className="flex items-center gap-1"><FiCommand size={10} /> Navigate</span>
              <span>↑↓ Select</span>
              <span>↵ Open</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
