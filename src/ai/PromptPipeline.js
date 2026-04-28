/**
 * PromptPipeline — Natural language query processing and response orchestration
 *
 * Parses user queries into structured intents, routes them to the appropriate
 * analysis functions, and formats responses with reasoning chains.
 */

export class PromptPipeline {
  constructor() {
    this._intents = this._buildIntentMap();
  }

  /**
   * Process a natural language query and return a structured intent
   * @param {string} query - User's natural language input
   * @returns {{ intent: string, params: Object, confidence: number }}
   */
  parseIntent(query) {
    const q = query.toLowerCase().trim();

    let bestMatch = { intent: 'general', params: {}, confidence: 0.3 };

    for (const [intent, config] of Object.entries(this._intents)) {
      for (const pattern of config.patterns) {
        if (pattern.test(q)) {
          const confidence = config.priority / 100;
          if (confidence > bestMatch.confidence) {
            bestMatch = {
              intent,
              params: this._extractParams(q, intent),
              confidence,
            };
          }
        }
      }
    }

    return bestMatch;
  }

  /**
   * Build a reasoning chain for the AI response
   * @param {string} intent
   * @param {Object} analysisResult - Data from AIEngine analysis
   * @returns {{ reasoning: string[], conclusion: string, suggestions: string[] }}
   */
  buildReasoning(intent, analysisResult) {
    const chain = { reasoning: [], conclusion: '', suggestions: [] };

    switch (intent) {
      case 'spending_analysis':
        chain.reasoning = [
          `Analyzed ${analysisResult.transactionCount || 0} transactions`,
          `Total expenses: ₹${(analysisResult.totalExpenses || 0).toLocaleString('en-IN')}`,
          `Top category: ${analysisResult.topCategory?.name || 'N/A'}`,
        ];
        chain.conclusion = analysisResult.totalExpenses > 0
          ? `Your spending is distributed across ${Object.keys(analysisResult.categoryBreakdown || {}).length} categories.`
          : 'No expense data found. Start logging transactions for analysis.';
        chain.suggestions = ['Review your top spending category', 'Set category-level budgets'];
        break;

      case 'budget_check':
        chain.reasoning = [
          `Monthly budget: ₹${(analysisResult.budget || 0).toLocaleString('en-IN')}`,
          `Spent this month: ₹${(analysisResult.spent || 0).toLocaleString('en-IN')}`,
          `Usage: ${analysisResult.percentage || 0}%`,
        ];
        chain.conclusion = (analysisResult.percentage || 0) > 80
          ? 'Your budget usage is high. Consider reducing discretionary spending.'
          : 'Your budget is within a healthy range. Keep it up!';
        chain.suggestions = (analysisResult.percentage || 0) > 80
          ? ['Cut back on top spending categories', 'Defer non-essential purchases']
          : ['Maintain this spending discipline', 'Consider allocating savings to goals'];
        break;

      case 'savings':
        chain.reasoning = [
          `Total income: ₹${(analysisResult.totalIncome || 0).toLocaleString('en-IN')}`,
          `Total expenses: ₹${(analysisResult.totalExpenses || 0).toLocaleString('en-IN')}`,
          `Savings rate: ${analysisResult.savingsRate || 0}%`,
        ];
        chain.conclusion = (analysisResult.savingsRate || 0) >= 20
          ? 'Your savings rate is healthy (≥20%). You\'re building a solid financial cushion.'
          : 'Your savings rate is below the recommended 20%. Look for categories to optimize.';
        chain.suggestions = analysisResult.savingsOpportunities || ['Track all expenses consistently'];
        break;

      case 'anomaly':
        chain.reasoning = [
          `Scanned ${analysisResult.transactionCount || 0} transactions`,
          `Found ${analysisResult.anomalyCount || 0} anomalies`,
          `Detection methods: z-score, IQR, velocity analysis`,
        ];
        chain.conclusion = (analysisResult.anomalyCount || 0) > 0
          ? `Detected ${analysisResult.anomalyCount} unusual transactions that deviate from your normal patterns.`
          : 'No anomalies detected. Your spending patterns are consistent.';
        chain.suggestions = (analysisResult.anomalyCount || 0) > 0
          ? ['Review flagged transactions', 'Check for unauthorized charges']
          : ['Your spending consistency is a positive signal'];
        break;

      case 'forecast':
        chain.reasoning = [
          'Used weighted moving average model',
          `Based on ${analysisResult.dataPoints || 0} months of data`,
          `Projected trend: ${analysisResult.direction || 'stable'}`,
        ];
        chain.conclusion = `Based on your spending history, next month's projected expenses are ₹${(analysisResult.forecast || 0).toLocaleString('en-IN')}.`;
        chain.suggestions = ['Plan ahead for projected expenses', 'Set aside savings early'];
        break;

      case 'health_score':
        chain.reasoning = [
          `Overall score: ${analysisResult.score || 0}/100`,
          `Grade: ${analysisResult.grade || 'N/A'}`,
          `Key factors evaluated: budget adherence, savings rate, diversity, trend, consistency`,
        ];
        chain.conclusion = (analysisResult.score || 0) >= 70
          ? 'Your financial health is strong. Focus on maintaining these habits.'
          : 'There\'s room for improvement. Focus on the lowest-scoring factors.';
        chain.suggestions = analysisResult.tips || ['Log transactions consistently'];
        break;

      default:
        chain.reasoning = ['Processing your query against financial data'];
        chain.conclusion = 'I can help with spending analysis, budget checks, savings advice, anomaly detection, forecasting, and health scores.';
        chain.suggestions = [
          'Try: "Analyze my spending"',
          'Try: "How\'s my budget?"',
          'Try: "Find anomalies"',
        ];
    }

    return chain;
  }

