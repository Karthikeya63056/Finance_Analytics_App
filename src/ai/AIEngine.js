/**
 * AIEngine — Core financial intelligence reasoning engine
 *
 * Orchestrates:
 * - AnomalyDetector for outlier detection
 * - InsightGenerator for structured insights
 * - PromptPipeline for NL query processing
 * - FinancialMemory for context persistence
 * - CacheManager for computation caching
 *
 * Provides a unified `query()` method for the AI chat and
 * a `runAnalysis()` method for background analysis.
 */

import { AnomalyDetector } from './AnomalyDetector';
import { InsightGenerator } from './InsightGenerator';
import { PromptPipeline } from './PromptPipeline';
import { FinancialMemory } from './FinancialMemory';
import { CacheManager } from '../core/CacheManager';
import { EventBus, Events } from '../core/EventBus';

class AIEngineCore {
  constructor() {
    this.anomalyDetector = new AnomalyDetector();
    this.insightGenerator = new InsightGenerator();
    this.promptPipeline = new PromptPipeline();
    this.memory = new FinancialMemory();
    this._initialized = false;
  }

  /**
   * Process a natural language query from the user
   * @param {string} userQuery - The user's question
   * @param {Object} financialData - { transactions, monthlyBudget }
   * @returns {{ response: string, intent: string, reasoning: Object, data: Object }}
   */
  query(userQuery, financialData) {
    const { transactions = [], monthlyBudget = 0 } = financialData;

    // Store in conversation memory
    this.memory.addToConversation({ role: 'user', content: userQuery });

    // Parse intent
    const { intent, params, confidence } = this.promptPipeline.parseIntent(userQuery);

    // Handle special intents
    if (intent === 'greeting') {
      const resp = this._greetingResponse();
      this.memory.addToConversation({ role: 'assistant', content: resp });
      return { response: resp, intent, reasoning: null, data: null };
    }

    if (intent === 'help') {
      const resp = this._helpResponse();
      this.memory.addToConversation({ role: 'assistant', content: resp });
      return { response: resp, intent, reasoning: null, data: null };
    }

    // Run analysis for the intent
    const analysisResult = this._runIntentAnalysis(intent, params, transactions, monthlyBudget);

    // Build reasoning chain
    const reasoning = this.promptPipeline.buildReasoning(intent, analysisResult);

    // Format response
    const response = this.promptPipeline.formatResponse(intent, reasoning, analysisResult);

    // Store response in memory
    this.memory.addToConversation({ role: 'assistant', content: response });

    // Publish event
    EventBus.publish(Events.AI_CHAT_RESPONSE, { intent, confidence });

    return { response, intent, reasoning, data: analysisResult };
  }

