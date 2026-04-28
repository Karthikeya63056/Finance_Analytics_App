/**
 * AnomalyDetector — Statistical anomaly detection for financial transactions
 *
 * Methods:
 * - Z-score: flags transactions whose amount deviates >2σ from category mean
 * - IQR: flags transactions outside Q1-1.5*IQR .. Q3+1.5*IQR range
 * - Velocity: detects sudden spending spikes in short time windows
 */

export class AnomalyDetector {
  /**
   * Detect anomalies in a transaction set
   * @param {Array} transactions - Full transaction history
   * @param {Object} [options]
   * @returns {Array} Anomalies with { transaction, type, severity, reason, score }
   */
  detect(transactions, options = {}) {
    const {
      zScoreThreshold = 2.0,
      iqrMultiplier = 1.5,
      velocityWindowDays = 7,
      velocityMultiplier = 2.0,
    } = options;

    const expenses = transactions.filter((t) => t.type === 'expense');
    if (expenses.length < 3) return [];

    const anomalies = [];
    const seen = new Set();

    // Run all detectors
    const zAnomalies = this._zScoreDetect(expenses, zScoreThreshold);
    const iqrAnomalies = this._iqrDetect(expenses, iqrMultiplier);
    const velAnomalies = this._velocityDetect(expenses, velocityWindowDays, velocityMultiplier);

    // Merge and deduplicate
    for (const a of [...zAnomalies, ...iqrAnomalies, ...velAnomalies]) {
      const key = `${a.transaction.id}-${a.type}`;
      if (!seen.has(key)) {
        seen.add(key);
        anomalies.push(a);
      }
    }

    return anomalies.sort((a, b) => b.score - a.score);
  }

  /**
   * Z-score anomaly detection per category
   * @private
   */
  _zScoreDetect(expenses, threshold) {
    const anomalies = [];
    const byCategory = this._groupByCategory(expenses);

    for (const [category, txns] of Object.entries(byCategory)) {
      if (txns.length < 3) continue;

      const amounts = txns.map((t) => t.amount);
      const mean = this._mean(amounts);
      const std = this._stdDev(amounts, mean);

      if (std === 0) continue;

      for (const t of txns) {
        const zScore = Math.abs((t.amount - mean) / std);
        if (zScore >= threshold) {
          const severity = zScore >= 3 ? 'high' : zScore >= 2.5 ? 'medium' : 'low';
          anomalies.push({
            transaction: t,
            type: 'zscore',
            severity,
            score: Math.round(zScore * 100) / 100,
            reason: `Amount ₹${t.amount.toLocaleString('en-IN')} is ${zScore.toFixed(1)}σ from the ${category} average of ₹${Math.round(mean).toLocaleString('en-IN')}`,
            category,
            stats: { mean: Math.round(mean), stdDev: Math.round(std), zScore: Math.round(zScore * 100) / 100 },
          });
        }
      }
    }

    return anomalies;
  }

  /**
   * IQR-based outlier detection per category
   * @private
   */
  _iqrDetect(expenses, multiplier) {
    const anomalies = [];
    const byCategory = this._groupByCategory(expenses);

    for (const [category, txns] of Object.entries(byCategory)) {
      if (txns.length < 5) continue;

      const sorted = txns.map((t) => t.amount).sort((a, b) => a - b);
      const q1 = this._percentile(sorted, 25);
      const q3 = this._percentile(sorted, 75);
      const iqr = q3 - q1;

      if (iqr === 0) continue;

      const lower = q1 - multiplier * iqr;
      const upper = q3 + multiplier * iqr;

      for (const t of txns) {
        if (t.amount < lower || t.amount > upper) {
          const deviation = t.amount > upper
            ? (t.amount - upper) / iqr
            : (lower - t.amount) / iqr;

          anomalies.push({
            transaction: t,
            type: 'iqr',
            severity: deviation > 2 ? 'high' : deviation > 1 ? 'medium' : 'low',
            score: Math.round(deviation * 100) / 100,
            reason: `Amount ₹${t.amount.toLocaleString('en-IN')} is an outlier in ${category} (normal range: ₹${Math.round(lower).toLocaleString('en-IN')}–₹${Math.round(upper).toLocaleString('en-IN')})`,
            category,
            stats: { q1: Math.round(q1), q3: Math.round(q3), iqr: Math.round(iqr), lower: Math.round(lower), upper: Math.round(upper) },
          });
        }
      }
    }

    return anomalies;
  }

  /**
   * Velocity-based spike detection
   * @private
   */
  _velocityDetect(expenses, windowDays, multiplier) {
    const anomalies = [];
    if (expenses.length < 5) return anomalies;

    const sorted = [...expenses].sort((a, b) => new Date(a.date) - new Date(b.date));
    const windowMs = windowDays * 86400000;

    // Calculate rolling average daily spend
    const totalDays = Math.max(1,
      (new Date(sorted[sorted.length - 1].date) - new Date(sorted[0].date)) / 86400000
    );
    const avgDailySpend = sorted.reduce((s, t) => s + t.amount, 0) / totalDays;

    if (avgDailySpend === 0) return anomalies;

    // Check each window
    for (let i = 0; i < sorted.length; i++) {
      const windowEnd = new Date(sorted[i].date).getTime() + windowMs;
      let windowTotal = 0;
      let windowCount = 0;

      for (let j = i; j < sorted.length; j++) {
        const txnTime = new Date(sorted[j].date).getTime();
        if (txnTime > windowEnd) break;
        windowTotal += sorted[j].amount;
        windowCount++;
      }

      const windowDailyAvg = windowTotal / windowDays;
      const ratio = windowDailyAvg / avgDailySpend;

      if (ratio >= multiplier && windowCount >= 3) {
        anomalies.push({
          transaction: sorted[i],
          type: 'velocity',
          severity: ratio >= 3 ? 'high' : 'medium',
          score: Math.round(ratio * 100) / 100,
          reason: `Spending spike detected: ₹${Math.round(windowTotal).toLocaleString('en-IN')} in ${windowDays} days (${ratio.toFixed(1)}× your daily average)`,
          category: 'all',
          stats: { windowTotal: Math.round(windowTotal), avgDailySpend: Math.round(avgDailySpend), ratio: Math.round(ratio * 100) / 100 },
        });
        i += windowCount - 1; // Skip processed window
      }
    }

    return anomalies;
  }

  /** @private */
  _groupByCategory(transactions) {
    const groups = {};
    for (const t of transactions) {
      if (!groups[t.category]) groups[t.category] = [];
      groups[t.category].push(t);
    }
    return groups;
  }

  /** @private */
  _mean(arr) {
    return arr.reduce((s, v) => s + v, 0) / arr.length;
  }

  /** @private */
  _stdDev(arr, mean) {
    const m = mean ?? this._mean(arr);
    const variance = arr.reduce((s, v) => s + Math.pow(v - m, 2), 0) / arr.length;
    return Math.sqrt(variance);
  }

  /** @private */
  _percentile(sorted, p) {
    const idx = (p / 100) * (sorted.length - 1);
    const lower = Math.floor(idx);
    const upper = Math.ceil(idx);
    if (lower === upper) return sorted[lower];
    return sorted[lower] + (sorted[upper] - sorted[lower]) * (idx - lower);
  }
}
