/**
 * FinancialMemory — Multi-layer context memory for AI reasoning
 *
 * Layers:
 * - Short-term: current conversation thread (in-memory)
 * - Medium-term: session insights and derived patterns (sessionStorage)
 * - Long-term: persistent spending signatures, goals, preferences (localStorage)
 *
 * All stored under v2_* keys — never touches existing 'transactions' or 'monthlyBudget' keys.
 */

const LONG_TERM_KEY = 'v2_financial_memory';
const SESSION_KEY = 'v2_session_memory';

export class FinancialMemory {
  constructor() {
    this._shortTerm = [];
    this._maxShortTerm = 20;
    this._mediumTerm = this._loadSession();
    this._longTerm = this._loadLongTerm();
  }

  // ── Short-term (conversation context) ─────────────────

  addToConversation(entry) {
    this._shortTerm.push({
      ...entry,
      timestamp: Date.now(),
    });
    if (this._shortTerm.length > this._maxShortTerm) {
      this._shortTerm = this._shortTerm.slice(-this._maxShortTerm);
    }
  }

  getConversation() {
    return [...this._shortTerm];
  }

  getRecentContext(count = 5) {
    return this._shortTerm.slice(-count);
  }

  clearConversation() {
    this._shortTerm = [];
  }

  // ── Medium-term (session insights) ────────────────────

  setSessionInsight(key, value) {
    this._mediumTerm[key] = { value, timestamp: Date.now() };
    this._saveSession();
  }

  getSessionInsight(key) {
    const entry = this._mediumTerm[key];
    return entry ? entry.value : null;
  }

  getAllSessionInsights() {
    const result = {};
    for (const [k, v] of Object.entries(this._mediumTerm)) {
      result[k] = v.value;
    }
    return result;
  }

  // ── Long-term (persistent patterns) ───────────────────

  setPattern(key, value) {
    this._longTerm.patterns[key] = { value, updatedAt: Date.now() };
    this._saveLongTerm();
  }

  getPattern(key) {
    const entry = this._longTerm.patterns[key];
    return entry ? entry.value : null;
  }

  setPreference(key, value) {
    this._longTerm.preferences[key] = value;
    this._saveLongTerm();
  }

  getPreference(key, fallback = null) {
    return this._longTerm.preferences[key] ?? fallback;
  }

  addSpendingSignature(signature) {
    this._longTerm.signatures.push({
      ...signature,
      recordedAt: Date.now(),
    });
    // Keep last 50 signatures
    if (this._longTerm.signatures.length > 50) {
      this._longTerm.signatures = this._longTerm.signatures.slice(-50);
    }
    this._saveLongTerm();
  }

  getSpendingSignatures() {
    return [...this._longTerm.signatures];
  }

  /**
   * Build a context summary for AI prompts
   * Aggregates relevant memory across all layers
   */
  buildContext(topic = 'general') {
    const ctx = {
      conversationLength: this._shortTerm.length,
      recentMessages: this._shortTerm.slice(-3).map((m) => ({
        role: m.role,
        content: m.content?.substring(0, 200),
      })),
      sessionInsights: this.getAllSessionInsights(),
      patterns: {},
      preferences: this._longTerm.preferences,
    };

    // Include relevant patterns based on topic
    for (const [key, entry] of Object.entries(this._longTerm.patterns)) {
      if (topic === 'general' || key.includes(topic)) {
        ctx.patterns[key] = entry.value;
      }
    }

    return ctx;
  }

  // ── Persistence ───────────────────────────────────────

  /** @private */
  _loadSession() {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (_) {
      return {};
    }
  }

  /** @private */
  _saveSession() {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(this._mediumTerm));
    } catch (_) { /* ignore */ }
  }

  /** @private */
  _loadLongTerm() {
    try {
      const stored = localStorage.getItem(LONG_TERM_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          patterns: parsed.patterns || {},
          preferences: parsed.preferences || {},
          signatures: parsed.signatures || [],
        };
      }
    } catch (_) { /* ignore */ }
    return { patterns: {}, preferences: {}, signatures: [] };
  }

  /** @private */
  _saveLongTerm() {
    try {
      localStorage.setItem(LONG_TERM_KEY, JSON.stringify(this._longTerm));
    } catch (_) { /* ignore */ }
  }

  /** Reset all memory layers */
  reset() {
    this._shortTerm = [];
    this._mediumTerm = {};
    this._longTerm = { patterns: {}, preferences: {}, signatures: [] };
    this._saveSession();
    this._saveLongTerm();
  }
}
