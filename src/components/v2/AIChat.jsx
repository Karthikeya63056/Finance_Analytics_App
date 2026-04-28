import React, { useState, useRef, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageCircle, FiX, FiSend, FiMaximize2, FiMinimize2, FiZap, FiTrendingUp, FiShield, FiSearch, FiActivity } from 'react-icons/fi';
import { useAI } from '../../context/AIContext';
import { FinanceContext } from '../../context/FinanceContext';
import { AIEngine } from '../../ai/AIEngine';

const QUICK_ACTIONS = [
  { label: 'Analyze spending', icon: FiTrendingUp, prompt: 'Analyze my spending patterns' },
  { label: 'Budget check', icon: FiShield, prompt: 'How is my budget looking?' },
  { label: 'Find savings', icon: FiZap, prompt: 'Where can I save money?' },
  { label: 'Detect anomalies', icon: FiSearch, prompt: 'Find any unusual transactions' },
  { label: 'Health score', icon: FiActivity, prompt: 'What is my financial health score?' },
];

export function AIChat() {
  const { isOpen, isExpanded, messages, isAnalyzing, toggleChat, closeChat, toggleExpand, addMessage, setAnalyzing } = useAI();
  const { transactions, monthlyBudget } = useContext(FinanceContext);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = (text = input) => {
    const msg = text.trim();
    if (!msg) return;
    addMessage({ role: 'user', content: msg });
    setInput('');
    setAnalyzing(true);

    // Simulate brief processing delay for UX
    setTimeout(() => {
      try {
        const result = AIEngine.query(msg, { transactions, monthlyBudget });
        addMessage({ role: 'assistant', content: result.response, intent: result.intent, data: result.data });
      } catch (_) {
        addMessage({ role: 'assistant', content: "I encountered an issue analyzing your data. Try rephrasing your question or adding more transactions for better analysis." });
      }
      setAnalyzing(false);
    }, 400 + Math.random() * 600);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating trigger button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            onClick={toggleChat}
            className="v2-floating-btn bottom-20 right-5 md:bottom-6"
            aria-label="Open AI assistant"
          >
            <FiMessageCircle size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={`fixed z-50 flex flex-col v2-glass ${
              isExpanded
                ? 'inset-4 rounded-3xl'
                : 'bottom-20 right-4 h-[520px] w-[380px] rounded-3xl md:bottom-6'
            }`}
          >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/30 to-cyan-500/20">
                <FiZap size={16} className="text-emerald-300" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-100">Neon AI</p>
                <div className="flex items-center gap-1.5">
                  <div className="v2-pulse-dot" style={{ width: 6, height: 6 }} />
                  <span className="text-[10px] text-emerald-400">
                    {isAnalyzing ? 'Analyzing...' : 'Online'}
                  </span>
                </div>
              </div>
              <button onClick={toggleExpand} className="rounded-lg p-1.5 text-gray-400 transition hover:bg-white/5 hover:text-white">
                {isExpanded ? <FiMinimize2 size={14} /> : <FiMaximize2 size={14} />}
              </button>
              <button onClick={closeChat} className="rounded-lg p-1.5 text-gray-400 transition hover:bg-white/5 hover:text-white">
                <FiX size={16} />
              </button>
            </div>

            {/* Messages */}
            <div className="v2-scrollbar flex-1 overflow-y-auto px-5 py-4">
              {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 v2-animate-float">
                    <FiZap size={28} className="text-emerald-300" />
                  </div>
                  <p className="text-sm font-semibold text-gray-200">Hi! I'm your AI financial advisor</p>
                  <p className="mt-2 max-w-[260px] text-xs text-gray-500">
                    I analyze your transactions to provide spending insights, anomaly detection, forecasting, and personalized recommendations.
                  </p>
                  <div className="mt-5 flex flex-col gap-2">
                    {QUICK_ACTIONS.map((qa) => (
                      <button
                        key={qa.label}
                        onClick={() => handleSend(qa.prompt)}
                        className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs text-gray-300 transition hover:border-emerald-300/30 hover:bg-emerald-500/10 hover:text-emerald-200"
                      >
                        <qa.icon size={13} />
                        {qa.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-emerald-500/20 text-emerald-100'
                          : 'bg-white/5 text-gray-200'
                      }`}>
                        {msg.content.split('\n').map((line, i) => (
                          <React.Fragment key={i}>
                            {line.startsWith('📊') || line.startsWith('💡') || line.startsWith('→')
                              ? <span className="block mt-1 text-xs text-gray-400">{line}</span>
                              : line === ''
                              ? <br />
                              : <span className="block">{line}</span>
                            }
                          </React.Fragment>
                        ))}
                        {msg.intent && (
                          <span className="mt-2 inline-block rounded-md bg-emerald-500/10 px-2 py-0.5 text-[9px] uppercase tracking-wider text-emerald-400">
                            {msg.intent.replace(/_/g, ' ')}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  {isAnalyzing && (
                    <div className="flex justify-start">
                      <div className="rounded-2xl bg-white/5 px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-400" style={{ animationDelay: '0ms' }} />
                            <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-400" style={{ animationDelay: '150ms' }} />
                            <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-400" style={{ animationDelay: '300ms' }} />
                          </div>
                          <span className="text-[10px] text-gray-500">Analyzing your data...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-white/10 px-4 py-3">
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about your finances..."
                  className="flex-1 bg-transparent text-sm text-gray-100 outline-none placeholder:text-gray-500"
                  disabled={isAnalyzing}
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isAnalyzing}
                  className="rounded-lg p-1.5 text-emerald-400 transition hover:bg-emerald-500/15 disabled:opacity-30"
                >
                  <FiSend size={16} />
                </button>
              </div>
              <p className="mt-1.5 text-center text-[9px] text-gray-600">
                Powered by local AI · Your data never leaves your device
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
