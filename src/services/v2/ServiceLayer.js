/**
 * ServiceLayer — API abstraction for future backend integration
 *
 * Provides a unified interface that currently reads/writes to
 * localStorage but can be swapped to REST/GraphQL endpoints.
 */

export class ServiceLayer {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || '/api/v2';
    this.mode = options.mode || 'local'; // 'local' | 'api'
  }

  // ── Transaction Operations ─────────────────────────────

  async getTransactions() {
    if (this.mode === 'local') {
      return this._getLocal('transactions', []);
    }
    return this._fetch('/transactions');
  }

  async addTransaction(transaction) {
    if (this.mode === 'local') {
      const txns = this._getLocal('transactions', []);
      const newTxn = { id: crypto.randomUUID(), ...transaction };
      txns.push(newTxn);
      this._setLocal('transactions', txns);
      return newTxn;
    }
    return this._fetch('/transactions', { method: 'POST', body: transaction });
  }

  async deleteTransaction(id) {
    if (this.mode === 'local') {
      const txns = this._getLocal('transactions', []);
      this._setLocal('transactions', txns.filter((t) => t.id !== id));
      return { success: true };
    }
    return this._fetch(`/transactions/${id}`, { method: 'DELETE' });
  }

  // ── Budget Operations ──────────────────────────────────

  async getBudget() {
    if (this.mode === 'local') {
      return this._getLocal('monthlyBudget', 0);
    }
    return this._fetch('/budget');
  }

  async setBudget(amount) {
    if (this.mode === 'local') {
      this._setLocal('monthlyBudget', amount);
      return { budget: amount };
    }
    return this._fetch('/budget', { method: 'PUT', body: { amount } });
  }

  // ── Analytics Operations ───────────────────────────────

  async getAnalytics(period = 'month') {
    if (this.mode === 'local') {
      const txns = this._getLocal('transactions', []);
      return this._computeLocalAnalytics(txns, period);
    }
    return this._fetch(`/analytics?period=${period}`);
  }

  // ── AI Operations ──────────────────────────────────────

  async queryAI(question, context) {
    if (this.mode === 'local') {
      // Delegated to AIEngine directly in local mode
      const { AIEngine } = await import('../../ai/AIEngine');
      return AIEngine.query(question, context);
    }
    return this._fetch('/ai/query', { method: 'POST', body: { question, context } });
  }

  // ── Export Operations ──────────────────────────────────

  async exportData(format = 'json') {
    const txns = await this.getTransactions();
    const budget = await this.getBudget();

    if (format === 'json') {
      return JSON.stringify({ transactions: txns, budget, exportedAt: new Date().toISOString() }, null, 2);
    }

    if (format === 'csv') {
      const headers = 'Date,Title,Amount,Type,Category\n';
      const rows = txns.map((t) => `${t.date},${t.title},${t.amount},${t.type},${t.category}`).join('\n');
      return headers + rows;
    }

    return null;
  }

  async importData(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data.transactions) this._setLocal('transactions', data.transactions);
      if (data.budget) this._setLocal('monthlyBudget', data.budget);
      return { success: true, imported: data.transactions?.length || 0 };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  // ── Private helpers ────────────────────────────────────

  /** @private */
  _getLocal(key, fallback) {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : fallback;
    } catch (_) {
      return fallback;
    }
  }

  /** @private */
  _setLocal(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (_) { /* ignore */ }
  }

  /** @private */
  async _fetch(path, options = {}) {
    const { method = 'GET', body } = options;
    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    return res.json();
  }

  /** @private */
  _computeLocalAnalytics(txns, period) {
    const expenses = txns.filter((t) => t.type === 'expense');
    const income = txns.filter((t) => t.type === 'income');
    return {
      totalExpenses: expenses.reduce((s, t) => s + t.amount, 0),
      totalIncome: income.reduce((s, t) => s + t.amount, 0),
      transactionCount: txns.length,
      period,
    };
  }
}

export const serviceLayer = new ServiceLayer();