  /**
   * Run comprehensive background analysis
   * @param {Array} transactions
   * @param {number} monthlyBudget
   * @returns {Object} Full analysis results
   */
  runAnalysis(transactions, monthlyBudget) {
    const cacheKey = `analysis_${transactions.length}_${monthlyBudget}`;
    const cached = CacheManager.get(cacheKey);
    if (cached) return cached;

    const expenses = transactions.filter((t) => t.type === 'expense');
    const income = transactions.filter((t) => t.type === 'income');

    const totalExpenses = expenses.reduce((s, t) => s + t.amount, 0);
    const totalIncome = income.reduce((s, t) => s + t.amount, 0);

    // Category breakdown
    const categoryBreakdown = {};
    expenses.forEach((t) => {
      categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount;
    });

    const topCategoryEntry = Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1])[0];

    // Anomaly detection
    const anomalies = this.anomalyDetector.detect(transactions);

    // Insights
    const insights = this.insightGenerator.generateAll(transactions, monthlyBudget);

    // Monthly trend
    const monthlyTrend = this._computeMonthlyTrend(transactions);

    // Spending forecast
    const forecast = this._simpleForecast(monthlyTrend);

    // Financial personality
    const personality = this._detectPersonality(transactions, monthlyBudget);

    // Money mood
    const moneyMood = this._computeMoneyMood(transactions, monthlyBudget);

    const result = {
      totalExpenses,
      totalIncome,
      netBalance: totalIncome - totalExpenses,
      savingsRate: totalIncome > 0 ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100) : 0,
      categoryBreakdown,
      topCategory: topCategoryEntry ? { name: topCategoryEntry[0], amount: topCategoryEntry[1] } : null,
      transactionCount: transactions.length,
      anomalies,
      anomalyCount: anomalies.length,
      insights,
      monthlyTrend,
      forecast,
      personality,
      moneyMood,
      analyzedAt: Date.now(),
    };

    // Cache for 30 seconds
    CacheManager.set(cacheKey, result, 30000);

    // Store spending signature in long-term memory
    this.memory.addSpendingSignature({
      totalExpenses,
      totalIncome,
      savingsRate: result.savingsRate,
      topCategory: result.topCategory?.name,
      anomalyCount: anomalies.length,
    });

    EventBus.publish(Events.AI_ANALYSIS_COMPLETE, {
      insightCount: insights.length,
      anomalyCount: anomalies.length,
    });

    return result;
  }

  /**
   * Generate weekly report
   */
  generateWeeklyReport(transactions, monthlyBudget) {
    return this.insightGenerator.generateWeeklyReport(transactions, monthlyBudget);
  }

  /** @private */
  _runIntentAnalysis(intent, params, transactions, monthlyBudget) {
    const expenses = transactions.filter((t) => t.type === 'expense');
    const totalExpenses = expenses.reduce((s, t) => s + t.amount, 0);
    const totalIncome = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);

    const now = new Date();
    const monthExp = expenses.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).reduce((s, t) => s + t.amount, 0);

    const categoryBreakdown = {};
    expenses.forEach((t) => { categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount; });

    const topEntry = Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1])[0];

    switch (intent) {
      case 'spending_analysis':
        return {
          totalExpenses,
          totalIncome,
          categoryBreakdown,
          topCategory: topEntry ? { name: topEntry[0], amount: topEntry[1] } : null,
          transactionCount: transactions.length,
        };

      case 'budget_check':
        return {
          budget: monthlyBudget,
          spent: monthExp,
          remaining: Math.max(0, monthlyBudget - monthExp),
          percentage: monthlyBudget > 0 ? Math.round((monthExp / monthlyBudget) * 100) : 0,
        };

      case 'savings': {
        const sr = totalIncome > 0 ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100) : 0;
        const opportunities = [];
        for (const [cat, amount] of Object.entries(categoryBreakdown)) {
          if (amount / totalExpenses > 0.25) {
            opportunities.push(`Reduce ${cat} spending (currently ${Math.round(amount / totalExpenses * 100)}% of expenses)`);
          }
        }
        return { totalIncome, totalExpenses, savingsRate: sr, savingsOpportunities: opportunities.length > 0 ? opportunities : ['Track more transactions for better suggestions'] };
      }

      case 'anomaly': {
        const anomalies = this.anomalyDetector.detect(transactions);
        return { transactionCount: transactions.length, anomalyCount: anomalies.length, anomalies: anomalies.slice(0, 5) };
      }

      case 'forecast': {
        const trend = this._computeMonthlyTrend(transactions);
        const fc = this._simpleForecast(trend);
        return { dataPoints: trend.length, forecast: fc.predicted, direction: fc.direction, confidence: fc.confidence };
      }

      case 'health_score': {
        const score = this._computeHealthScore(transactions, monthlyBudget);
        return score;
      }

      default:
        return { totalExpenses, totalIncome, transactionCount: transactions.length };
    }
  }

  /** @private */
  _computeMonthlyTrend(transactions) {
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const exp = transactions.filter((t) => {
        const d = new Date(t.date);
        return t.type === 'expense' && d.getMonth() === m.getMonth() && d.getFullYear() === m.getFullYear();
      }).reduce((s, t) => s + t.amount, 0);
      months.push({ month: `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, '0')}`, amount: exp });
    }
    return months;
  }

  /** @private */
  _simpleForecast(monthlyTrend) {
    const amounts = monthlyTrend.map((m) => m.amount).filter((a) => a > 0);
    if (amounts.length < 2) return { predicted: 0, direction: 'stable', confidence: 'low' };

    // Weighted moving average (recent months weighted more)
    const weights = amounts.map((_, i) => i + 1);
    const totalWeight = weights.reduce((s, w) => s + w, 0);
    const wma = amounts.reduce((s, a, i) => s + a * weights[i], 0) / totalWeight;

    // Simple trend direction
    const recent = amounts.slice(-2);
    const direction = recent.length === 2
      ? recent[1] > recent[0] * 1.05 ? 'increasing' : recent[1] < recent[0] * 0.95 ? 'decreasing' : 'stable'
      : 'stable';

    return {
      predicted: Math.round(wma),
      direction,
      confidence: amounts.length >= 4 ? 'medium' : 'low',
      basedOn: amounts.length,
    };
  }

  /** @private */
  _computeHealthScore(transactions, monthlyBudget) {
    const now = new Date();
    const expenses = transactions.filter((t) => t.type === 'expense');
    const income = transactions.filter((t) => t.type === 'income');
    const totalExp = expenses.reduce((s, t) => s + t.amount, 0);
    const totalInc = income.reduce((s, t) => s + t.amount, 0);
    const monthExp = expenses.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).reduce((s, t) => s + t.amount, 0);

    const ba = monthlyBudget > 0 ? Math.max(0, Math.min(100, 100 - (monthExp / monthlyBudget) * 100)) : 50;
    const sr = totalInc > 0 ? Math.max(0, Math.min(100, ((totalInc - totalExp) / totalInc) * 100)) : 0;
    const cats = new Set(expenses.map((t) => t.category));
    const div = Math.min((cats.size / 6) * 100, 100);
    const trend = totalInc > totalExp ? 75 : 35;
    const consistency = Math.min(transactions.length * 2, 100);

    const score = Math.round(ba * 0.25 + sr * 0.25 + div * 0.15 + trend * 0.15 + consistency * 0.2);
    const clamped = Math.max(0, Math.min(100, score));

    const grade = clamped >= 90 ? 'A+' : clamped >= 80 ? 'A' : clamped >= 70 ? 'B+' : clamped >= 60 ? 'B' : clamped >= 50 ? 'C' : 'D';

    const tips = [];
    if (ba < 60) tips.push('Reduce spending to stay within budget');
    if (sr < 30) tips.push('Aim for 20-30% savings rate');
    if (div < 40) tips.push('Track spending across more categories');
    if (tips.length === 0) tips.push('Keep up the great financial habits!');

    return { score: clamped, grade, tips };
  }

  /** @private */
  _detectPersonality(transactions, monthlyBudget) {
    const expenses = transactions.filter((t) => t.type === 'expense');
    if (expenses.length < 5) return { type: 'New Explorer', description: 'Just getting started on your financial journey', emoji: '🌱' };

    const totalInc = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExp = expenses.reduce((s, t) => s + t.amount, 0);
    const savingsRate = totalInc > 0 ? ((totalInc - totalExp) / totalInc) * 100 : 0;
    const cats = new Set(expenses.map((t) => t.category));

    if (savingsRate > 40) return { type: 'Super Saver', description: 'You prioritize saving and live well below your means', emoji: '🏦' };
    if (savingsRate > 20 && cats.size <= 3) return { type: 'Focused Spender', description: 'You spend deliberately in select categories', emoji: '🎯' };
    if (cats.size >= 6) return { type: 'Life Explorer', description: 'You invest in diverse experiences and categories', emoji: '🌍' };
    if (savingsRate > 15) return { type: 'Balanced Planner', description: 'You maintain a healthy balance between spending and saving', emoji: '⚖️' };
    if (savingsRate < 5) return { type: 'Living Large', description: 'You enjoy spending — consider building an emergency fund', emoji: '🎉' };
    return { type: 'Steady Navigator', description: 'Consistent and predictable financial patterns', emoji: '🧭' };
  }

  /** @private */
  _computeMoneyMood(transactions, monthlyBudget) {
    const now = new Date();
    const thisWeek = transactions.filter((t) => {
      const d = new Date(t.date);
      return t.type === 'expense' && (now - d) < 7 * 86400000;
    });
    const lastWeek = transactions.filter((t) => {
      const d = new Date(t.date);
      return t.type === 'expense' && (now - d) >= 7 * 86400000 && (now - d) < 14 * 86400000;
    });

    const thisTotal = thisWeek.reduce((s, t) => s + t.amount, 0);
    const lastTotal = lastWeek.reduce((s, t) => s + t.amount, 0);

    if (thisTotal === 0) return { mood: 'Zen', emoji: '🧘', reason: 'No spending this week' };
    if (lastTotal > 0 && thisTotal > lastTotal * 1.5) return { mood: 'Splurging', emoji: '💸', reason: 'Spending is up 50%+ from last week' };
    if (lastTotal > 0 && thisTotal < lastTotal * 0.6) return { mood: 'Frugal', emoji: '🤑', reason: 'Spending is down 40%+ from last week' };
    if (monthlyBudget > 0 && thisTotal > monthlyBudget / 4) return { mood: 'Cautious', emoji: '😬', reason: 'Weekly spend exceeds budget quarter' };
    return { mood: 'Balanced', emoji: '😌', reason: 'Spending is steady and predictable' };
  }

  /** @private */
  _greetingResponse() {
    const greetings = [
      "Hello! 👋 I'm Neon AI, your personal financial intelligence advisor. I can analyze your spending, detect anomalies, forecast trends, and help optimize your budget. What would you like to know?",
      "Hey there! 🚀 Ready to dive into your financial data. I can run spending analysis, check your budget health, find savings opportunities, or scan for unusual transactions. Just ask!",
      "Hi! 💡 I'm here to help you make smarter financial decisions. Ask me about your spending patterns, budget health, or financial forecast.",
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  /** @private */
  _helpResponse() {
    return `Here's what I can do for you:

📊 **Spending Analysis** — "Analyze my spending" or "Where does my money go?"
💰 **Budget Check** — "How's my budget?" or "Am I on track?"
🔍 **Anomaly Detection** — "Find unusual transactions" or "Any anomalies?"
📈 **Forecasting** — "Predict next month's spending" or "What's the trend?"
💚 **Health Score** — "What's my financial health?" or "Rate my finances"
💡 **Savings Tips** — "Where can I save?" or "Help me cut costs"

Just type naturally — I understand financial questions in plain English!`;
  }
}

/** Singleton AI Engine */
export const AIEngine = new AIEngineCore();