  /**
   * Format the AI response as human-readable text
   */
  formatResponse(intent, reasoning, analysisResult) {
    const parts = [];

    // Main answer
    parts.push(reasoning.conclusion);

    // Key data points
    if (reasoning.reasoning.length > 0) {
      parts.push('');
      parts.push('📊 ' + reasoning.reasoning.filter(Boolean).join(' · '));
    }

    // Suggestions
    if (reasoning.suggestions.length > 0) {
      parts.push('');
      parts.push('💡 ' + reasoning.suggestions[0]);
      if (reasoning.suggestions.length > 1) {
        parts.push('→ ' + reasoning.suggestions.slice(1).join(' · '));
      }
    }

    return parts.join('\n');
  }

  /** @private */
  _buildIntentMap() {
    return {
      spending_analysis: {
        patterns: [
          /spend/i, /expense/i, /where.*money/i, /breakdown/i,
          /category/i, /how much.*spent/i, /analyz/i,
        ],
        priority: 80,
      },
      budget_check: {
        patterns: [
          /budget/i, /limit/i, /how.*doing/i, /on track/i,
          /remaining/i, /left.*month/i,
        ],
        priority: 75,
      },
      savings: {
        patterns: [
          /sav/i, /cut.*cost/i, /reduc/i, /optimi/i,
          /afford/i, /extra/i,
        ],
        priority: 70,
      },
      anomaly: {
        patterns: [
          /anomal/i, /unusual/i, /weird/i, /suspicious/i,
          /outlier/i, /fraud/i, /strange/i,
        ],
        priority: 85,
      },
      forecast: {
        patterns: [
          /forecast/i, /predict/i, /project/i, /future/i,
          /next month/i, /expect/i, /trend/i,
        ],
        priority: 65,
      },
      health_score: {
        patterns: [
          /health/i, /score/i, /grade/i, /rating/i,
          /overall/i, /how.*am.*i/i,
        ],
        priority: 60,
      },
      greeting: {
        patterns: [
          /^(hi|hello|hey|howdy|sup)/i, /good (morning|afternoon|evening)/i,
        ],
        priority: 20,
      },
      help: {
        patterns: [
          /help/i, /what can you/i, /capabilities/i, /features/i,
        ],
        priority: 15,
      },
    };
  }

  /** @private */
  _extractParams(query, intent) {
    const params = {};

    // Extract category mentions
    const categories = ['food', 'dining', 'transport', 'entertainment', 'utilities', 'healthcare', 'shopping', 'travel', 'salary'];
    for (const cat of categories) {
      if (query.includes(cat)) {
        params.category = cat;
        break;
      }
    }

    // Extract time references
    if (/this week/i.test(query)) params.period = 'week';
    else if (/this month/i.test(query)) params.period = 'month';
    else if (/last month/i.test(query)) params.period = 'lastMonth';
    else if (/today/i.test(query)) params.period = 'today';

    // Extract amounts
    const amountMatch = query.match(/₹?\s*(\d[\d,]*)/);
    if (amountMatch) {
      params.amount = parseInt(amountMatch[1].replace(/,/g, ''), 10);
    }

    return params;
  }
}
