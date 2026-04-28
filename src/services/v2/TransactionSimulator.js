/**
 * TransactionSimulator — Generates realistic demo transactions
 *
 * Used for showcasing AI capabilities and testing.
 * Generates 3-6 months of realistic financial data.
 */

const EXPENSE_TEMPLATES = [
  { title: 'Grocery Store', category: 'Food & Dining', min: 200, max: 1500, freq: 8 },
  { title: 'Restaurant', category: 'Food & Dining', min: 300, max: 2000, freq: 4 },
  { title: 'Coffee Shop', category: 'Food & Dining', min: 80, max: 350, freq: 10 },
  { title: 'Uber Ride', category: 'Transport', min: 100, max: 500, freq: 6 },
  { title: 'Metro Pass', category: 'Transport', min: 500, max: 1500, freq: 1 },
  { title: 'Fuel', category: 'Transport', min: 800, max: 3000, freq: 2 },
  { title: 'Movie Tickets', category: 'Entertainment', min: 300, max: 800, freq: 2 },
  { title: 'Netflix', category: 'Entertainment', min: 199, max: 649, freq: 1 },
  { title: 'Spotify', category: 'Entertainment', min: 119, max: 179, freq: 1 },
  { title: 'Electricity Bill', category: 'Utilities', min: 800, max: 3000, freq: 1 },
  { title: 'Internet Bill', category: 'Utilities', min: 600, max: 1200, freq: 1 },
  { title: 'Mobile Recharge', category: 'Utilities', min: 199, max: 599, freq: 1 },
  { title: 'Doctor Visit', category: 'Healthcare', min: 500, max: 2000, freq: 0.5 },
  { title: 'Pharmacy', category: 'Healthcare', min: 100, max: 800, freq: 1 },
  { title: 'Clothing', category: 'Shopping', min: 500, max: 5000, freq: 1.5 },
  { title: 'Electronics', category: 'Shopping', min: 1000, max: 15000, freq: 0.3 },
  { title: 'Home Supplies', category: 'Shopping', min: 200, max: 1500, freq: 2 },
  { title: 'Gym Membership', category: 'Healthcare', min: 800, max: 2500, freq: 1 },
  { title: 'Books', category: 'Education', min: 200, max: 800, freq: 1 },
  { title: 'Online Course', category: 'Education', min: 500, max: 5000, freq: 0.3 },
];

const INCOME_TEMPLATES = [
  { title: 'Monthly Salary', category: 'Salary', min: 30000, max: 80000, freq: 1 },
  { title: 'Freelance Work', category: 'Freelance', min: 5000, max: 20000, freq: 0.5 },
  { title: 'Investment Returns', category: 'Investment', min: 1000, max: 5000, freq: 0.3 },
];

function randomBetween(min, max) {
  return Math.round(min + Math.random() * (max - min));
}

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

export class TransactionSimulator {
  /**
   * Generate realistic demo transactions
   * @param {number} [months=4] - Number of months of data
   * @returns {Array} transactions compatible with FinanceContext
   */
  generate(months = 4) {
    const transactions = [];
    const now = new Date();

    for (let m = months - 1; m >= 0; m--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - m, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - m + 1, 0);

      // Income
      for (const template of INCOME_TEMPLATES) {
        const count = Math.round(template.freq + (Math.random() - 0.5) * 0.5);
        for (let i = 0; i < count; i++) {
          transactions.push({
            id: crypto.randomUUID(),
            title: template.title,
            amount: randomBetween(template.min, template.max),
            type: 'income',
            category: template.category,
            date: randomDate(monthStart, monthEnd).toISOString().split('T')[0],
          });
        }
      }

      // Expenses
      for (const template of EXPENSE_TEMPLATES) {
        const count = Math.round(template.freq + (Math.random() - 0.5) * template.freq * 0.4);
        for (let i = 0; i < Math.max(0, count); i++) {
          // Add slight monthly variation
          const seasonalMultiplier = 0.85 + Math.random() * 0.3;
          transactions.push({
            id: crypto.randomUUID(),
            title: template.title,
            amount: Math.round(randomBetween(template.min, template.max) * seasonalMultiplier),
            type: 'expense',
            category: template.category,
            date: randomDate(monthStart, monthEnd).toISOString().split('T')[0],
          });
        }
      }

      // Add 1-2 anomalies per month (for AI detection)
      if (Math.random() > 0.4) {
        const anomalyTemplate = EXPENSE_TEMPLATES[Math.floor(Math.random() * EXPENSE_TEMPLATES.length)];
        transactions.push({
          id: crypto.randomUUID(),
          title: anomalyTemplate.title + ' (Large)',
          amount: anomalyTemplate.max * randomBetween(3, 6),
          type: 'expense',
          category: anomalyTemplate.category,
          date: randomDate(monthStart, monthEnd).toISOString().split('T')[0],
        });
      }
    }

    return transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
  }
}

export const transactionSimulator = new TransactionSimulator();
